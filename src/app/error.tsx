"use client";

import * as React from "react";

import Link from "next/link";
import { BrandMark } from "@/components/studio/brand-mark";

// Route-segment error boundary — renders inside the root layout, so the
// theme and fonts still apply. Errors surface as human sentences with a
// next step; the digest stays in the server logs, not in the UI.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <BrandMark />
      <p className="eyebrow">A pause in the process</p>
      <h1 className="text-3xl">Something went wrong.</h1>
      <p className="max-w-md text-muted-foreground">
        We couldn&apos;t load this page. Try again, or check your generation
        history if a creative was in progress.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={reset} className="button button-primary">
          Try again
        </button>
        <Link href="/" className="button button-outline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
