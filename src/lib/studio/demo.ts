import {
  CAMPAIGN_COST_CREDITS,
  GENERATION_COST_CREDITS,
  WELCOME_CREDITS,
} from "@/config/plans";
import type { Brand, CampaignPackage, StudioData } from "./types";

const ids = [
  "00000000-0000-4000-8000-000000000001",
  "00000000-0000-4000-8000-000000000002",
  "00000000-0000-4000-8000-000000000003",
  "00000000-0000-4000-8000-000000000004",
];
export const demoBrands: Brand[] = [
  {
    id: ids[0],
    name: "Bloom Skincare",
    industry: "Skincare",
    audience:
      "Mindful shoppers aged 25–40 seeking a simple daily skincare ritual",
    voice: "Warm, minimal, thoughtful. No exaggerated skincare claims.",
    colors: "#ead6c7, #67574c, #faf4eb",
  },
  {
    id: ids[1],
    name: "Maison Wear",
    industry: "Fashion store",
    audience:
      "Style-conscious professionals who value timeless everyday essentials",
    voice: "Confident, editorial, understated",
    colors: "#dad9b8, #363f30, #f7f4eb",
  },
  {
    id: ids[2],
    name: "Orbit",
    industry: "SaaS product",
    audience:
      "Small startup teams looking to organize projects with less admin",
    voice: "Clear, friendly, optimistic. Avoid technical jargon.",
    colors: "#7461db, #eeebff, #262235",
  },
  {
    id: ids[3],
    name: "Sunday Table",
    industry: "Restaurant",
    audience:
      "Local food lovers planning relaxed meals with friends and family",
    voice: "Welcoming, sensory, conversational",
    colors: "#b94b32, #faecd8, #383022",
  },
];
export function demoPackage(
  brand: Brand,
  product: string,
  goal: string,
  channel: string,
): CampaignPackage {
  const focus =
    goal === "Drive sales"
      ? "an easy first purchase"
      : goal === "Generate leads"
        ? "a useful first conversation"
        : goal === "Product launch"
          ? "introducing a fresh arrival"
          : "a memorable first impression";
  return {
    strategy: `Position ${brand.name} around ${focus}. Lead with the everyday value of ${product}, then invite a clear next step on ${channel}. Test an emotional story against a direct product benefit before increasing spend.`,
    audienceAnalysis: `${brand.audience}. Start with people already exploring ${brand.industry.toLowerCase()}; speak to convenience, confidence, and a considered choice. Validate these assumptions with your own customer research.`,
    brandVoice: brand.voice,
    hooks: [
      `A little ${brand.name}. A better everyday.`,
      `Meet your next everyday favorite.`,
      `Made for the moments that matter.`,
    ],
    headlines: [
      `Your everyday, reimagined.`,
      `Good things start with ${brand.name}.`,
      `Something worth making room for.`,
    ],
    adCopy: [
      `Meet ${brand.name}: ${product}. A thoughtful addition to your everyday. Explore the collection and find your favorite.`,
      `Less noise. More of what you love. Discover ${product} from ${brand.name} and take your next step today.`,
      `A fresh perspective on ${brand.industry.toLowerCase()}. ${brand.name} brings ${product} to the moments that matter. Discover more.`,
    ],
    concepts: [
      {
        title: "The everyday ritual",
        description: `Show ${brand.name} in an authentic everyday moment. One product, warm light, and a short emotional headline.`,
      },
      {
        title: "Room for something good",
        description:
          "A bold product close-up with generous negative space and one clear call to action.",
      },
      {
        title: "A fresh perspective",
        description:
          "Use a playful unexpected composition while keeping the product the focal point.",
      },
    ],
    creativeBrief: `Objective: ${goal}. Channel: ${channel}. Audience: ${brand.audience}. Deliver three 1:1 creative variations and three copy options. Lead with real product benefits, avoid invented testimonials, and review all claims before publishing.`,
    visualDirection: `Editorial product composition, tactile surfaces, natural side lighting. Use ${brand.colors}. Keep generous negative space for headlines. Add typography in your design tool after image rendering.`,
    imagePrompts: [
      `Premium editorial advertising photograph for fictional ${brand.name}, featuring ${product}. Brand palette ${brand.colors}. Warm natural side lighting, tactile curved stone plinth, generous negative space above and to the left, thoughtful premium composition, square crop, sharp product detail, no text or watermarks.`,
      `Lifestyle advertising photograph for ${brand.name}, ${product} in an authentic everyday environment, palette ${brand.colors}, candid natural light, elevated art direction, square composition, no lettering, no logos, no watermark.`,
    ],
    callToAction:
      goal === "Generate leads"
        ? "Let's talk"
        : goal === "Drive sales"
          ? "Shop the collection"
          : "Discover more",
  };
}
export function createDemoData(): StudioData {
  const products = [
    "Daily Glow serum for a simple morning skincare ritual",
    "The new collection of timeless linen essentials",
    "A calm project workspace for busy startup teams",
    "A seasonal menu made for slow Sunday afternoons",
  ];
  const names = [
    "A little glow goes a long way",
    "Made for your everyday",
    "Make space for great work",
    "Good food. Better company.",
  ];
  return {
    name: "Creative",
    credits: WELCOME_CREDITS,
    brands: demoBrands,
    projects: demoBrands.map((b, i) => ({
      id: b.id,
      name: `${b.name.split(" ")[0]} · Launch`,
      description: products[i],
    })),
    campaigns: demoBrands.map((b, i) => ({
      id: b.id,
      name: names[i],
      product: products[i],
      projectId: b.id,
      brandKitId: b.id,
      goal: "Product launch",
      channel: "Instagram & Facebook",
      status: "saved",
      createdAt: "2026-10-01T10:00:00.000Z",
    })),
    runs: demoBrands.map((b, i) => ({
      id: `demo-run-${i}`,
      campaignId: b.id,
      kind: "campaign",
      model: "Sample campaign · no API call",
      status: "completed",
      output: demoPackage(
        b,
        products[i],
        "Product launch",
        "Instagram & Facebook",
      ),
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      credits: 0,
      providerRequestId: null,
      promptVersion: "demo-v1",
      durationMs: 0,
      errorCode: null,
      refunded: false,
      createdAt: "2026-10-01T10:00:00.000Z",
    })),
    assets: demoBrands.map((b, i) => ({
      id: `demo-asset-${i}`,
      campaignId: b.id,
      imageUrl: [
        "/showcase/bloom.webp",
        "/showcase/fashion.jpg",
        "/showcase/orbit.svg",
        "/showcase/restaurant.jpg",
      ][i],
      prompt: "Illustrative sample creative; no live generation",
      model: "Demo sample",
      createdAt: "2026-10-01T10:00:00.000Z",
    })),
  };
}
export const demoCosts = {
  campaign: CAMPAIGN_COST_CREDITS,
  image: GENERATION_COST_CREDITS,
};
