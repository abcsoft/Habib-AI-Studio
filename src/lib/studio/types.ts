import { z } from "zod";

export const goals = [
  "Brand awareness",
  "Drive sales",
  "Generate leads",
  "Product launch",
] as const;
export const channels = [
  "Instagram & Facebook",
  "Google Ads",
  "LinkedIn",
  "TikTok",
] as const;
export const brandSchema = z.object({
  name: z.string().trim().min(2).max(100),
  industry: z.string().trim().min(2).max(100),
  audience: z.string().trim().min(5).max(1000),
  voice: z.string().trim().min(3).max(500),
  colors: z
    .string()
    .trim()
    .max(150)
    .regex(
      /^#[0-9a-fA-F]{6}(\s*,\s*#[0-9a-fA-F]{6}){0,4}$/,
      "Enter up to five hex colors, separated by commas",
    ),
});
export const projectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000),
});
export const campaignSchema = z.object({
  name: z.string().trim().min(3).max(120),
  product: z.string().trim().min(10).max(2500),
  projectId: z.uuid(),
  brandKitId: z.uuid(),
  goal: z.enum(goals),
  channel: z.enum(channels),
});
// Keep API JSON grammar simple; bounded business inputs are validated separately.
export const packageSchema = z
  .object({
    strategy: z.string(),
    audienceAnalysis: z.string(),
    brandVoice: z.string(),
    hooks: z.array(z.string()),
    headlines: z.array(z.string()),
    adCopy: z.array(z.string()),
    concepts: z.array(z.object({ title: z.string(), description: z.string() })),
    creativeBrief: z.string(),
    visualDirection: z.string(),
    imagePrompts: z.array(z.string()),
    callToAction: z.string(),
  })
  .strict();
export type CampaignPackage = z.infer<typeof packageSchema>;
export type Brand = z.infer<typeof brandSchema> & { id: string };
export type Project = z.infer<typeof projectSchema> & { id: string };
export type Campaign = z.infer<typeof campaignSchema> & {
  id: string;
  status: string;
  createdAt: string;
};
export type Run = {
  id: string;
  campaignId: string;
  kind: string;
  model: string;
  status: string;
  output: CampaignPackage | null;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  credits: number;
  providerRequestId: string | null;
  promptVersion: string;
  durationMs: number | null;
  errorCode: string | null;
  refunded: boolean;
  createdAt: string;
};
export type Asset = {
  id: string;
  campaignId: string;
  imageUrl: string;
  prompt: string;
  model: string;
  createdAt: string;
};
export type StudioData = {
  name: string;
  credits: number;
  brands: Brand[];
  projects: Project[];
  campaigns: Campaign[];
  runs: Run[];
  assets: Asset[];
};
export type StudioView =
  | "dashboard"
  | "projects"
  | "campaigns"
  | "brands"
  | "creatives"
  | "history"
  | "usage"
  | "new"
  | "campaign"
  | "billing";
export type ActionResult =
  { ok: true; id: string } | { ok: false; error: string };
