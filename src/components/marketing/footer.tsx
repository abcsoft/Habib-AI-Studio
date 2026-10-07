import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/studio/brand-mark";
export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="site-container">
        <div className="footer-top">
          <div>
            <BrandMark />
            <p>
              A little inspiration. A lot of possibility.
              <br />
              Your next great campaign starts here.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <span>THE STUDIO</span>
              <Link href="/demo">Explore demo</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/signup">
                Start creating <ArrowUpRight size={12} />
              </Link>
            </div>
            <div>
              <span>LET’S CONNECT</span>
              <Link href="/about">About us</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/ai-disclosure">AI disclosure</Link>
            </div>
            <div>
              <span>THE DETAILS</span>
              <Link href="/privacy">Privacy policy</Link>
              <Link href="/terms">Terms of service</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Habib AI Studio. Built for your next big idea.</span>
          <span>Thought with Claude. Rendered with an image model.</span>
        </div>
      </div>
    </footer>
  );
}
