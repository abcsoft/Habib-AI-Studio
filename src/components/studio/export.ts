import type { Campaign, CampaignPackage, Asset } from "@/lib/studio/types";

export function downloadText(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportCampaign(
  campaign: Campaign,
  output: CampaignPackage | null,
  assets: Asset[],
  format: "json" | "md",
) {
  const slug =
    campaign.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 70) || "campaign";
  if (format === "json")
    return downloadText(
      JSON.stringify(
        {
          disclosure:
            "AI-assisted content. Review claims, rights and brand accuracy before publishing.",
          campaign,
          creativePackage: output,
          assets,
        },
        null,
        2,
      ),
      `${slug}.json`,
      "application/json",
    );
  const sections = output
    ? Object.entries(output)
        .map(
          ([key, value]) =>
            `## ${key.replace(/([A-Z])/g, " $1")}\n\n${Array.isArray(value) ? value.map((v) => (typeof v === "string" ? `- ${v}` : `- **${v.title}**: ${v.description}`)).join("\n") : value}`,
        )
        .join("\n\n")
    : "No creative package generated yet.";
  downloadText(
    `# ${campaign.name}\n\n${campaign.product}\n\nGoal: ${campaign.goal}\nChannel: ${campaign.channel}\n\n${sections}\n\n## Images\n\n${assets.map((a) => `- ${a.imageUrl}\n  Prompt: ${a.prompt}`).join("\n")}\n\nAI-assisted content. Review before publishing.`,
    `${slug}.md`,
    "text/markdown",
  );
}
