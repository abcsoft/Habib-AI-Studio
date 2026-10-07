import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { reconcileStudioRuns } from "@/lib/credits/reconcile";
export const maxDuration = 60;
export async function GET(request: Request) {
  if (!env.CRON_SECRET)
    return Response.json(
      { error: "Maintenance is not configured" },
      { status: 503 },
    );
  const supplied = Buffer.from(request.headers.get("authorization") ?? ""),
    expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const result = await reconcileStudioRuns();
  return Response.json(result, {
    status: result.errors ? 500 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
