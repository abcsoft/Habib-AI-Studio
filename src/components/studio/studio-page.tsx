import { requireSession } from "@/lib/auth/session";
import { loadStudio } from "@/lib/studio/data";
import { StudioWorkspace } from "./studio-workspace";
import type { StudioView } from "@/lib/studio/types";
export async function StudioPage({
  view,
  campaignId,
}: {
  view: StudioView;
  campaignId?: string;
}) {
  const session = await requireSession();
  const data = await loadStudio(session.user.id, session.user.name);
  return (
    <StudioWorkspace initialData={data} view={view} campaignId={campaignId} />
  );
}
