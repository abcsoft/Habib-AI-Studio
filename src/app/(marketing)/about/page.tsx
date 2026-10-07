import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export const metadata = { title: "About the studio" };
export default function About() {
  return (
    <article className="legal-page">
      <span className="section-eyebrow">A LITTLE ABOUT US</span>
      <h1>
        Good ideas deserve
        <br />
        <em>a creative home.</em>
      </h1>
      <p>
        Habib AI Studio is a creative workspace for founders, marketers, and
        small businesses with something to share. It connects the thinking,
        writing, and image-making behind a campaign, so a product brief can
        become a coherent creative package.
      </p>
      <h2>A clear division of creative work</h2>
      <p>
        Claude helps with audience analysis, strategy, brand voice, hooks, copy,
        concepts, and visual briefs. A separate image model turns those briefs
        into imagery. You set the direction and make the final decisions.
      </p>
      <h2>Built around your brand</h2>
      <p>
        Your voice, audience, and palette travel with each campaign. Projects
        keep related ideas together. Saved creatives, generation history, and
        exports make it easier to move from exploration to a reviewed campaign.
      </p>
      <h2>A thoughtful starting point</h2>
      <p>
        The studio offers creative drafts, not performance promises. We show
        generation costs, track usage, and label AI-assisted content. The public
        demo features fictional brands so you can explore before creating an
        account.
      </p>
      <Link
        href="/demo"
        className="button button-primary"
        style={{ color: "white" }}
      >
        Step inside the studio <ArrowUpRight size={17} />
      </Link>
    </article>
  );
}
