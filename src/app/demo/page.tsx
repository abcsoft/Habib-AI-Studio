import { z } from "zod";
import { StudioWorkspace } from "@/components/studio/studio-workspace";
import { createDemoData } from "@/lib/studio/demo";
export const metadata = {
  title: "Explore the studio",
  robots: { index: false },
};
const viewSchema = z
  .enum([
    "dashboard",
    "projects",
    "campaigns",
    "brands",
    "creatives",
    "history",
    "usage",
    "new",
    "campaign",
    "billing",
  ])
  .catch("dashboard");
export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; id?: string }>;
}) {
  const params = await searchParams;
  return (
    <StudioWorkspace
      demo
      initialData={createDemoData()}
      view={viewSchema.parse(params.view)}
      campaignId={params.id}
    />
  );
}
