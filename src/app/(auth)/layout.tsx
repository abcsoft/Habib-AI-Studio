import { BrandMark } from "@/components/studio/brand-mark";
import Link from "next/link";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-20 items-center justify-between border-b px-6 md:px-12">
        <BrandMark />
        <Link href="/demo" className="text-link">
          Explore demo ↗
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-xl border bg-white p-7 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
