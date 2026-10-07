import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Check,
  Palette,
  Megaphone,
  PenLine,
  ImageIcon,
  FolderOpen,
  Download,
  CircleCheck,
  MoveUpRight,
} from "lucide-react";
import {
  CreativeCard,
  creativeExamples,
} from "@/components/studio/creative-card";
import { StudioPricing } from "@/components/marketing/studio-pricing";
import { DemoTour } from "@/components/marketing/demo-tour";

const faqs = [
  [
    "What can I create with Habib AI Studio?",
    "Create campaign strategies, audience insights, hooks, headlines, ad copy, creative briefs, image prompts, and rendered images. Save everything together in a campaign and export when you're ready.",
  ],
  [
    "Does Claude generate the images?",
    "Claude handles the thinking: strategy, concepts, copy, briefs, and visual prompts. A separate image model renders your visuals. Each stage has its own credit cost and generation record.",
  ],
  [
    "How do credits work?",
    "You get 10 one-time welcome credits. A campaign package costs 3 credits and an image costs 1 credit. Paid plans add credits monthly. Credits do not expire, and failed generations are refunded.",
  ],
  [
    "Can I try it without creating an account?",
    "Yes. Explore a sample workspace with fashion, SaaS, restaurant, and skincare brands. Demo generations are simulated, use no provider tokens, and stay in your browser.",
  ],
  [
    "Can I use the output in ads?",
    "Outputs are designed as starting points for commercial creative work. Review factual claims, product accuracy, brand rights, and advertising rules before publishing. AI output may be inaccurate or similar to other content.",
  ],
  [
    "Can I export my campaigns?",
    "Yes. Export the campaign package as JSON or Markdown, copy individual text assets, and download rendered images. Your strategy, copy, and creative assets stay connected to the project.",
  ],
];
export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow">
              <span className="status-dot" /> YOUR NEXT BIG IDEA STARTS HERE
            </span>
            <h1>
              Your ideas.
              <br />A whole new
              <br />
              <em>creative direction.</em>
            </h1>
            <p>
              Meet your AI creative partner. Turn a simple product brief into
              thoughtful campaigns, scroll-stopping visuals, and words that
              connect.
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="button button-primary">
                Start creating for free <ArrowUpRight size={17} />
              </Link>
              <DemoTour hero />
            </div>
            <div className="hero-reassurance">
              <span>
                <Check size={14} /> 10 welcome credits
              </span>
              <span>
                <Check size={14} /> No credit card needed
              </span>
            </div>
            <div className="hero-provider">
              <span className="provider-symbol">✳</span>
              <div>
                Creative thinking by <strong>Claude</strong>
                <small>
                  Strategy & copy, paired with independent image rendering.
                </small>
              </div>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-art-back">
              <span>YOUR NEXT CAMPAIGN</span>
              <span>01 / CREATIVE EXPLORATION</span>
            </div>
            <div className="hero-main-creative">
              <CreativeCard eager />
              <span className="hero-image-label">
                <span /> AI-generated sample creative
              </span>
            </div>
            <div className="floating-strategy">
              <span className="floating-icon">
                <Sparkles size={18} />
              </span>
              <div>
                <strong>A little strategy. A lot of possibility.</strong>
                <p>One idea → a complete creative package</p>
              </div>
              <CircleCheck size={18} className="success-icon" />
            </div>
            <div className="floating-copy">
              <span>
                <PenLine size={13} /> THE HOOK
              </span>
              <p>
                “Your daily dose
                <br />
                of a little more you.”
              </p>
              <div>
                <span className="mini-dot" /> Brand voice, beautifully on point.
              </div>
            </div>
            <div className="hero-art-note">
              <MoveUpRight size={30} />
              <span>
                From a blank page
                <br />
                <em>to a brand moment.</em>
              </span>
            </div>
          </div>
        </div>
        <div className="site-container hero-divider">
          <span>FOR THE PEOPLE WITH SOMETHING TO SHARE</span>
          <div>
            <span>Founders</span>
            <span>Marketers</span>
            <span>Small businesses</span>
            <span>Creative minds</span>
          </div>
        </div>
      </section>

      <section id="gallery" className="site-section gallery-section">
        <div className="site-container">
          <div className="section-heading section-heading-row">
            <div>
              <span className="section-eyebrow">A LITTLE INSPIRATION</span>
              <h2>
                One studio. <em>Endless directions.</em>
              </h2>
              <p>
                Different brands, different stories. A few ways your next
                campaign could look.
              </p>
            </div>
            <Link href="/demo?view=creatives" className="text-link">
              Explore the showcase <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="gallery-grid">
            {creativeExamples.map((c, i) => (
              <Link
                className="gallery-card"
                href={`/demo?view=campaign&id=00000000-0000-4000-8000-00000000000${i + 1}`}
                key={c.name}
              >
                <CreativeCard index={i} />
                <div className="gallery-caption">
                  <div>
                    <strong>{c.name}</strong>
                    <span>{c.category}</span>
                  </div>
                  <span className="round-arrow">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="gallery-disclosure">
            Illustrative campaigns for fictional brands. Gallery includes an
            AI-generated product image, stock photography, and a designed
            concept.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="site-section workflow-section">
        <div className="site-container">
          <div className="section-heading centered">
            <span className="section-eyebrow">
              FROM “WHAT IF” TO “HERE IT IS”
            </span>
            <h2>
              A simpler way <em>to make something great.</em>
            </h2>
            <p>
              Your brand, your idea, your creative direction. We help connect
              the dots.
            </p>
          </div>
          <div className="workflow-grid">
            {[
              {
                icon: Palette,
                title: "Meet your brand",
                text: "Add your product, audience, and brand voice. Give your idea a home.",
              },
              {
                icon: Sparkles,
                title: "Find your direction",
                text: "Choose a goal. Claude creates your strategy, concepts, copy, and visual prompts.",
              },
              {
                icon: ImageIcon,
                title: "Make it a moment",
                text: "Render your visuals, save the campaign, and export your creative package.",
              },
            ].map((s, i) => (
              <article key={s.title}>
                <div className="step-top">
                  <span className="step-icon">
                    <s.icon size={23} strokeWidth={1.5} />
                  </span>
                  <span className="step-number">0{i + 1}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
          <div className="workflow-comparison">
            <div>
              <span>THE OLD WAY</span>
              <p>A blank page. Five tools. One very long afternoon.</p>
            </div>
            <ArrowRight size={26} />
            <div>
              <span>THE STUDIO WAY</span>
              <p>
                One brief. A clear direction. A campaign ready for your review.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="site-section">
        <div className="site-container feature-layout">
          <div className="feature-intro">
            <span className="section-eyebrow">YOUR CREATIVE TOOLKIT</span>
            <h2>
              A small studio.
              <br />
              <em>With big range.</em>
            </h2>
            <p>
              Everything you need to take an idea further. All working together,
              all in your brand’s voice.
            </p>
            <Link href="/demo" className="button button-outline">
              Step inside the studio <ArrowUpRight size={16} />
            </Link>
            <div className="provider-note">
              <Sparkles size={18} />
              <p>
                <strong>Thoughtfully separated.</strong>
                <br />
                Claude does the thinking and writing.
                <br />
                The image model brings it to life.
              </p>
            </div>
          </div>
          <div className="feature-grid">
            {[
              {
                icon: Megaphone,
                title: "Campaigns with a point of view",
                text: "Strategy, audience insights, hooks, and creative concepts built around your goal.",
                color: "violet",
              },
              {
                icon: PenLine,
                title: "Words that sound like you",
                text: "Headlines and ad copy shaped by your brand voice, audience, and channel.",
                color: "peach",
              },
              {
                icon: ImageIcon,
                title: "Visuals worth a second look",
                text: "Turn carefully constructed image prompts into fresh campaign imagery.",
                color: "sage",
              },
              {
                icon: FolderOpen,
                title: "A home for every good idea",
                text: "Brand kits, saved campaigns, generation history, and exports in one workspace.",
                color: "yellow",
              },
            ].map((f) => (
              <article className="feature-card" key={f.title}>
                <span className={`feature-icon ${f.color}`}>
                  <f.icon size={21} strokeWidth={1.6} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="tour-section">
        <div className="site-container tour-layout">
          <div>
            <span className="section-eyebrow">SEE THE IDEA TAKE SHAPE</span>
            <h2>
              Meet your new
              <br />
              <em>creative rhythm.</em>
            </h2>
            <p>
              Follow a skincare campaign from brand kit to saved creative in six
              simple steps.
            </p>
            <DemoTour />
          </div>
          <div className="tour-preview">
            <video
              controls
              preload="none"
              poster="/studio-demo-poster.webp"
              aria-label="75-second Habib AI Studio sample workflow"
            >
              <source src="/studio-demo.mp4" type="video/mp4" />
              <track
                kind="captions"
                src="/studio-demo-captions.vtt"
                srcLang="en"
                label="English"
                default
              />
              Your browser does not support video. Try the interactive studio
              tour.
            </video>
            <div className="tour-caption">
              <span>
                <Sparkles size={15} /> 75-second workflow · simulated demo
              </span>
              <Download size={16} />
            </div>
          </div>
        </div>
      </section>
      <StudioPricing />
      <section className="site-section faq-section">
        <div className="site-container faq-layout">
          <div className="section-heading">
            <span className="section-eyebrow">GOOD QUESTIONS</span>
            <h2>
              A little <em>clarity.</em>
            </h2>
            <p>
              Something else on your mind?
              <br />
              <Link href="/contact" className="text-link">
                Let’s talk <ArrowUpRight size={15} />
              </Link>
            </p>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details name="faq" key={question}>
                <summary>
                  {question}
                  <span>+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="closing-cta">
        <div className="site-container">
          <span className="section-eyebrow">
            THAT IDEA YOU’VE BEEN SITTING ON?
          </span>
          <h2>
            Let’s make <em>something of it.</em>
          </h2>
          <p>Your next campaign is closer than you think.</p>
          <Link href="/signup" className="button button-dark">
            Find your creative direction <ArrowUpRight size={17} />
          </Link>
          <span className="cta-footnote">
            Start with 10 free credits. Make them count.
          </span>
        </div>
      </section>
    </>
  );
}
