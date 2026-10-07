import { notFound } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { ownedCampaign } from "@/lib/studio/data";
import { StudioPage } from "@/components/studio/studio-page";
export const metadata = { title: "Campaign workspace" };
export const maxDuration = 180;
export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession(),
    { id } = await params;
  if (
    !z.uuid().safeParse(id).success ||
    !(await ownedCampaign(id, session.user.id))
  )
    notFound();
  return <StudioPage view="campaign" campaignId={id} />;
}
