"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  brandKits,
  projects,
  campaigns,
  studioRuns,
  creativeAssets,
  generations,
} from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import {
  InsufficientCreditsError,
  spendCredits,
  refundCredits,
} from "@/lib/credits";
import { limitGeneration } from "@/lib/rate-limit";
import {
  generateCampaign,
  ClaudeOutputError,
  PROMPT_VERSION,
} from "@/lib/ai/claude";
import { getImageProvider } from "@/lib/ai/provider";
import { storeGeneratedImage } from "@/lib/ai/storage";
import { ownedCampaign } from "@/lib/studio/data";
import {
  brandSchema,
  campaignSchema,
  projectSchema,
  type ActionResult,
} from "@/lib/studio/types";
import { CAMPAIGN_COST_CREDITS, GENERATION_COST_CREDITS } from "@/config/plans";

function refreshStudio() {
  revalidatePath("/", "layout");
}
const invalid = {
  ok: false,
  error: "Please check all required fields.",
} as const;

export async function createBrandAction(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) return invalid;
  const [row] = await db
    .insert(brandKits)
    .values({ ...parsed.data, userId: session.user.id })
    .returning({ id: brandKits.id });
  refreshStudio();
  return { ok: true, id: row.id };
}
export async function createProjectAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return invalid;
  const [row] = await db
    .insert(projects)
    .values({ ...parsed.data, userId: session.user.id })
    .returning({ id: projects.id });
  refreshStudio();
  return { ok: true, id: row.id };
}
export async function createCampaignAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) return invalid;
  const userId = session.user.id;
  const [brand, project] = await Promise.all([
    db
      .select({ id: brandKits.id })
      .from(brandKits)
      .where(
        and(
          eq(brandKits.id, parsed.data.brandKitId),
          eq(brandKits.userId, userId),
        ),
      )
      .limit(1),
    db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.id, parsed.data.projectId),
          eq(projects.userId, userId),
        ),
      )
      .limit(1),
  ]);
  if (!brand.length || !project.length)
    return {
      ok: false,
      error: "Choose a brand and project in your workspace.",
    };
  const [row] = await db
    .insert(campaigns)
    .values({ ...parsed.data, userId })
    .returning({ id: campaigns.id });
  refreshStudio();
  return { ok: true, id: row.id };
}
export async function saveCampaignAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireSession();
  const id = z.uuid().safeParse(input);
  if (!id.success) return invalid;
  const campaign = await ownedCampaign(id.data, session.user.id);
  if (!campaign) return { ok: false, error: "Campaign not found." };
  await db
    .update(campaigns)
    .set({ status: "saved" })
    .where(
      and(eq(campaigns.id, id.data), eq(campaigns.userId, session.user.id)),
    );
  refreshStudio();
  return { ok: true, id: id.data };
}

const runSchema = z.object({
  campaignId: z.uuid(),
  requestId: z.uuid(),
  kind: z.enum(["campaign", "image"]),
  prompt: z.string().trim().max(4000).optional(),
});
export async function generateStudioAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = runSchema.safeParse(input);
  if (!parsed.success) return invalid;
  const args = parsed.data,
    userId = session.user.id;
  const campaign = await ownedCampaign(args.campaignId, userId);
  if (!campaign) return { ok: false, error: "Campaign not found." };
  const [brand] = await db
    .select()
    .from(brandKits)
    .where(
      and(eq(brandKits.id, campaign.brandKitId), eq(brandKits.userId, userId)),
    )
    .limit(1);
  if (!brand) return { ok: false, error: "Brand not found." };
  if (
    !env.AI_MOCK &&
    !(args.kind === "campaign" ? env.ANTHROPIC_API_KEY : env.AI_GATEWAY_API_KEY)
  ) {
    return {
      ok: false,
      error: `${args.kind === "campaign" ? "Claude" : "Image rendering"} is awaiting provider setup. No credits were used. Try the public demo in the meantime.`,
    };
  }
  const prompt =
    args.kind === "campaign"
      ? JSON.stringify({
          brand: {
            name: brand.name,
            industry: brand.industry,
            voice: brand.voice,
            audience: brand.audience,
            colors: brand.colors,
          },
          product: campaign.product,
          goal: campaign.goal,
          channel: campaign.channel,
        })
      : (args.prompt ?? "");
  if (args.kind === "image" && prompt.length < 10)
    return {
      ok: false,
      error: "Enter an image prompt of at least 10 characters.",
    };
  const [existing] = await db
    .select()
    .from(studioRuns)
    .where(
      and(
        eq(studioRuns.userId, userId),
        eq(studioRuns.requestId, args.requestId),
      ),
    )
    .limit(1);
  if (existing) return replay(existing, args.campaignId, args.kind, prompt);
  if (!(await limitGeneration(userId)).success)
    return {
      ok: false,
      error: "You've reached the generation rate limit. Try again in a minute.",
    };
  const id = crypto.randomUUID(),
    cost =
      args.kind === "campaign"
        ? CAMPAIGN_COST_CREDITS
        : GENERATION_COST_CREDITS;
  const model =
    args.kind === "campaign"
      ? env.AI_MOCK
        ? "mock/claude"
        : env.ANTHROPIC_MODEL
      : getImageProvider().modelId;
  const [run] = await db
    .insert(studioRuns)
    .values({
      id,
      userId,
      campaignId: campaign.id,
      requestId: args.requestId,
      kind: args.kind,
      model,
      prompt,
      credits: cost,
      promptVersion: PROMPT_VERSION,
    })
    .onConflictDoNothing()
    .returning();
  if (!run) {
    const [previous] = await db
      .select()
      .from(studioRuns)
      .where(
        and(
          eq(studioRuns.userId, userId),
          eq(studioRuns.requestId, args.requestId),
        ),
      )
      .limit(1);
    return previous
      ? replay(previous, args.campaignId, args.kind, prompt)
      : { ok: false, error: "Could not start generation. Try again." };
  }
  const ref = { type: "studio_run", id };
  try {
    await spendCredits({ userId, amount: cost, ref });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      await db
        .update(studioRuns)
        .set({ status: "failed", errorCode: "insufficient_credits" })
        .where(eq(studioRuns.id, id));
      refreshStudio();
      return {
        ok: false,
        error: "Not enough credits. Add credits in Billing to continue.",
      };
    }
    // A lost commit acknowledgement keeps a pending row for reconciliation.
    throw error;
  }
  const started = Date.now();
  try {
    if (args.kind === "campaign") {
      const result = await generateCampaign({
        brand,
        product: campaign.product,
        goal: campaign.goal,
        channel: campaign.channel,
      });
      await db
        .update(studioRuns)
        .set({
          status: "completed",
          output: result.output,
          model: result.model,
          providerRequestId: result.requestId,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          cacheReadTokens: result.cacheReadTokens,
          cacheCreationTokens: result.cacheCreationTokens,
          durationMs: Date.now() - started,
        })
        .where(eq(studioRuns.id, id));
    } else {
      await db.insert(generations).values({ id, userId, prompt, model });
      const result = await getImageProvider().generateImage({ prompt, userId });
      const url = await storeGeneratedImage({
        generationId: id,
        url: result.url,
      });
      await db.transaction(async (tx) => {
        await tx
          .update(generations)
          .set({ status: "completed", imageUrl: url, model: result.model })
          .where(eq(generations.id, id));
        await tx.insert(creativeAssets).values({
          userId,
          campaignId: campaign.id,
          runId: id,
          imageUrl: url,
          prompt,
          model: result.model,
        });
        await tx
          .update(studioRuns)
          .set({
            status: "completed",
            model: result.model,
            durationMs: Date.now() - started,
          })
          .where(eq(studioRuns.id, id));
      });
    }
  } catch (error) {
    const usage = error instanceof ClaudeOutputError ? error.usage : undefined;
    await db
      .update(studioRuns)
      .set({
        status: "failed",
        errorCode: "provider_or_storage_failed",
        durationMs: Date.now() - started,
        ...(usage
          ? {
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
              cacheReadTokens: usage.cacheReadTokens,
              cacheCreationTokens: usage.cacheCreationTokens,
              providerRequestId: usage.requestId,
              model: usage.model,
            }
          : {}),
      })
      .where(eq(studioRuns.id, id));
    if (args.kind === "image")
      await db
        .update(generations)
        .set({ status: "failed" })
        .where(eq(generations.id, id));
    try {
      await refundCredits({ userId, ref });
      await db
        .update(studioRuns)
        .set({ refunded: true })
        .where(eq(studioRuns.id, id));
    } catch {
      await db
        .update(studioRuns)
        .set({ errorCode: "refund_pending" })
        .where(eq(studioRuns.id, id));
      console.error(`[studio] Refund requires reconciliation for run ${id}`);
      refreshStudio();
      return {
        ok: false,
        error:
          "Generation failed. Your refund is pending; contact support with the run ID in History.",
      };
    }
    refreshStudio();
    return {
      ok: false,
      error:
        "Generation couldn't be completed. Your credits have been refunded. Please try again.",
    };
  }
  refreshStudio();
  return { ok: true, id };
}
function replay(
  run: typeof studioRuns.$inferSelect,
  campaignId: string,
  kind: string,
  prompt: string,
): ActionResult {
  if (
    run.campaignId !== campaignId ||
    run.kind !== kind ||
    run.prompt !== prompt
  )
    return {
      ok: false,
      error: "This request ID was used for different input.",
    };
  if (run.status === "completed") return { ok: true, id: run.id };
  return {
    ok: false,
    error:
      run.status === "pending"
        ? "This generation is already in progress. Check History before retrying."
        : "This request failed previously. Start a new generation to try again.",
  };
}
