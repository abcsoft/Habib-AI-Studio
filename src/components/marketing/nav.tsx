import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/studio/brand-mark";
import { getSession } from "@/lib/auth/session";
export async function MarketingNav() {
  const session = await getSession();
  return (
    <header className="marketing-nav">
      <div className="site-container nav-inner">
        <BrandMark />
        <nav aria-label="Main navigation">
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#features">Features</Link>
          <Link href="/#gallery">Showcase</Link>
          <Link href="/#pricing">Pricing</Link>
        </nav>
        <div className="nav-actions">
          {session ? (
            <Link href="/dashboard" className="button button-dark button-small">
              Dashboard <ArrowUpRight size={15} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="sign-in-link">
                Sign in
              </Link>
            </>
          )}
          <Link href="/demo" className="button button-dark button-small">
            Explore the studio <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
