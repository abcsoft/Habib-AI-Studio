import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Colored plates are BOLD role (Dark Mode v2): bright in both themes,
// icon strokes in the fixed dark token. Cream stays neutral/inherit.
const colors = {
  cream: "bg-background",
  yellow: "bg-pop-yellow-bold text-ink-deep",
  mint: "bg-pop-mint-bold text-ink-deep",
  sky: "bg-pop-sky-bold text-ink-deep",
  pink: "bg-pop-pink-bold text-ink-deep",
  orange: "bg-pop-orange-bold text-ink-deep",
} as const;

// v4.3 icon chip — the standard marketing list marker (DESIGN.md):
// small bordered square, panel-color bg, lucide icon in ink stroke.
// Plain ✓/·/— glyphs are banned in marketing lists.
export function IconChip({
  icon: Icon,
  color = "cream",
  className,
}: {
  icon: LucideIcon;
  color?: keyof typeof colors;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-[8px] border-2 shadow-hard-sm",
        colors[color],
        className,
      )}
    >
      <Icon aria-hidden strokeWidth={2.5} className="size-4.5" />
    </span>
  );
}
