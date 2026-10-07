"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Megaphone,
  Palette,
  ImageIcon,
  History,
  BarChart3,
  CreditCard,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  CircleHelp,
  ChevronDown,
} from "lucide-react";
import { BrandMark } from "./brand-mark";
import { UserMenu } from "@/components/app/user-menu";
import type { StudioView } from "@/lib/studio/types";
import { WELCOME_CREDITS } from "@/config/plans";

const nav = [
  { view: "dashboard", label: "Overview", icon: LayoutDashboard },
  { view: "projects", label: "Projects", icon: FolderOpen },
  { view: "campaigns", label: "Campaigns", icon: Megaphone },
  { view: "brands", label: "Brand kits", icon: Palette },
  { view: "creatives", label: "Saved creatives", icon: ImageIcon },
  { view: "history", label: "Generation history", icon: History },
  { view: "usage", label: "Usage & credits", icon: BarChart3 },
  { view: "billing", label: "Billing", icon: CreditCard },
] as const;
export function studioHref(view: StudioView, demo: boolean, id?: string) {
  return demo
    ? `/demo?view=${view}${id ? `&id=${id}` : ""}`
    : view === "new"
      ? "/campaigns/new"
      : view === "campaign"
        ? `/campaigns/${id}`
        : `/${view}`;
}
export function StudioShell({
  children,
  name,
  email = "",
  credits,
  demo = false,
  activeView,
}: {
  children: React.ReactNode;
  name: string;
  email?: string;
  credits: number;
  demo?: boolean;
  activeView?: StudioView;
}) {
  const path = usePathname(),
    [open, setOpen] = useState(false);
  return (
    <div className="studio-shell">
      <button
        className="mobile-nav-button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`studio-sidebar ${open ? "is-open" : ""}`}>
        <BrandMark compact />
        <div className="workspace-label">
          <span className="workspace-avatar">H</span>
          <span>
            My workspace
            <small>{demo ? "Demo workspace" : "Personal workspace"}</small>
          </span>
          <ChevronDown size={14} />
        </div>
        <p className="nav-section-label">WORKSPACE</p>
        <nav aria-label="Studio navigation">
          {nav.slice(0, 5).map((n) => (
            <Link
              key={n.view}
              href={studioHref(n.view, demo)}
              onClick={() => setOpen(false)}
              aria-current={
                (demo ? activeView === n.view : path.startsWith(`/${n.view}`))
                  ? "page"
                  : undefined
              }
            >
              <n.icon size={18} />
              <span>{n.label}</span>
              {n.view === "campaigns" && <span className="tiny-label">AI</span>}
            </Link>
          ))}
        </nav>
        <p className="nav-section-label">MANAGE</p>
        <nav aria-label="Account navigation">
          {nav.slice(5).map((n) => (
            <Link
              key={n.view}
              href={studioHref(n.view, demo)}
              onClick={() => setOpen(false)}
              aria-current={
                (demo ? activeView === n.view : path.startsWith(`/${n.view}`))
                  ? "page"
                  : undefined
              }
            >
              <n.icon size={18} />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="credit-card">
            <div>
              <Sparkles size={16} />
              Your creative fuel
            </div>
            <strong>
              {credits}
              <span> credits left</span>
            </strong>
            <div className="credit-meter">
              <span
                style={{
                  width: `${Math.min(100, (credits / WELCOME_CREDITS) * 100)}%`,
                }}
              />
            </div>
            <Link href={studioHref("billing", demo)}>
              Get more credits <ArrowUpRight size={15} />
            </Link>
          </div>
          <Link href="/contact" className="help-link">
            <CircleHelp size={17} /> Help & support <ArrowUpRight size={15} />
          </Link>
        </div>
      </aside>
      <div className="studio-main">
        <header className="studio-topbar">
          <div className="topbar-breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>
              {nav.find((n) => n.view === activeView)?.label ??
                "Creative studio"}
            </strong>
          </div>
          <div className="topbar-right">
            {demo && <span className="demo-badge">Demo mode</span>}
            <Link className="credits-pill" href={studioHref("billing", demo)}>
              <Sparkles size={14} />
              <span data-testid="credit-balance">{credits}</span> credits
            </Link>
            {demo ? (
              <Link
                href="/signup"
                className="user-avatar"
                aria-label="Create your account"
              >
                H
              </Link>
            ) : (
              <UserMenu name={name} email={email} />
            )}
          </div>
        </header>
        {demo && (
          <div className="demo-notice">
            You’re exploring a sample workspace. Generations are simulated and
            saved in this browser.{" "}
            <Link href="/signup">
              Create your own studio <ArrowUpRight size={13} />
            </Link>
          </div>
        )}
        <main className="studio-content">{children}</main>
      </div>
    </div>
  );
}
