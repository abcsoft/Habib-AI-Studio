import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const config = vi.hoisted(() => ({
  AI_MOCK: false,
  ANTHROPIC_API_KEY: "unit-test-key",
  ANTHROPIC_MODEL: "claude-sonnet-4-6",
}));
vi.mock("@/lib/env", () => ({ env: config }));
import { generateCampaign, ClaudeOutputError } from "./claude";
import { demoBrands, demoPackage } from "@/lib/studio/demo";
const input = {
  brand: demoBrands[0],
  product: "Daily glow serum",
  goal: "Drive sales",
  channel: "Instagram & Facebook",
};
const output = demoPackage(
  input.brand,
  input.product,
  input.goal,
  input.channel,
);
const response = {
  id: "msg_test",
  model: "claude-sonnet-4-6",
  stop_reason: "end_turn",
  content: [{ type: "text", text: JSON.stringify(output) }],
  usage: {
    input_tokens: 234,
    output_tokens: 801,
    cache_read_input_tokens: 12,
    cache_creation_input_tokens: 3,
  },
};
beforeEach(() => {
  config.AI_MOCK = false;
  config.ANTHROPIC_API_KEY = "unit-test-key";
});
afterEach(() => vi.unstubAllGlobals());
describe("Claude Messages integration", () => {
  it("sends a server-only structured request, omits account metadata and tracks provider usage", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(response), {
        headers: { "request-id": "req_abc" },
      }),
    );
    vi.stubGlobal("fetch", fetch);
    const result = await generateCampaign(input);
    expect(result).toMatchObject({
      output,
      inputTokens: 234,
      outputTokens: 801,
      cacheReadTokens: 12,
      cacheCreationTokens: 3,
      requestId: "req_abc",
    });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(options.headers["x-api-key"]).toBe("unit-test-key");
    const body = JSON.parse(options.body);
    expect(body.output_config.format.type).toBe("json_schema");
    expect(body.output_config.format.schema.additionalProperties).toBe(false);
    expect(body.system).toContain("NEVER render images");
    expect(JSON.parse(body.messages[0].content).brand).not.toHaveProperty("id");
    expect(body.messages[0].content).not.toContain("unit-test-key");
  });
  it("rejects incomplete output and preserves billed token metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ ...response, stop_reason: "max_tokens" }),
          ),
        ),
    );
    await expect(generateCampaign(input)).rejects.toMatchObject({
      usage: { inputTokens: 234, outputTokens: 801 },
    });
  });
  it("rejects malformed output rather than inventing a successful package", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ...response,
            content: [{ type: "text", text: "{}" }],
          }),
        ),
      ),
    );
    await expect(generateCampaign(input)).rejects.toBeInstanceOf(
      ClaudeOutputError,
    );
  });
  it("fails cleanly on provider error and without credentials", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response("secret-bearing provider error", { status: 429 }),
      );
    vi.stubGlobal("fetch", fetch);
    await expect(generateCampaign(input)).rejects.toThrow(
      "Anthropic request failed (429)",
    );
    config.ANTHROPIC_API_KEY = "";
    await expect(generateCampaign(input)).rejects.toThrow("not configured");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("offline mocks never make a network call", async () => {
    config.AI_MOCK = true;
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect((await generateCampaign(input)).inputTokens).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
  });
});
