import { StudioPage } from "@/components/studio/studio-page";
export const metadata = { title: "New campaign" };
export const maxDuration = 180;
export default function NewCampaign() {
  return <StudioPage view="new" />;
}
