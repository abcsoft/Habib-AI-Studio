import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, expect, it } from "vitest";
import { db } from "@/db";
import { users, brandKits, projects, campaigns, studioRuns } from "@/db/schema";
import { ensureTestDatabase, closeDb } from "@/test/db";
import { getBalance, grantCredits, spendCredits } from "./index";
import { reconcileStudioRuns } from "./reconcile";
import { demoBrands } from "@/lib/studio/demo";
beforeAll(ensureTestDatabase, 60000);
afterAll(closeDb);
it("recovers a stale committed spend exactly once and leaves fresh jobs alone", async () => {
  const userId = `reconcile_${randomUUID()}`,
    runId = randomUUID(),
    freshId = randomUUID();
  await db
    .insert(users)
    .values({ id: userId, name: "Reconcile", email: `${userId}@test.local` });
  await grantCredits({
    userId,
    amount: 10,
    type: "admin_adjust",
    idempotencyKey: randomUUID(),
  });
  const [brand] = await db
    .insert(brandKits)
    .values({ ...demoBrands[0], id: randomUUID(), userId })
    .returning();
  const [project] = await db
    .insert(projects)
    .values({ userId, name: "Recovery", description: "Test" })
    .returning();
  const [campaign] = await db
    .insert(campaigns)
    .values({
      userId,
      name: "Recovery",
      product: "Recovery test product",
      goal: "Drive sales",
      channel: "Google Ads",
      projectId: project.id,
      brandKitId: brand.id,
    })
    .returning();
  await db.insert(studioRuns).values([
    {
      id: runId,
      userId,
      campaignId: campaign.id,
      requestId: randomUUID(),
      kind: "campaign",
      model: "mock",
      prompt: "Test",
      credits: 3,
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
    },
    {
      id: freshId,
      userId,
      campaignId: campaign.id,
      requestId: randomUUID(),
      kind: "campaign",
      model: "mock",
      prompt: "Test",
      credits: 3,
    },
  ]);
  await spendCredits({
    userId,
    amount: 3,
    ref: { type: "studio_run", id: runId },
  });
  expect(await getBalance(userId)).toBe(7);
  await reconcileStudioRuns();
  await reconcileStudioRuns();
  expect(await getBalance(userId)).toBe(10);
  const [stale] = await db
    .select()
    .from(studioRuns)
    .where(eq(studioRuns.id, runId));
  expect(stale).toMatchObject({
    status: "failed",
    refunded: true,
    errorCode: "interrupted_generation",
  });
  const [fresh] = await db
    .select()
    .from(studioRuns)
    .where(eq(studioRuns.id, freshId));
  expect(fresh.status).toBe("pending");
});
