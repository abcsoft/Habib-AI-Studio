import { StudioShell } from "@/components/studio/studio-shell";
import { requireSession } from "@/lib/auth/session";
import { getBalance } from "@/lib/credits";
import { env } from "@/lib/env";
export const metadata = { robots: { index: false, follow: false } };
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const credits = await getBalance(session.user.id);
  return (
    <StudioShell
      name={session.user.name}
      email={session.user.email}
      credits={credits}
    >
      {env.AI_MOCK && (
        <div className="development-notice">
          Development mock mode: campaign and image calls are simulated.
          Production refuses this mode.
        </div>
      )}
      {children}
    </StudioShell>
  );
}
