import Link from "next/link";
import { Sparkles } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-mark" aria-label="Habib AI Studio home">
      <span className="brand-symbol">
        <Sparkles size={21} strokeWidth={1.7} />
      </span>
      <span>
        Habib<span className="brand-light"> AI Studio</span>
        {!compact && (
          <span className="brand-dot" aria-hidden="true">
            ✦
          </span>
        )}
      </span>
    </Link>
  );
}
