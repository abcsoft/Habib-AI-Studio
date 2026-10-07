import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
let currentUserId = "";
vi.mock("@/lib/auth/session", () => ({
  requireSession: vi.fn(async () => ({
    user: { id: currentUserId, name: "Studio Test" },
  })),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
const providerGenerate = vi.fn();
vi.mock("@/lib/ai/provider", () => ({
  getImageProvider: () => ({
    modelId: "mock/image",
    generateImage: providerGenerate,
  }),
}));
vi.mock("@/lib/ai/storage", () => ({
  storeGeneratedImage: async ({ generationId }: { generationId: string }) =>
    `/api/images/${generationId}.svg`,
}));
import { db } from "@/db";
import {
  users,
  studioRuns,
  campaigns,
  creativeAssets,
  projects,
} from "@/db/schema";
import { grantCredits, getBalance, getHistory } from "@/lib/credits";
import { closeDb, ensureTestDatabase } from "@/test/db";
import { requireSession } from "@/lib/auth/session";
import {
  createBrandAction,
  createProjectAction,
  createCampaignAction,
  generateStudioAction,
  saveCampaignAction,
} from "./studio-actions";
import { demoBrands } from "@/lib/studio/demo";
beforeAll(ensureTestDatabase, 60000);
afterAll(closeDb);
beforeEach(async () => {
  currentUserId = `studio_${randomUUID()}`;
  await db.insert(users).values({
    id: currentUserId,
    name: "Studio Test",
    email: `${currentUserId}@test.local`,
  });
  await grantCredits({
    userId: currentUserId,
    amount: 10,
    type: "admin_adjust",
    idempotencyKey: `setup_${currentUserId}`,
  });
  providerGenerate.mockReset().mockResolvedValue({
    url: "data:image/svg+xml;base64,PHN2Zy8+",
    width: 1024,
    height: 1024,
    model: "mock/image",
  });
});
async function fixture(product = "A thoughtful daily glow serum") {
  const brand = await createBrandAction(demoBrands[0]);
  const project = await createProjectAction({
    name: "Launch project",
    description: "A thoughtful product launch",
  });
  if (!brand.ok || !project.ok) throw new Error("Fixture creation failed");
  const campaign = await createCampaignAction({
    name: "Daily glow launch",
    product,
    brandKitId: brand.id,
    projectId: project.id,
    goal: "Product launch",
    channel: "Instagram & Facebook",
  });
  if (!campaign.ok) throw new Error("Campaign fixture creation failed");
  return {
    id: campaign.id,
    brandId: brand.id,
    projectId: project.id,
    userId: currentUserId,
  };
}
describe("studio money paths and authorization", () => {
  it("creates a campaign, generates a package, saves it, and persists audit metadata", async () => {
    const f = await fixture();
    const result = await generateStudioAction({
      campaignId: f.id,
      kind: "campaign",
      requestId: randomUUID(),
    });
    expect(result.ok).toBe(true);
    expect(await getBalance(currentUserId)).toBe(7);
    const [run] = await db
      .select()
      .from(studioRuns)
      .where(eq(studioRuns.campaignId, f.id));
    expect(run.output?.hooks).toHaveLength(3);
    expect(run.promptVersion).toBe("habib-campaign-v1");
    expect(run.providerRequestId).toBeTruthy();
    expect(run.status).toBe("completed");
    expect(await saveCampaignAction(f.id)).toMatchObject({ ok: true });
    const [c] = await db.select().from(campaigns).where(eq(campaigns.id, f.id));
    expect(c.status).toBe("saved");
  });
  it("replaying an identical request charges exactly once, including concurrent requests", async () => {
    const f = await fixture(),
      args = { campaignId: f.id, kind: "campaign", requestId: randomUUID() };
    const results = await Promise.all([
      generateStudioAction(args),
      generateStudioAction(args),
    ]);
    expect(results.some((r) => r.ok)).toBe(true);
    expect(await getBalance(currentUserId)).toBe(7);
    expect((await generateStudioAction(args)).ok).toBe(true);
    expect(
      (await getHistory(currentUserId)).filter((r) => r.type === "spend"),
    ).toHaveLength(1);
  });
  it("cannot use a request ID for different inputs", async () => {
    const f = await fixture(),
      args = { campaignId: f.id, kind: "campaign", requestId: randomUUID() };
    await generateStudioAction(args);
    expect(
      await generateStudioAction({
        ...args,
        kind: "image",
        prompt: "A completely different product image",
      }),
    ).toMatchObject({
      ok: false,
      error: expect.stringContaining("different input"),
    });
    expect(await getBalance(currentUserId)).toBe(7);
  });
  it("refunds failed Claude calls and keeps a failed audit record", async () => {
    const f = await fixture("FAIL simulated provider failure");
    const result = await generateStudioAction({
      campaignId: f.id,
      kind: "campaign",
      requestId: randomUUID(),
    });
    expect(result).toMatchObject({
      ok: false,
      error: expect.stringContaining("refunded"),
    });
    expect(await getBalance(currentUserId)).toBe(10);
    const [run] = await db
      .select()
      .from(studioRuns)
      .where(eq(studioRuns.campaignId, f.id));
    expect(run).toMatchObject({ status: "failed", refunded: true });
  });
  it("renders images independently and records their assets", async () => {
    const f = await fixture();
    await generateStudioAction({
      campaignId: f.id,
      kind: "image",
      prompt: "A serum on a warm pink stone plinth",
      requestId: randomUUID(),
    });
    expect(providerGenerate).toHaveBeenCalledOnce();
    expect(await getBalance(currentUserId)).toBe(9);
    const [asset] = await db
      .select()
      .from(creativeAssets)
      .where(eq(creativeAssets.campaignId, f.id));
    expect(asset.model).toBe("mock/image");
  });
  it("refunds an image provider failure", async () => {
    const f = await fixture();
    providerGenerate.mockRejectedValueOnce(new Error("Provider unavailable"));
    expect(
      (
        await generateStudioAction({
          campaignId: f.id,
          kind: "image",
          prompt: "A serum on a warm pink stone plinth",
          requestId: randomUUID(),
        })
      ).ok,
    ).toBe(false);
    expect(await getBalance(currentUserId)).toBe(10);
  });
  it("refuses insufficient credits before calling a provider", async () => {
    const f = await fixture();
    const { spendCredits } = await import("@/lib/credits");
    await spendCredits({
      userId: currentUserId,
      amount: 10,
      ref: { type: "test", id: randomUUID() },
    });
    expect(
      await generateStudioAction({
        campaignId: f.id,
        kind: "image",
        prompt: "A serum on a warm pink stone plinth",
        requestId: randomUUID(),
      }),
    ).toMatchObject({
      ok: false,
      error: expect.stringContaining("Not enough credits"),
    });
    expect(providerGenerate).not.toHaveBeenCalled();
  });
  it("blocks cross-tenant campaign generation, saving, and foreign project references", async () => {
    const f = await fixture();
    currentUserId = `other_${randomUUID()}`;
    await db.insert(users).values({
      id: currentUserId,
      name: "Other",
      email: `${currentUserId}@test.local`,
    });
    expect(await saveCampaignAction(f.id)).toMatchObject({ ok: false });
    expect(
      await generateStudioAction({
        campaignId: f.id,
        kind: "campaign",
        requestId: randomUUID(),
      }),
    ).toMatchObject({ ok: false, error: "Campaign not found." });
    expect(
      await createCampaignAction({
        name: "Foreign campaign",
        product: "An unauthorized serum campaign",
        brandKitId: f.brandId,
        projectId: f.projectId,
        goal: "Drive sales",
        channel: "Google Ads",
      }),
    ).toMatchObject({ ok: false });
  });
  it("validates external inputs without writing data or spending", async () => {
    expect(
      await createProjectAction({ name: "", description: "" }),
    ).toMatchObject({ ok: false });
    expect(
      await createBrandAction({
        ...demoBrands[0],
        colors: "url(javascript:alert(1))",
      }),
    ).toMatchObject({ ok: false });
    expect(await generateStudioAction({ campaignId: "invalid" })).toMatchObject(
      { ok: false },
    );
    expect(await getBalance(currentUserId)).toBe(10);
  });
  it("requires a session for each mutation", async () => {
    vi.mocked(requireSession).mockRejectedValueOnce(
      new Error("redirect-login"),
    );
    await expect(
      createProjectAction({ name: "Test", description: "" }),
    ).rejects.toThrow("redirect-login");
  });
  it("account deletion cascades through all workspace rows", async () => {
    const f = await fixture();
    await db.delete(users).where(eq(users.id, currentUserId));
    expect(
      await db.select().from(projects).where(eq(projects.id, f.projectId)),
    ).toHaveLength(0);
    expect(
      await db.select().from(campaigns).where(eq(campaigns.id, f.id)),
    ).toHaveLength(0);
  });
});
