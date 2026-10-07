import type { Metadata } from "next";
import { StudioPricing } from "@/components/marketing/studio-pricing";
export const metadata: Metadata = { title: "Pricing" };
export default function PricingPage() {
  return <StudioPricing />;
}
