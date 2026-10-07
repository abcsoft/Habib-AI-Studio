import Link from "next/link";
import { BrandMark } from "@/components/studio/brand-mark";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <BrandMark />
      <p className="eyebrow">Page not found</p>
      <h1 className="text-display">404</h1>
      <p className="max-w-md text-muted-foreground">
        This page may have moved, or the address may be incorrect. Let&apos;s
        get your next idea started.
      </p>
      <Link href="/" className="button button-primary">
        Back to home
      </Link>
    </div>
  );
}
