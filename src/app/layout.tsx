import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  Martian_Mono,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
const instrument = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});
const mono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});
const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Habib AI Studio — Your AI creative & advertising studio",
    template: "%s — Habib AI Studio",
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Habib AI Studio — Your next creative direction",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
};
export const viewport: Viewport = { themeColor: "#faf9f6" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${instrument.variable} ${mono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
