import Image from "next/image";

export const creativeExamples = [
  {
    name: "Bloom Skincare",
    category: "SKINCARE · PRODUCT LAUNCH",
    headline: "A little glow.\nA lot of you.",
    image: "/showcase/bloom.webp",
    className: "bloom",
    tag: "Made for your daily ritual.",
  },
  {
    name: "Maison Wear",
    category: "FASHION · BRAND AWARENESS",
    headline: "Your everyday.\nAnything but ordinary.",
    image: "/showcase/fashion.jpg",
    className: "fashion",
    tag: "THE EVERYDAY EDIT",
  },
  {
    name: "Orbit",
    category: "SAAS · LEAD GENERATION",
    headline: "Less busywork.\nMore big ideas.",
    image: "/showcase/orbit.svg",
    className: "orbit",
    tag: "Make space for great work.",
  },
  {
    name: "Sunday Table",
    category: "RESTAURANT · LOCAL CAMPAIGN",
    headline: "Good food.\nBetter company.",
    image: "/showcase/restaurant.jpg",
    className: "restaurant",
    tag: "Pull up a chair.",
  },
] as const;
export function CreativeCard({
  index = 0,
  imageUrl,
  headline,
  small = false,
  overlay = true,
  eager = false,
}: {
  index?: number;
  imageUrl?: string;
  headline?: string;
  small?: boolean;
  overlay?: boolean;
  eager?: boolean;
}) {
  const c = creativeExamples[index % creativeExamples.length];
  return (
    <div className={`creative-preview ${c.className} ${small ? "small" : ""}`}>
      <Image
        src={imageUrl ?? c.image}
        alt={
          imageUrl
            ? "Saved campaign visual"
            : `${c.name} illustrative campaign creative`
        }
        fill
        sizes="(max-width: 700px) 90vw, 450px"
        unoptimized={Boolean(imageUrl)}
        loading={eager ? "eager" : "lazy"}
      />
      {overlay && (
        <div className="creative-overlay">
          <span className="creative-brand">
            {c.name.split(" ")[0].toLowerCase()}
          </span>
          <h3>{headline ?? c.headline}</h3>
          <span className="creative-tag">{c.tag}</span>
        </div>
      )}
    </div>
  );
}
