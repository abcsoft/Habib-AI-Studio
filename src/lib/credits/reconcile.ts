import { and, eq, lt, or } from "drizzle-orm";
import { db } from "@/db";
import { creditTransactions, studioRuns, generations } from "@/db/schema";
import { refundCredits } from "./index";

// Operator maintenance only. Runs time out at 90s; a 15-minute grace period
// protects in-flight work while recovering interrupted charges. Refunds are
// idempotent so concurrent/replayed cron requests cannot over-credit a user.
export async function reconcileStudioRuns(now = new Date()) {
  const staleBefore = new Date(now.getTime() - 15 * 60 * 1000);
  const rows = await db
    .select()
    .from(studioRuns)
    .where(
      and(
        eq(studioRuns.refunded, false),
        lt(studioRuns.updatedAt, staleBefore),
        or(
          eq(studioRuns.status, "pending"),
          and(
            eq(studioRuns.status, "failed"),
            or(
              eq(studioRuns.errorCode, "refund_pending"),
              eq(studioRuns.errorCode, "provider_or_storage_failed"),
            ),
          ),
        ),
      ),
    )
    .limit(100);
  let recovered = 0,
    errors = 0;
  for (const row of rows) {
    try {
      const [spend] = await db
        .select({ id: creditTransactions.id })
        .from(creditTransactions)
        .where(
          and(
            eq(creditTransactions.userId, row.userId),
            eq(creditTransactions.idempotencyKey, `spend_${row.id}`),
          ),
        )
        .limit(1);
      if (spend)
        await refundCredits({
          userId: row.userId,
          ref: { type: "studio_run", id: row.id },
        });
      await db
        .update(studioRuns)
        .set({
          status: "failed",
          refunded: Boolean(spend),
          errorCode: !spend
            ? "no_charge_interrupted"
            : row.status === "pending"
              ? "interrupted_generation"
              : row.errorCode === "refund_pending"
                ? "provider_or_storage_failed"
                : row.errorCode,
        })
        .where(eq(studioRuns.id, row.id));
      if (row.kind === "image")
        await db
          .update(generations)
          .set({ status: "failed" })
          .where(eq(generations.id, row.id));
      recovered++;
    } catch {
      errors++;
      console.error(`[reconcile] Failed to reconcile studio run ${row.id}`);
    }
  }
  return { inspected: rows.length, recovered, errors };
}
