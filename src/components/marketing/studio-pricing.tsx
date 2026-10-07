import Link from "next/link";
import { Check, ArrowUpRight, Sparkles } from "lucide-react";
import {
  plans,
  WELCOME_CREDITS,
  CAMPAIGN_COST_CREDITS,
  GENERATION_COST_CREDITS,
  topupPack,
} from "@/config/plans";
export function StudioPricing() {
  return (
    <section id="pricing" className="site-section pricing-section">
      <div className="site-container">
        <div className="section-heading centered">
          <span className="section-eyebrow">ROOM TO GROW</span>
          <h2>
            Big ideas. <em>Simple pricing.</em>
          </h2>
          <p>
            Start small, find your flow, and add creative fuel when you need it.
          </p>
        </div>
        <div className="pricing-grid">
          {Object.values(plans).map((plan) => (
            <article
              key={plan.id}
              className={`pricing-card ${plan.id === "pro" ? "featured" : ""}`}
            >
              {plan.id === "pro" && (
                <span className="plan-popular">
                  <Sparkles size={12} /> THE CREATOR’S CHOICE
                </span>
              )}
              <span className="plan-name">
                {plan.id === "free"
                  ? "Starter"
                  : plan.id === "pro"
                    ? "Creator"
                    : "Studio"}
              </span>
              <p>
                {plan.id === "free"
                  ? "Give your first idea a little momentum."
                  : plan.id === "pro"
                    ? "For a steady flow of fresh campaigns."
                    : "For brands with more stories to tell."}
              </p>
              <div className="price">
                ${plan.priceMonthlyCents / 100}
                <span> / month</span>
              </div>
              <div className="plan-credits">
                {plan.id === "free"
                  ? `${WELCOME_CREDITS} welcome credits · one time`
                  : `${plan.monthlyCredits.toLocaleString()} credits every month`}
              </div>
              <Link
                href="/signup"
                className={`button ${plan.id === "pro" ? "button-primary" : "button-outline"}`}
              >
                {plan.id === "free"
                  ? "Start for free"
                  : "Choose " + (plan.id === "pro" ? "Creator" : "Studio")}
                <ArrowUpRight size={16} />
              </Link>
              <ul>
                {[
                  "Claude campaign strategy & copy",
                  "Separate AI image rendering",
                  "Projects & brand kits",
                  "Saved campaigns & asset exports",
                  ...(plan.id === "free"
                    ? []
                    : [
                        "Credits accumulate without expiry",
                        "Cancel anytime in billing",
                      ]),
                ].map((f) => (
                  <li key={f}>
                    <Check size={15} />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="pricing-footnote">
          A campaign package uses {CAMPAIGN_COST_CREDITS} credits. One image
          uses {GENERATION_COST_CREDITS} credit. Need a top-up?{" "}
          {topupPack.credits} credits for ${topupPack.priceCents / 100}. All
          prices in USD.
        </p>
      </div>
    </section>
  );
}
