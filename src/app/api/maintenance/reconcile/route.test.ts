import { beforeEach, describe, expect, it, vi } from "vitest";
const config = vi.hoisted(() => ({
  CRON_SECRET: "test-maintenance-secret-test-maintenance" as string | undefined,
}));
const reconcile = vi.hoisted(() => vi.fn());
vi.mock("@/lib/env", () => ({ env: config }));
vi.mock("@/lib/credits/reconcile", () => ({ reconcileStudioRuns: reconcile }));
import { GET } from "./route";
beforeEach(() => {
  config.CRON_SECRET = "test-maintenance-secret-test-maintenance";
  reconcile.mockReset();
  reconcile.mockResolvedValue({ inspected: 2, recovered: 2, errors: 0 });
});
describe("maintenance authorization", () => {
  it("rejects missing and incorrect bearer secrets without accessing credit recovery", async () => {
    for (const authorization of [
      "",
      "Bearer wrong",
      `Bearer ${"x".repeat(config.CRON_SECRET!.length)}`,
    ]) {
      expect(
        (
          await GET(
            new Request("https://studio.test/api/maintenance/reconcile", {
              headers: { authorization },
            }),
          )
        ).status,
      ).toBe(401);
    }
    expect(reconcile).not.toHaveBeenCalled();
  });
  it("disables maintenance when no secret is configured", async () => {
    config.CRON_SECRET = undefined;
    expect(
      (await GET(new Request("https://studio.test/api/maintenance/reconcile")))
        .status,
    ).toBe(503);
    expect(reconcile).not.toHaveBeenCalled();
  });
  it("returns uncached recovery results only after authorization", async () => {
    const response = await GET(
      new Request("https://studio.test/api/maintenance/reconcile", {
        headers: { authorization: `Bearer ${config.CRON_SECRET}` },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({
      inspected: 2,
      recovered: 2,
      errors: 0,
    });
    expect(reconcile).toHaveBeenCalledOnce();
  });
  it("surfaces incomplete recovery as a scheduler failure", async () => {
    reconcile.mockResolvedValue({ inspected: 2, recovered: 1, errors: 1 });
    expect(
      (
        await GET(
          new Request("https://studio.test/api/maintenance/reconcile", {
            headers: { authorization: `Bearer ${config.CRON_SECRET}` },
          }),
        )
      ).status,
    ).toBe(500);
  });
});
