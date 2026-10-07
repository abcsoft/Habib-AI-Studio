import Link from "next/link";
import { env } from "@/lib/env";
export const metadata = { title: "Privacy policy" };
export default function Privacy() {
  return (
    <article className="legal-page">
      <span className="section-eyebrow">
        THE DETAILS · UPDATED OCTOBER 8, 2026
      </span>
      <h1>Your work. Your privacy.</h1>
      <p>
        This policy describes how Habib AI Studio at mdhabiburrahman.xyz handles
        information when you use the studio. Contact{" "}
        <a href={`mailto:${env.CONTACT_EMAIL}`}>{env.CONTACT_EMAIL}</a> for
        privacy questions and requests.
      </p>
      <h2>Information we collect</h2>
      <p>
        We store account details such as your name, email address, password
        hash, and session information. Sessions may include an IP address and
        browser user agent. We also store the brand kits, project details,
        product briefs, prompts, campaign outputs, and generated asset links you
        provide or create.
      </p>
      <p>
        Generation records include the provider/model, prompt version, provider
        request ID, timestamps, latency, token usage, credit charges, and refund
        status. These records support account history, service operations, and
        billing reconciliation. Stripe handles card details; card numbers are
        not stored by this application.
      </p>
      <h2>Why we use your information</h2>
      <p>
        We use information to authenticate your account, generate your requested
        content, save projects and campaigns, track credit usage, manage
        payments, send account emails, prevent abuse, resolve failures, and
        respond to support requests. We do not sell your personal information.
        This application does not include third-party advertising trackers or
        optional analytics.
      </p>
      <h2>AI providers and service partners</h2>
      <p>
        Campaign briefs and relevant brand details are sent to Anthropic’s API
        for strategy, copy, and prompts. Image prompts are sent through Vercel
        AI Gateway to the configured image model provider. Do not enter
        passwords, private customer records, or sensitive personal information
        in creative briefs.
      </p>
      <p>
        Depending on deployment configuration, hosting and asset storage use
        Vercel, account data uses a PostgreSQL provider, billing uses Stripe,
        email uses Resend, and rate limiting uses Upstash. These services
        process data to operate the studio, potentially outside your country.
        Their own privacy terms, retention periods, and contractual arrangements
        apply. See{" "}
        <a
          href="https://platform.claude.com/docs/en/manage-claude/api-and-data-retention"
          target="_blank"
          rel="noreferrer"
        >
          Anthropic’s API retention documentation
        </a>{" "}
        for current provider details.
      </p>
      <h2>Generated image visibility</h2>
      <p>
        Campaign records are restricted to your account. Production image
        storage currently uses public asset URLs: anyone with an image’s URL may
        access that image. Treat generated assets as shareable and do not render
        confidential material. Account deletion removes asset references from
        the database; ask support to remove stored files and review backup
        retention.
      </p>
      <h2>Cookies and demo storage</h2>
      <p>
        Essential session cookies keep you signed in. The public demo uses
        browser storage to remember simulated campaigns and credits on your
        device. Reset the demo or clear site storage to remove that data. Demo
        actions do not call AI providers or create billing transactions.
      </p>
      <h2>Retention and your choices</h2>
      <p>
        Workspace data stays in your account while it is active. You can export
        campaigns and generation history, and delete your account in Settings.
        Database records linked to the account are removed by the account
        deletion process; payment records, backups, and provider-held
        information may remain where needed for financial, legal, security, or
        operational purposes. Contact support for access, correction, erasure,
        and retained-asset requests. Applicable privacy rights are respected.
      </p>
      <h2>Security and changes</h2>
      <p>
        We use server-side authentication, ownership checks, validated inputs,
        and signed payment webhooks. No service can promise absolute security.
        Material updates to this policy will be posted here with an updated
        date. The studio is intended for adults using creative tools for
        business purposes.
      </p>
      <p>
        Also see our <Link href="/terms">Terms</Link> and{" "}
        <Link href="/ai-disclosure">AI content disclosure</Link>.
      </p>
    </article>
  );
}
