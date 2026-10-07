"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  ArrowUpRight,
  ArrowRight,
  FolderOpen,
  Megaphone,
  ImageIcon,
  Download,
  Copy,
  Check,
  Search,
  LoaderCircle,
  Target,
  Clock,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { StudioShell, studioHref } from "./studio-shell";
import { CreativeCard } from "./creative-card";
import { exportCampaign, downloadText } from "./export";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  createBrandAction,
  createProjectAction,
  createCampaignAction,
  generateStudioAction,
  saveCampaignAction,
} from "@/app/(app)/studio-actions";
import { createDemoData, demoPackage } from "@/lib/studio/demo";
import {
  goals,
  channels,
  brandSchema,
  projectSchema,
  campaignSchema,
  packageSchema,
  type StudioData,
  type StudioView,
  type Campaign,
  type ActionResult,
} from "@/lib/studio/types";
import { CAMPAIGN_COST_CREDITS, GENERATION_COST_CREDITS } from "@/config/plans";
import { StudioPricing } from "@/components/marketing/studio-pricing";

const storageKey = "habib-ai-studio-demo-v1";
const demoStorageSchema = z.object({
  name: z.string(),
  credits: z.number().int().nonnegative(),
  brands: z.array(brandSchema.extend({ id: z.uuid() })),
  projects: z.array(projectSchema.extend({ id: z.uuid() })),
  campaigns: z.array(
    campaignSchema.extend({
      id: z.uuid(),
      status: z.string(),
      createdAt: z.string(),
    }),
  ),
  runs: z.array(
    z.object({
      id: z.string(),
      campaignId: z.string(),
      kind: z.string(),
      model: z.string(),
      status: z.string(),
      output: packageSchema.nullable(),
      inputTokens: z.number(),
      outputTokens: z.number(),
      cacheReadTokens: z.number(),
      cacheCreationTokens: z.number(),
      credits: z.number(),
      providerRequestId: z.string().nullable(),
      promptVersion: z.string(),
      durationMs: z.number().nullable(),
      errorCode: z.string().nullable(),
      refunded: z.boolean(),
      createdAt: z.string(),
    }),
  ),
  assets: z.array(
    z.object({
      id: z.string(),
      campaignId: z.string(),
      imageUrl: z.string().startsWith("/showcase/"),
      prompt: z.string(),
      model: z.string(),
      createdAt: z.string(),
    }),
  ),
});
const tabs = [
  "Strategy",
  "Ad copy",
  "Creative brief",
  "Visual prompts",
  "Images",
] as const;
const pageInfo: Partial<Record<StudioView, [string, string]>> = {
  projects: [
    "Your projects",
    "A home for every idea, from first brief to final creative.",
  ],
  campaigns: [
    "Your campaigns",
    "Good thinking, great copy, and visuals. All together.",
  ],
  brands: [
    "Your brand kits",
    "Give every campaign a voice, a palette, and a point of view.",
  ],
  creatives: ["Saved creatives", "The good stuff, all in one place."],
  history: [
    "Generation history",
    "Every generation has a story. Here's the record.",
  ],
  usage: [
    "Usage & credits",
    "Keep track of your creative fuel and provider usage.",
  ],
};
function shortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Dhaka",
  });
}
function EmptyState({
  title,
  text,
  href,
  cta,
}: {
  title: string;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="empty-state">
      <span>
        <Sparkles size={25} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link className="button button-primary" href={href}>
        {cta}
        <Plus size={16} />
      </Link>
    </div>
  );
}
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="icon-button"
      aria-label="Copy text"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error(
            "Copy isn't available in this browser. Export the campaign instead.",
          );
        }
      }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}

export function StudioWorkspace({
  initialData,
  view = "dashboard",
  campaignId,
  demo = false,
}: {
  initialData: StudioData;
  view?: StudioView;
  campaignId?: string;
  demo?: boolean;
}) {
  const [demoData, setDemoData] = useState(initialData),
    [search, setSearch] = useState(""),
    [modal, setModal] = useState<"brand" | "project" | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Strategy"),
    [error, setError] = useState<string | null>(null),
    [pending, startTransition] = useTransition();
  const router = useRouter(),
    data = demo ? demoData : initialData;
  useEffect(() => {
    if (!demo) return;
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved && saved.length < 1000000) {
          const parsed = demoStorageSchema.safeParse(JSON.parse(saved));
          if (parsed.success) setDemoData(parsed.data);
        }
      } catch {
        /* Browser storage may be disabled. The demo still works in memory. */
      }
    });
  }, [demo]);
  const persist = (next: StudioData) => {
    setDemoData(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      toast.info(
        "Browser storage is full or unavailable. This session still works; export your campaign to keep it.",
      );
    }
  };
  const href = (v: StudioView, id?: string) => studioHref(v, demo, id);
  const brandFor = (c: Campaign) =>
    data.brands.find((b) => b.id === c.brandKitId);
  const assetsFor = (c: Campaign) =>
    data.assets.filter((a) => a.campaignId === c.id);
  const outputFor = (c: Campaign) =>
    data.runs.find(
      (r) =>
        r.campaignId === c.id &&
        r.kind === "campaign" &&
        r.status === "completed",
    )?.output ?? null;
  const filtered = data.campaigns.filter((c) =>
    `${c.name} ${brandFor(c)?.name ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const selected = data.campaigns.find((c) => c.id === campaignId);
  const stats = [
    {
      label: "Projects",
      value: data.projects.length,
      icon: FolderOpen,
      view: "projects" as const,
      note: "Ideas with a home",
    },
    {
      label: "Campaigns",
      value: data.campaigns.length,
      icon: Megaphone,
      view: "campaigns" as const,
      note: "Stories taking shape",
    },
    {
      label: "Saved creatives",
      value: data.assets.length,
      icon: ImageIcon,
      view: "creatives" as const,
      note: "Ready for your next move",
    },
    {
      label: "Credits available",
      value: data.credits,
      icon: Sparkles,
      view: "usage" as const,
      note: "A little more possibility",
    },
  ];

  function handleResult(result: ActionResult, success: string) {
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return false;
    }
    setError(null);
    toast.success(success);
    router.refresh();
    return true;
  }
  function runGeneration(kind: "campaign" | "image", prompt?: string) {
    if (!selected) return;
    const cost =
      kind === "campaign" ? CAMPAIGN_COST_CREDITS : GENERATION_COST_CREDITS;
    setError(null);
    startTransition(async () => {
      try {
        if (demo) {
          if (data.credits < cost) {
            setError(
              "You've used this demo's credits. Reset the demo or create your account to continue.",
            );
            return;
          }
          await new Promise((r) => setTimeout(r, 800));
          const brand = brandFor(selected);
          if (!brand) return;
          const now = new Date().toISOString(),
            id = crypto.randomUUID();
          const run = {
            id,
            campaignId: selected.id,
            kind,
            model: "Demo simulation · no API call",
            status: "completed",
            output:
              kind === "campaign"
                ? demoPackage(
                    brand,
                    selected.product,
                    selected.goal,
                    selected.channel,
                  )
                : null,
            inputTokens: 0,
            outputTokens: 0,
            cacheReadTokens: 0,
            cacheCreationTokens: 0,
            credits: cost,
            providerRequestId: null,
            promptVersion: "demo-v1",
            durationMs: 800,
            errorCode: null,
            refunded: false,
            createdAt: now,
          };
          const index = /fashion/i.test(brand.industry)
            ? 1
            : /saas/i.test(brand.industry)
              ? 2
              : /restaurant/i.test(brand.industry)
                ? 3
                : 0;
          const imageUrl = [
            "/showcase/bloom.webp",
            "/showcase/fashion.jpg",
            "/showcase/orbit.svg",
            "/showcase/restaurant.jpg",
          ][index];
          persist({
            ...data,
            credits: data.credits - cost,
            runs: [run, ...data.runs],
            assets:
              kind === "image"
                ? [
                    {
                      id,
                      campaignId: selected.id,
                      imageUrl,
                      prompt: prompt ?? "",
                      model: "Illustrative demo sample",
                      createdAt: now,
                    },
                    ...data.assets,
                  ]
                : data.assets,
          });
          toast.success(
            kind === "campaign"
              ? "Your sample creative package is ready."
              : "Sample visual added. Demo mode uses existing artwork.",
          );
        } else
          handleResult(
            await generateStudioAction({
              campaignId: selected.id,
              requestId: crypto.randomUUID(),
              kind,
              prompt,
            }),
            kind === "campaign"
              ? "Claude's creative package is ready."
              : "Your new visual is ready.",
          );
        setActiveTab(kind === "image" ? "Images" : "Strategy");
      } catch {
        setError(
          "We couldn't complete that action. Check History before retrying, then contact support if it continues.",
        );
      }
    });
  }

  function entitySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const type = modal;
    const parsed =
      type === "brand"
        ? brandSchema.safeParse(values)
        : projectSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your input.");
      return;
    }
    startTransition(async () => {
      try {
        if (demo) {
          const id = crypto.randomUUID();
          if (type === "brand")
            persist({
              ...data,
              brands: [{ ...brandSchema.parse(values), id }, ...data.brands],
            });
          else
            persist({
              ...data,
              projects: [
                { ...projectSchema.parse(values), id },
                ...data.projects,
              ],
            });
          toast.success(
            type === "brand" ? "Brand kit saved." : "Project created.",
          );
          setModal(null);
          setError(null);
        } else {
          const result =
            type === "brand"
              ? await createBrandAction(values)
              : await createProjectAction(values);
          if (
            handleResult(
              result,
              type === "brand" ? "Brand kit saved." : "Project created.",
            )
          )
            setModal(null);
        }
      } catch {
        setError("Couldn't save your changes. Please try again.");
      }
    });
  }
  function campaignSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = campaignSchema.safeParse(values);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Check your campaign details.",
      );
      return;
    }
    startTransition(async () => {
      try {
        if (demo) {
          const id = crypto.randomUUID();
          persist({
            ...data,
            campaigns: [
              {
                ...parsed.data,
                id,
                status: "draft",
                createdAt: new Date().toISOString(),
              },
              ...data.campaigns,
            ],
          });
          router.push(href("campaign", id));
          toast.success("Your campaign has a home. Let's find its direction.");
        } else {
          const result = await createCampaignAction(parsed.data);
          if (handleResult(result, "Campaign created."))
            router.push(
              result.ok ? href("campaign", result.id) : href("campaigns"),
            );
        }
      } catch {
        setError("Couldn't create the campaign. Your credits were not used.");
      }
    });
  }

  const campaignCards = (items: Campaign[]) => (
    <div className="campaign-grid">
      {items.map((c) => {
        const brand = brandFor(c),
          asset = assetsFor(c)[0],
          index = Math.max(
            0,
            data.brands.findIndex((b) => b.id === c.brandKitId),
          );
        return (
          <Link
            href={href("campaign", c.id)}
            key={c.id}
            className="campaign-card"
          >
            {asset ? (
              <CreativeCard
                index={index}
                imageUrl={asset.imageUrl}
                overlay={demo}
                small
              />
            ) : (
              <div
                className="campaign-placeholder"
                style={{ background: brand?.colors.split(",")[0] }}
              >
                <Megaphone size={40} strokeWidth={1.2} />
                <span>Your next brand moment</span>
              </div>
            )}
            <div className="campaign-card-body">
              <div className="campaign-meta">
                <span>{brand?.name ?? "Your brand"}</span>
                <span className={`status-chip ${c.status}`}>
                  {c.status === "saved" ? "Saved" : "Draft"}
                </span>
              </div>
              <h3>{c.name}</h3>
              <div className="campaign-bottom">
                <span>
                  {c.goal} <span>·</span> {shortDate(c.createdAt)}
                </span>
                <ArrowUpRight size={17} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );

  let content: React.ReactNode;
  if (view === "dashboard")
    content = (
      <>
        <div className="page-heading">
          <div>
            <span className="section-eyebrow">A LITTLE INSPIRATION, AHEAD</span>
            <h1>
              Welcome to your studio, {data.name.split(" ")[0]}
              <span className="heading-spark">✳</span>
            </h1>
            <p>Good ideas deserve great creative. What will you make today?</p>
          </div>
          <Link href={href("new")} className="button button-primary">
            <Plus size={17} /> New campaign
          </Link>
        </div>
        <div className="dashboard-hero">
          <div>
            <span className="hero-eyebrow">
              <Sparkles size={13} /> FROM IDEA TO IMPACT
            </span>
            <h2>
              Your next great campaign
              <br />
              starts with <em>a little spark.</em>
            </h2>
            <p>
              Bring your brand. Pick a goal. Let your creative direction unfold.
            </p>
            <Link href={href("new")} className="button button-dark">
              Let’s create something <ArrowUpRight size={16} />
            </Link>
            <span className="dashboard-hero-foot">
              Strategy → Copy → Visuals. One connected workflow.
            </span>
          </div>
          <div className="dashboard-hero-art">
            <CreativeCard small eager />
            <span className="mini-ai-card">
              <Sparkles size={15} /> Made with a little AI magic
            </span>
          </div>
        </div>
        <div className="stats-grid">
          {stats.map((s) => (
            <Link href={href(s.view)} key={s.label} className="stat-card">
              <div>
                <span>{s.label}</span>
                <s.icon size={17} />
              </div>
              <strong>{s.value.toLocaleString()}</strong>
              <small>{s.note}</small>
            </Link>
          ))}
        </div>
        <div className="section-bar">
          <div>
            <h2>Recent campaigns</h2>
            <p>A few good ideas in motion.</p>
          </div>
          <Link href={href("campaigns")} className="text-link">
            View all campaigns <ArrowRight size={15} />
          </Link>
        </div>
        {data.campaigns.length ? (
          campaignCards(data.campaigns.slice(0, 3))
        ) : (
          <EmptyState
            title="Your first campaign starts here"
            text="Create a project and a brand kit, then turn your product into a creative package."
            href={href("new")}
            cta="Create a campaign"
          />
        )}
        <div className="dashboard-bottom">
          <div className="panel">
            <div className="section-bar">
              <h2>Your brand kits</h2>
              <Link href={href("brands")} className="text-link">
                Manage <ArrowUpRight size={14} />
              </Link>
            </div>
            {data.brands.slice(0, 3).map((b) => (
              <Link href={href("brands")} key={b.id} className="brand-list-row">
                <span
                  className="brand-initial"
                  style={{ background: b.colors.split(",")[0] }}
                >
                  {b.name.charAt(0)}
                </span>
                <span>
                  <strong>{b.name}</strong>
                  <small>{b.industry}</small>
                </span>
                <div className="color-dots">
                  {b.colors
                    .split(",")
                    .slice(0, 3)
                    .map((color) => (
                      <span key={color} style={{ background: color.trim() }} />
                    ))}
                </div>
              </Link>
            ))}
            {!data.brands.length && (
              <p className="muted">
                Your voice matters. Add your first brand kit.
              </p>
            )}
            <button
              className="add-brand-row"
              onClick={() => {
                setError(null);
                setModal("brand");
              }}
            >
              <Plus size={16} /> Add a brand kit
            </button>
          </div>
          <div className="quick-panel">
            <span className="section-eyebrow">MAKE IT YOURS</span>
            <h2>
              Less blank page.
              <br />
              <em>More possibility.</em>
            </h2>
            <p>
              Your strategy, copy, and visuals work better when they know your
              brand.
            </p>
            <Link href={href("brands")} className="text-link">
              Set your brand direction <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </>
    );
  else if (view === "new")
    content = (
      <>
        <div className="page-heading">
          <div>
            <span className="section-eyebrow">START WITH A LITTLE CONTEXT</span>
            <h1>What’s the big idea?</h1>
            <p>
              Tell us about your product. We’ll help find its creative
              direction.
            </p>
          </div>
        </div>
        <div className="new-campaign-layout">
          <form onSubmit={campaignSubmit} className="panel studio-form">
            <h2>Create your campaign</h2>
            <p className="muted">
              Your campaign starts as a draft. Generating the package uses{" "}
              {CAMPAIGN_COST_CREDITS} credits.
            </p>
            <label>
              Campaign name
              <input
                name="name"
                placeholder="e.g. A little glow goes a long way"
                minLength={3}
                maxLength={120}
                required
              />
            </label>
            <div className="form-two-col">
              <div className="form-field">
                <label>
                  Project
                  <select
                    name="projectId"
                    aria-label="Project"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Choose a project
                    </option>
                    {data.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="form-inline-action"
                  onClick={() => {
                    setError(null);
                    setModal("project");
                  }}
                >
                  <Plus size={12} /> New project
                </button>
              </div>
              <div className="form-field">
                <label>
                  Brand kit
                  <select
                    name="brandKitId"
                    aria-label="Brand kit"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Choose your brand
                    </option>
                    {data.brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="form-inline-action"
                  onClick={() => {
                    setError(null);
                    setModal("brand");
                  }}
                >
                  <Plus size={12} /> New brand kit
                </button>
              </div>
            </div>
            <label>
              Tell us about your product
              <textarea
                name="product"
                rows={4}
                minLength={10}
                maxLength={2500}
                required
                placeholder="What are you offering? What makes it different? Include real benefits, key details, and any claims we should avoid."
              />
            </label>
            <div className="form-two-col">
              <label>
                Campaign goal
                <select name="goal">
                  {goals.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>
              <label>
                Channel
                <select name="channel">
                  {channels.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button button-primary"
              disabled={pending || !data.brands.length || !data.projects.length}
            >
              {pending ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <ArrowRight size={17} />
              )}{" "}
              Create campaign draft
            </button>
            {(!data.brands.length || !data.projects.length) && (
              <p className="muted">
                Add a project and a brand kit above to continue.
              </p>
            )}
          </form>
          <aside className="creation-guide">
            <span className="feature-icon violet">
              <Sparkles size={24} />
            </span>
            <h2>
              A good brief makes
              <br />a great beginning.
            </h2>
            <p>Your creative package includes:</p>
            {[
              "Campaign strategy & audience insights",
              "Brand voice & creative concepts",
              "Hooks, headlines & ad copy",
              "Creative brief & visual direction",
              "Image prompts for rendering",
            ].map((s) => (
              <div key={s}>
                <Check size={15} />
                {s}
              </div>
            ))}
            <div className="creation-disclosure">
              Claude creates your campaign’s thinking and writing. A separate
              image model renders visuals when you choose to generate an image.
            </div>
          </aside>
        </div>
      </>
    );
  else if (view === "campaign" && selected) {
    const output = outputFor(selected),
      assets = assetsFor(selected),
      latest = data.runs.find(
        (r) =>
          r.campaignId === selected.id &&
          r.kind === "campaign" &&
          r.status === "completed",
      );
    content = (
      <>
        <Link className="text-link back-link" href={href("campaigns")}>
          ← All campaigns
        </Link>
        <div className="page-heading">
          <div>
            <span className="section-eyebrow">
              {brandFor(selected)?.name} · {selected.goal}
            </span>
            <h1>{selected.name}</h1>
            <p>
              {selected.channel} <span>·</span>{" "}
              <span className={`status-chip ${selected.status}`}>
                {selected.status}
              </span>
            </p>
          </div>
          <div className="page-actions">
            <button
              disabled={pending}
              className="button button-outline"
              onClick={() => {
                startTransition(async () => {
                  try {
                    if (demo) {
                      persist({
                        ...data,
                        campaigns: data.campaigns.map((c) =>
                          c.id === selected.id ? { ...c, status: "saved" } : c,
                        ),
                      });
                      toast.success("Campaign saved in this browser.");
                    } else
                      handleResult(
                        await saveCampaignAction(selected.id),
                        "Campaign saved.",
                      );
                  } catch {
                    setError("Couldn't save. Please try again.");
                  }
                });
              }}
            >
              <Check size={16} />
              Save campaign
            </button>
            <button
              className="button button-primary"
              onClick={() => exportCampaign(selected, output, assets, "json")}
            >
              <Download size={16} />
              Export package
            </button>
          </div>
        </div>
        <div className="campaign-brief-bar">
          <span>
            <Target size={17} />
            <strong>The brief</strong>
          </span>
          <p>{selected.product}</p>
        </div>
        <div className="generation-toolbar">
          <div>
            <Sparkles size={18} />
            <span>
              <strong>
                {demo
                  ? "Sample creative package"
                  : "Creative thinking by Claude"}
              </strong>
              <small>
                {latest
                  ? `${latest.model} · ${latest.inputTokens + latest.outputTokens} tokens · ${latest.credits} credits`
                  : "Strategy, copy, concepts, and visual prompts in one package."}
              </small>
            </span>
          </div>
          <button
            className="button button-primary"
            disabled={pending}
            onClick={() => runGeneration("campaign")}
          >
            {pending ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            {pending
              ? "Creating your direction…"
              : output
                ? "Regenerate"
                : demo
                  ? "Generate demo package"
                  : "Generate with Claude"}
            <span className="button-cost">{CAMPAIGN_COST_CREDITS} cr</span>
          </button>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div
          className="campaign-tabs"
          role="tablist"
          aria-label="Creative package"
        >
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              id={`tab-${tabs.indexOf(t)}`}
              tabIndex={activeTab === t ? 0 : -1}
              aria-selected={activeTab === t}
              aria-controls="creative-panel"
              onClick={() => setActiveTab(t)}
              onKeyDown={(event) => {
                const index = tabs.indexOf(t);
                const next =
                  event.key === "ArrowRight"
                    ? (index + 1) % tabs.length
                    : event.key === "ArrowLeft"
                      ? (index + tabs.length - 1) % tabs.length
                      : event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? tabs.length - 1
                          : -1;
                if (next >= 0) {
                  event.preventDefault();
                  setActiveTab(tabs[next]);
                  document.getElementById(`tab-${next}`)?.focus();
                }
              }}
            >
              {t}
              {t === "Images" && assets.length > 0 && (
                <span>{assets.length}</span>
              )}
            </button>
          ))}
        </div>
        <div
          id="creative-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tabs.indexOf(activeTab)}`}
          className="creative-panel"
        >
          {activeTab !== "Images" && !output ? (
            <div className="empty-state">
              <Sparkles size={28} />
              <h3>Let’s find your creative direction.</h3>
              <p>
                Generate a campaign package to see your strategy, copy, brief,
                and visual prompts here.
              </p>
            </div>
          ) : activeTab === "Strategy" && output ? (
            <div className="output-grid">
              <article className="panel output-block">
                <span className="section-eyebrow">THE BIG PICTURE</span>
                <h2>Campaign strategy</h2>
                <p>{output.strategy}</p>
                <CopyButton text={output.strategy} />
              </article>
              <article className="panel output-block">
                <span className="section-eyebrow">WHO WE’RE TALKING TO</span>
                <h2>Audience insights</h2>
                <p>{output.audienceAnalysis}</p>
                <h3>Your brand voice</h3>
                <p>{output.brandVoice}</p>
              </article>
              <article className="panel output-block full-width">
                <span className="section-eyebrow">THREE WAYS IN</span>
                <h2>Creative concepts</h2>
                <div className="concept-grid">
                  {output.concepts.map((c, i) => (
                    <div key={i}>
                      <span className="step-number">0{i + 1}</span>
                      <h3>{c.title}</h3>
                      <p>{c.description}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          ) : activeTab === "Ad copy" && output ? (
            <div className="copy-grid">
              {(
                [
                  ["Hooks", output.hooks],
                  ["Headlines", output.headlines],
                  ["Ad copy", output.adCopy],
                ] as const
              ).map(([title, lines]) => (
                <section key={title}>
                  <h2>{title}</h2>
                  {lines.map((line, i) => (
                    <article className="panel copy-block" key={i}>
                      <span className="section-eyebrow">OPTION 0{i + 1}</span>
                      <p>{line}</p>
                      <CopyButton text={line} />
                    </article>
                  ))}
                </section>
              ))}
              <p className="muted full-width">
                Call to action: <strong>{output.callToAction}</strong>. Review
                all claims and details before publishing.
              </p>
            </div>
          ) : activeTab === "Creative brief" && output ? (
            <div className="panel output-block">
              <span className="section-eyebrow">THE CREATIVE BLUEPRINT</span>
              <h2>Your creative brief</h2>
              <p>{output.creativeBrief}</p>
              <h3>Visual direction</h3>
              <p>{output.visualDirection}</p>
              <button
                className="button button-outline"
                onClick={() => exportCampaign(selected, output, assets, "md")}
              >
                <Download size={16} />
                Export brief & copy
              </button>
            </div>
          ) : activeTab === "Visual prompts" && output ? (
            <>
              <div className="panel output-block">
                <h2>From direction to image</h2>
                <p>{output.visualDirection}</p>
                <span className="provider-disclosure">
                  Claude constructed these prompts. A separate image model will
                  render the visuals.
                </span>
              </div>
              {output.imagePrompts.map((prompt, i) => (
                <article key={i} className="panel prompt-block">
                  <span className="section-eyebrow">
                    VISUAL PROMPT 0{i + 1}
                  </span>
                  <p>{prompt}</p>
                  <div className="prompt-actions">
                    <CopyButton text={prompt} />
                    <button
                      className="button button-primary"
                      disabled={pending}
                      onClick={() => runGeneration("image", prompt)}
                    >
                      {pending ? (
                        <LoaderCircle className="spin" size={16} />
                      ) : (
                        <ImageIcon size={16} />
                      )}
                      {demo ? "Add sample visual" : "Generate image"}
                      <span className="button-cost">
                        {GENERATION_COST_CREDITS} cr
                      </span>
                    </button>
                  </div>
                </article>
              ))}
            </>
          ) : activeTab === "Images" ? (
            <>
              <div className="section-bar">
                <div>
                  <h2>Your campaign visuals</h2>
                  <p>
                    {demo
                      ? "Demo visuals reuse sample artwork. No image provider is called."
                      : "Rendered by the image model. Review product accuracy before publishing."}
                  </p>
                </div>
              </div>
              {assets.length ? (
                <div className="asset-grid">
                  {assets.map((a) => (
                    <article className="asset-card" key={a.id}>
                      <div className="asset-image">
                        <Image
                          src={a.imageUrl}
                          alt={`Creative for ${selected.name}`}
                          fill
                          unoptimized
                          sizes="(max-width: 700px) 90vw, 400px"
                        />
                      </div>
                      <div>
                        <span>{a.model}</span>
                        <button
                          className="icon-button"
                          aria-label="Download image"
                          onClick={() => downloadImage(a.imageUrl)}
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <ImageIcon size={26} />
                  <h3>Give your campaign a visual.</h3>
                  <p>
                    Choose a visual prompt or describe your own image below.
                  </p>
                </div>
              )}
              <form
                className="panel studio-form image-prompt-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const prompt = String(
                    new FormData(e.currentTarget).get("prompt"),
                  );
                  runGeneration("image", prompt);
                }}
              >
                <label>
                  Your image prompt
                  <textarea
                    name="prompt"
                    rows={3}
                    minLength={10}
                    maxLength={4000}
                    required
                    placeholder="Describe the subject, colors, lighting, and composition. Include space for your headline."
                  />
                </label>
                <button className="button button-primary" disabled={pending}>
                  {pending ? (
                    <LoaderCircle className="spin" size={16} />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                  {demo ? "Add sample visual" : "Render image"} ·{" "}
                  {GENERATION_COST_CREDITS} credit
                </button>
              </form>
            </>
          ) : null}
        </div>
        <p className="ai-review-note">
          AI-assisted content. Review accuracy, claims, rights, and platform
          rules before publishing.
        </p>
      </>
    );
  } else if (view === "billing")
    content = (
      <>
        <div className="page-heading">
          <div>
            <h1>A little more creative fuel.</h1>
            <p>
              Demo plans are illustrative. Create an account to access billing.
            </p>
          </div>
        </div>
        <StudioPricing />
      </>
    );
  else {
    const info = pageInfo[view] ?? [
      "Campaign not found",
      "Choose a campaign in your workspace to continue.",
    ];
    content = (
      <>
        <div className="page-heading">
          <div>
            <span className="section-eyebrow">YOUR CREATIVE WORKSPACE</span>
            <h1>{info[0]}</h1>
            <p>{info[1]}</p>
          </div>
          {["campaigns", "projects", "brands"].includes(view) &&
            (view === "campaigns" ? (
              <Link className="button button-primary" href={href("new")}>
                <Plus size={17} />
                New campaign
              </Link>
            ) : (
              <button
                className="button button-primary"
                onClick={() => {
                  setError(null);
                  setModal(view === "brands" ? "brand" : "project");
                }}
              >
                <Plus size={17} />
                {view === "brands" ? "New brand kit" : "New project"}
              </button>
            ))}
        </div>
        {view === "campaigns" ? (
          <>
            <div className="list-toolbar">
              <span>{data.campaigns.length} campaigns</span>
              <label className="search-field">
                <Search size={16} />
                <input
                  aria-label="Search campaigns"
                  placeholder="Find a campaign…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
            {filtered.length ? (
              campaignCards(filtered)
            ) : (
              <EmptyState
                title={
                  search
                    ? "No matching campaigns"
                    : "Give your next idea a home."
                }
                text={
                  search
                    ? "Try another campaign or brand name."
                    : "Start a campaign and let the direction unfold."
                }
                href={href("new")}
                cta="New campaign"
              />
            )}
          </>
        ) : view === "projects" ? (
          <div className="entity-grid">
            {data.projects.map((p) => (
              <article className="panel project-card" key={p.id}>
                <span className="feature-icon violet">
                  <FolderOpen size={24} />
                </span>
                <h2>{p.name}</h2>
                <p>{p.description || "A fresh home for your next idea."}</p>
                <div>
                  <span>
                    {data.campaigns.filter((c) => c.projectId === p.id).length}{" "}
                    campaigns
                  </span>
                  <Link className="text-link" href={href("new")}>
                    Create campaign <ArrowUpRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
            {!data.projects.length && (
              <EmptyState
                title="Room for your next big idea."
                text="Create a project to keep related campaigns together."
                href={href("new")}
                cta="Get started"
              />
            )}
          </div>
        ) : view === "brands" ? (
          <div className="entity-grid">
            {data.brands.map((b) => (
              <article className="panel brand-kit-card" key={b.id}>
                <div className="brand-kit-top">
                  <span
                    className="brand-initial"
                    style={{ background: b.colors.split(",")[0] }}
                  >
                    {b.name.charAt(0)}
                  </span>
                  <span className="status-chip">{b.industry}</span>
                </div>
                <h2>{b.name}</h2>
                <div className="brand-palette">
                  {b.colors.split(",").map((color) => (
                    <span
                      key={color}
                      style={{ background: color.trim() }}
                      title={color.trim()}
                    />
                  ))}
                </div>
                <span className="section-eyebrow">THE VOICE</span>
                <p>{b.voice}</p>
                <span className="section-eyebrow">THE AUDIENCE</span>
                <p>{b.audience}</p>
              </article>
            ))}
            {!data.brands.length && (
              <EmptyState
                title="Your brand deserves its own voice."
                text="Use New brand kit to add your audience, voice, and palette."
                href={href("new")}
                cta="Start a campaign"
              />
            )}
          </div>
        ) : view === "creatives" ? (
          data.assets.length ? (
            <div className="asset-grid">
              {data.assets.map((a) => (
                <article className="asset-card" key={a.id}>
                  <Link
                    className="asset-image"
                    href={href("campaign", a.campaignId)}
                  >
                    <Image
                      src={a.imageUrl}
                      alt="Saved campaign creative"
                      fill
                      unoptimized
                      sizes="(max-width: 700px) 90vw, 400px"
                    />
                  </Link>
                  <div>
                    <span>
                      {data.campaigns.find((c) => c.id === a.campaignId)
                        ?.name ?? "Campaign visual"}
                    </span>
                    <button
                      className="icon-button"
                      aria-label="Download image"
                      onClick={() => downloadImage(a.imageUrl)}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="A gallery waiting to happen."
              text="Render your first campaign visual and it will live here."
              href={href("new")}
              cta="Create campaign"
            />
          )
        ) : view === "history" || view === "usage" ? (
          <>
            {view === "usage" && (
              <>
                <div className="stats-grid">
                  {[
                    { label: "Credits available", value: data.credits },
                    {
                      label: "Credits used",
                      value: data.runs
                        .filter((r) => r.status === "completed")
                        .reduce((s, r) => s + r.credits, 0),
                    },
                    {
                      label: "Claude input tokens",
                      value: data.runs.reduce((s, r) => s + r.inputTokens, 0),
                    },
                    {
                      label: "Claude output tokens",
                      value: data.runs.reduce((s, r) => s + r.outputTokens, 0),
                    },
                  ].map((s) => (
                    <div className="stat-card" key={s.label}>
                      <span>{s.label}</span>
                      <strong>{s.value.toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
                <div className="panel usage-chart">
                  <div>
                    <h2>Creative activity</h2>
                    <p className="muted">
                      Completed generations in the last seven days.
                    </p>
                  </div>
                  <div className="chart-bars">
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - 6 + i);
                      const day = date.toLocaleDateString("en-CA", {
                        timeZone: "Asia/Dhaka",
                      });
                      const count = data.runs.filter(
                        (r) =>
                          r.status === "completed" &&
                          new Date(r.createdAt).toLocaleDateString("en-CA", {
                            timeZone: "Asia/Dhaka",
                          }) === day,
                      ).length;
                      return (
                        <div key={i}>
                          <span className="bar-value">{count}</span>
                          <span
                            className="activity-bar"
                            style={{
                              height: `${Math.min(120, count * 16 + 4)}px`,
                            }}
                          />
                          <small>
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                              timeZone: "Asia/Dhaka",
                            })}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                  <p className="muted">
                    Cache reads:{" "}
                    {data.runs.reduce((s, r) => s + r.cacheReadTokens, 0)}{" "}
                    tokens · cache writes:{" "}
                    {data.runs.reduce((s, r) => s + r.cacheCreationTokens, 0)}{" "}
                    tokens.
                  </p>
                </div>
              </>
            )}
            <div className="section-bar">
              <h2>
                {view === "history" ? "Generation audit trail" : "Recent usage"}
              </h2>
              <button
                className="button button-outline button-small"
                onClick={() =>
                  downloadText(
                    JSON.stringify(data.runs, null, 2),
                    "habib-generation-history.json",
                    "application/json",
                  )
                }
              >
                <Download size={14} />
                Export history
              </button>
            </div>
            <div className="audit-table-wrap">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Generation</th>
                    <th>Provider & tokens</th>
                    <th>Status</th>
                    <th>Credits</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.runs.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link href={href("campaign", r.campaignId)}>
                          {data.campaigns.find((c) => c.id === r.campaignId)
                            ?.name ?? "Campaign"}
                        </Link>
                        <small>
                          {r.kind} · {r.id}
                        </small>
                        <small>
                          {r.promptVersion} · {r.durationMs ?? 0} ms
                        </small>
                      </td>
                      <td>
                        {r.model}
                        <small>
                          {r.inputTokens} input / {r.outputTokens} output
                        </small>
                        {r.providerRequestId && (
                          <small>Provider: {r.providerRequestId}</small>
                        )}
                      </td>
                      <td>
                        <span className={`status-chip ${r.status}`}>
                          {r.status}
                        </span>
                        {r.errorCode && <small>{r.errorCode}</small>}
                        {r.refunded && <small>Credits refunded</small>}
                      </td>
                      <td>
                        {r.refunded
                          ? 0
                          : r.status === "completed" || r.status === "pending"
                            ? r.credits
                            : "See credit ledger"}
                      </td>
                      <td>{shortDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.runs.length && (
                <div className="empty-state">
                  <Clock size={24} />
                  <h3>Your creative story starts soon.</h3>
                  <p>
                    Generations will appear here with their usage and credit
                    details.
                  </p>
                </div>
              )}
            </div>
            <p className="muted audit-footnote">
              Shows the latest 200 generation records. Demo calls use zero
              provider tokens. Billing includes your complete credit ledger.
            </p>
          </>
        ) : (
          <EmptyState
            title="Let's find your campaign."
            text="Open a campaign from your workspace."
            href={href("campaigns")}
            cta="View campaigns"
          />
        )}
      </>
    );
  }
  const inner = (
    <>
      {content}
      <Dialog
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
            setError(null);
          }
        }}
      >
        <DialogContent className="entity-dialog">
          <DialogTitle>
            {modal === "brand"
              ? "Give your brand a voice."
              : "A home for your next idea."}
          </DialogTitle>
          <DialogDescription>
            {modal === "brand"
              ? "Your brand kit guides every campaign's audience, words, and visual direction."
              : "Keep related campaigns together in a project."}
          </DialogDescription>
          <form className="studio-form" onSubmit={entitySubmit}>
            {modal === "brand" ? (
              <>
                <label>
                  Brand name
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="e.g. Bloom Skincare"
                  />
                </label>
                <label>
                  Industry
                  <input
                    name="industry"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="e.g. Skincare"
                  />
                </label>
                <label>
                  Audience
                  <textarea
                    name="audience"
                    required
                    minLength={5}
                    maxLength={1000}
                    rows={2}
                    placeholder="Who are you speaking to?"
                  />
                </label>
                <label>
                  Brand voice
                  <textarea
                    name="voice"
                    required
                    minLength={3}
                    maxLength={500}
                    rows={2}
                    placeholder="e.g. Warm, considered, and a little playful"
                  />
                </label>
                <label>
                  Brand colors
                  <input
                    name="colors"
                    required
                    defaultValue="#ead6c7, #67574c, #faf4eb"
                    maxLength={150}
                  />
                  <small>Up to 5 hex colors, separated by commas.</small>
                </label>
              </>
            ) : (
              <>
                <label>
                  Project name
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={120}
                    placeholder="e.g. Autumn product launch"
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    maxLength={1000}
                    placeholder="What are we making room for?"
                  />
                </label>
              </>
            )}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button className="button button-primary" disabled={pending}>
              {pending ? (
                <LoaderCircle size={16} className="spin" />
              ) : (
                <Plus size={16} />
              )}
              {modal === "brand" ? "Save brand kit" : "Create project"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
      {demo && (
        <div className="demo-reset">
          <button
            className="text-link"
            onClick={() => {
              persist(createDemoData());
              router.push(href("dashboard"));
              toast.success("Demo reset. A fresh canvas awaits.");
            }}
          >
            <RotateCcw size={13} />
            Reset sample workspace
          </button>
          <span>Sample brands · simulated generations · browser storage</span>
        </div>
      )}
    </>
  );
  return demo ? (
    <StudioShell name={data.name} credits={data.credits} demo activeView={view}>
      {inner}
    </StudioShell>
  ) : (
    inner
  );
}
async function downloadImage(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error();
    const blob = await response.blob();
    const link = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = link;
    a.download = `habib-creative.${blob.type.includes("svg") ? "svg" : blob.type.includes("jpeg") ? "jpg" : "png"}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(link), 1000);
  } catch {
    toast.error("Image download failed. Open the campaign and try again.");
  }
}
