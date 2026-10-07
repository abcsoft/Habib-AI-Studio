import { eq } from "drizzle-orm";
import { Sparkles, Check, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import {
  plans,
  topupPack,
  CAMPAIGN_COST_CREDITS,
  GENERATION_COST_CREDITS,
} from "@/config/plans";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import {
  createCheckoutSession,
  createPortalSession,
} from "@/lib/billing/actions";
import { planByPriceId } from "@/lib/billing/plans";
import { features } from "@/lib/env";
import { getBalance, getHistory } from "@/lib/credits";
import { SubmitButton } from "@/components/busy-button";
import { LedgerTable } from "@/components/ledger-table";
export const metadata = { title: "Billing" };
export default async function BillingPage() {
  const session = await requireSession();
  const [rows, balance, ledger] = await Promise.all([
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1),
    getBalance(session.user.id),
    getHistory(session.user.id, 100),
  ]);
  const sub = rows[0],
    active = sub?.status === "active" || sub?.status === "trialing";
  const current =
    active && sub?.priceId
      ? (planByPriceId(sub.priceId) ?? plans.free)
      : plans.free;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="section-eyebrow">YOUR CREATIVE FUEL</span>
          <h1>Billing</h1>
          <p>Keep your studio stocked with a little more possibility.</p>
        </div>
      </div>
      <div className="panel billing-current">
        <div>
          <span className="section-eyebrow">CURRENT PLAN</span>
          <h2>{current.name}</h2>
          <p>
            {active && sub?.currentPeriodEnd
              ? `${sub.cancelAtPeriodEnd ? "Ends" : "Renews"} ${sub.currentPeriodEnd.toLocaleDateString("en-US", { timeZone: "Asia/Dhaka" })}`
              : "No paid subscription. Welcome and top-up credits do not expire."}
          </p>
        </div>
        <div>
          <Sparkles size={18} />
          <strong>{balance}</strong>
          <span>credits available</span>
        </div>
        {active && features.billing && (
          <form action={createPortalSession}>
            <SubmitButton busyLabel="Opening portal…">
              Manage subscription
            </SubmitButton>
          </form>
        )}
      </div>
      {!features.billing && (
        <div className="billing-notice">
          <p>
            Payments are being set up. Your existing credits remain available.
            You can explore the free demo while billing is configured.
          </p>
          <Link href="/contact" className="text-link">
            Contact the studio <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
      <div className="billing-plans">
        {[plans.pro, plans.ultra].map((p) => (
          <article className="pricing-card" key={p.id}>
            <span className="plan-name">{p.name}</span>
            <div className="price">
              ${p.priceMonthlyCents / 100}
              <span> / month</span>
            </div>
            <div className="plan-credits">
              {p.monthlyCredits.toLocaleString()} credits every month
            </div>
            <ul>
              {[
                "Claude strategy & copy",
                "Image rendering & saved creatives",
                "Projects, brand kits & exports",
                "Credits accumulate without expiry",
              ].map((f) => (
                <li key={f}>
                  <Check size={15} />
                  {f}
                </li>
              ))}
            </ul>
            {active && current.id === p.id ? (
              <span className="status-chip saved">Current plan</span>
            ) : (
              <form
                action={active ? createPortalSession : createCheckoutSession}
              >
                {!active && <input type="hidden" name="item" value={p.id} />}
                <SubmitButton
                  disabled={!features.billing}
                  busyLabel="Opening checkout…"
                >
                  {active ? `Switch to ${p.name}` : `Upgrade to ${p.name}`}
                </SubmitButton>
              </form>
            )}
          </article>
        ))}
      </div>
      <div className="panel billing-topup">
        <div>
          <h2>Just a little top-up</h2>
          <p>
            {topupPack.credits} credits, one time · $
            {topupPack.priceCents / 100}
          </p>
        </div>
        <form action={createCheckoutSession}>
          <input type="hidden" name="item" value="topup" />
          <SubmitButton
            disabled={!features.billing}
            busyLabel="Opening checkout…"
          >
            Buy top-up
          </SubmitButton>
        </form>
      </div>
      <p className="billing-credit-note">
        Campaign package: {CAMPAIGN_COST_CREDITS} credits · image:{" "}
        {GENERATION_COST_CREDITS} credit. Failed generations are refunded.
        Prices in USD.
      </p>
      <div className="section-bar">
        <div>
          <h2>Your credit ledger</h2>
          <p>The latest 100 grants, spends, and refunds.</p>
        </div>
      </div>
      <div className="panel billing-ledger">
        <LedgerTable
          entries={ledger.map((r) => ({
            id: r.id,
            timestamp: r.createdAt.toLocaleString("en-GB", {
              timeZone: "Asia/Dhaka",
            }),
            type: r.type,
            ref: `${r.refType ?? ""} ${r.refId ?? ""}`,
            amount: r.amount,
          }))}
        />
      </div>
    </>
  );
}
