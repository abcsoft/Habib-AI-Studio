import Link from "next/link";
import { env } from "@/lib/env";
export const metadata = { title: "Terms of service" };
export default function Terms() {
  return (
    <article className="legal-page">
      <span className="section-eyebrow">
        THE DETAILS · UPDATED OCTOBER 8, 2026
      </span>
      <h1>A shared creative understanding.</h1>
      <p>
        These terms apply to Habib AI Studio at mdhabiburrahman.xyz. By creating
        an account or using paid services, you agree to these terms and the{" "}
        <Link href="/privacy">Privacy Policy</Link>. Questions can be sent to{" "}
        <a href={`mailto:${env.CONTACT_EMAIL}`}>{env.CONTACT_EMAIL}</a>.
      </p>
      <h2>Your account</h2>
      <p>
        You must be an adult with authority to enter this agreement and, where
        applicable, act for your business. Keep your sign-in details secure and
        provide accurate account information. You are responsible for activity
        authorized through your account. Contact support if you suspect
        unauthorized use.
      </p>
      <h2>What the studio provides</h2>
      <p>
        The studio helps generate campaign strategy, concepts, hooks, headlines,
        copy, creative briefs, image prompts, and images. Claude performs
        reasoning and writing. A separate image provider renders images.
        Generated content is a draft for your review. We do not promise
        originality, factual accuracy, regulatory suitability, increased sales,
        or advertising performance.
      </p>
      <h2>Your content and acceptable use</h2>
      <p>
        You retain rights in material you submit. You authorize us and our
        service providers to process it to deliver the requested features.
        Submit only content you have permission to use. You are responsible for
        reviewing outputs and obtaining permissions for people, trademarks,
        copyrighted material, and product claims used in advertising.
      </p>
      <p>
        Do not use the studio for unlawful, deceptive, discriminatory,
        infringing, abusive, or harmful advertising, impersonation, fraud, or
        attempts to bypass service safeguards. AI provider and
        advertising-platform policies may also apply. We may limit or suspend
        misuse and investigate account or payment abuse.
      </p>
      <h2>Plans, credits, and payments</h2>
      <p>
        Prices and included credits are displayed before purchase in USD.
        Subscriptions renew monthly until cancelled through Billing.
        Cancellation stops future renewals; access continues according to your
        current subscription period. Price changes will be communicated before
        taking effect.
      </p>
      <p>
        Credits are service usage units, not cash or a transferable balance.
        Welcome credits are granted once. Current generation costs are shown at
        the point of use. Credits do not expire under the current plans. Failed
        generations receive compensating credit refunds; provider, storage, or
        network interruptions may require reconciliation. Contact support with
        the generation ID if a refund remains pending.
      </p>
      <p>
        Refunds for purchases are reviewed by support based on the transaction,
        consumed service, and applicable law. Mandatory consumer and payment
        rights prevail. We do not store full payment-card details; Stripe
        processes checkout and billing.
      </p>
      <h2>Output rights and responsibility</h2>
      <p>
        To the extent permitted by applicable provider terms and law, you may
        use exported output for your business. Outputs may resemble other
        content and may not qualify for intellectual-property protection. No
        exclusive rights or clearance are guaranteed. You remain responsible for
        how you publish and use the content.
      </p>
      <h2>Availability and liability</h2>
      <p>
        The service depends on third-party hosting, payment, and AI providers
        and may experience interruptions. We aim to preserve audit records and
        address failures, but availability and error-free generation are not
        guaranteed. To the extent allowed by law, the service is provided
        without warranties of fitness or advertising outcomes. These terms do
        not exclude liability or rights that cannot lawfully be excluded.
      </p>
      <h2>Ending use and contacting us</h2>
      <p>
        You can export your work, cancel subscriptions, and delete your account
        in Settings. Deleting an account does not automatically retract content
        you have published elsewhere. We may suspend or end access for material
        misuse, unpaid charges, or legal requirements. Contact{" "}
        <a href={`mailto:${env.CONTACT_EMAIL}`}>{env.CONTACT_EMAIL}</a> to
        resolve a concern before escalating a dispute.
      </p>
      <p>
        Updates will be published here with a revised date. Material payment
        changes apply prospectively. Read the{" "}
        <Link href="/ai-disclosure">AI-generated content disclosure</Link>{" "}
        before publishing a campaign.
      </p>
    </article>
  );
}
