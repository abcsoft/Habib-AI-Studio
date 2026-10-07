import Link from "next/link";
export const metadata = { title: "AI content disclosure" };
export default function Disclosure() {
  return (
    <article className="legal-page">
      <span className="section-eyebrow">MADE WITH A LITTLE AI</span>
      <h1>
        Creative assistance.
        <br />
        <em>Human direction.</em>
      </h1>
      <p>
        Habib AI Studio uses generative AI to help develop campaign materials.
        AI-assisted outputs should be reviewed before use.
      </p>
      <h2>Claude: the thinking and writing</h2>
      <p>
        Anthropic Claude creates campaign strategy, audience analysis, brand
        voice guidance, hooks, headlines, ad copy, concepts, creative briefs,
        visual direction, and image prompts. It does not render images in this
        studio.
      </p>
      <h2>Image model: the rendering</h2>
      <p>
        A separate image model, accessed through Vercel AI Gateway, renders
        visuals from a prompt. The model used is recorded in generation history.
        Images can contain inaccurate packaging, anatomy, lettering, or product
        details.
      </p>
      <h2>Your role before publication</h2>
      <p>
        Check factual claims, pricing, product appearance, spelling, brand
        consistency, image rights, and advertising platform requirements.
        Outputs can be incomplete, inaccurate, or similar to other content. Do
        not represent fictional people, testimonials, or sample results as real.
      </p>
      <h2>The public demo and gallery</h2>
      <p>
        Demo brands and campaigns are fictional. Demo generation is a
        deterministic simulation using sample artwork; it does not call Claude
        or an image provider. The gallery includes an original AI-generated
        skincare product image, stock photography, and a designed SaaS concept.
        No displayed creative is evidence of actual campaign performance.
      </p>
      <h2>Usage transparency</h2>
      <p>
        Authenticated generation history records the model, prompt version,
        provider request ID where available, credit use, refund status, and
        Claude token usage. Demo outputs use no provider tokens. See the{" "}
        <Link href="/privacy">Privacy Policy</Link> for how inputs and assets
        are processed.
      </p>
    </article>
  );
}
