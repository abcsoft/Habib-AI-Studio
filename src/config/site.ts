// Site-wide constants. The GitHub link renders without a live star count
// until the repo is public — fetching the real count is an M7 README-polish
// task.
export const siteConfig = {
  name: "Habib AI Studio",
  description:
    "Turn your next big idea into a campaign. Brand-aware strategy, ad copy, and visual creatives in one AI studio.",
  /** Canonical production URL — set to your deployment before launch. */
  url: "https://mdhabiburrahman.xyz",
  github: "https://github.com/nikandr-surkov/ai-saas-starter",
  /** The paid multi-provider version. One link, no upsell copy. */
  pro: "https://nikandr.com",
} as const;
