import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  brandKits,
  projects,
  campaigns,
  studioRuns,
  creativeAssets,
} from "@/db/schema";
import { getBalance } from "@/lib/credits";
import type { StudioData } from "./types";

export async function ownedCampaign(id: string, userId: string) {
  const [row] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
    .limit(1);
  return row;
}
// Called only after requireSession. Every query has a tenant predicate.
export async function loadStudio(
  userId: string,
  name: string,
): Promise<StudioData> {
  const [brands, projectRows, campaignRows, runs, assets, credits] =
    await Promise.all([
      db
        .select()
        .from(brandKits)
        .where(eq(brandKits.userId, userId))
        .orderBy(desc(brandKits.createdAt)),
      db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(desc(projects.createdAt)),
      db
        .select()
        .from(campaigns)
        .where(eq(campaigns.userId, userId))
        .orderBy(desc(campaigns.createdAt)),
      db
        .select()
        .from(studioRuns)
        .where(eq(studioRuns.userId, userId))
        .orderBy(desc(studioRuns.createdAt))
        .limit(200),
      db
        .select()
        .from(creativeAssets)
        .where(eq(creativeAssets.userId, userId))
        .orderBy(desc(creativeAssets.createdAt)),
      getBalance(userId),
    ]);
  return {
    name,
    credits,
    brands,
    projects: projectRows,
    campaigns: campaignRows.map((r) => ({
      ...r,
      goal: r.goal as StudioData["campaigns"][number]["goal"],
      channel: r.channel as StudioData["campaigns"][number]["channel"],
      createdAt: r.createdAt.toISOString(),
    })),
    runs: runs.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    assets: assets.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  };
}
