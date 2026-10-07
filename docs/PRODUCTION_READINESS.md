# Production readiness checklist

Code is implemented and locally testable. This checklist is the launch gate; it does not claim that external services or the domain have been provisioned.

## Delivered

- [x] Habib AI Studio marketing, application, demo brands and trust pages.
- [x] Real PostgreSQL project, brand, campaign, run and asset persistence.
- [x] Server-side Anthropic Messages integration and independent image-provider integration.
- [x] Structured input/output validation and tenant authorization on reads and mutations.
- [x] Atomic credit spends, unique request IDs, refunds, audit records and interrupted-run reconciliation.
- [x] Existing Stripe signature verification, checkout, portal and credit-grant paths preserved.
- [x] Claude input/output/cache token counters, provider IDs, version, duration, credit/refund metadata.
- [x] JSON/Markdown campaign exports, image downloads, copy controls and history exports.
- [x] Demo-mode disclosure, content review guidance, responsive navigation, keyboard focus and reduced-motion support.
- [x] Production refuses mocked AI and requires essential live service settings.
- [x] README, environment example, deployment guide, architecture and demo script.

## Before paid launch

- [ ] Provision hosting, PostgreSQL, Anthropic, AI Gateway, Blob, Upstash, Resend and Stripe under your accounts.
- [ ] Set and rotate real secrets; confirm credentials belong to the intended environment.
- [ ] Run migrations on staging, back up production, then apply reviewed migrations to production.
- [ ] Verify a real Claude response and its token/request audit metadata.
- [ ] Verify a real image render, persistent storage, download and matching charge.
- [ ] Verify selected model availability, commercial terms, cost per generation, and plan margins.
- [ ] Run real email verification, password reset and account deletion flows with a verified sender.
- [ ] Provision and monitor the configured support mailbox.
- [ ] Test Stripe checkout, top-up, webhook replay, renewal, cancellation, payment failure and customer portal with test clocks.
- [ ] Review public image URL visibility; implement private assets if confidential-image use is required.
- [ ] Define asset deletion, backup and provider retention; implement automatic cleanup or staff the disclosed removal process.
- [ ] Review privacy/terms with the actual operator identity, legal jurisdiction, provider contracts, prices and refund practices.
- [ ] Attach domain, apply registrar DNS, verify HTTPS, redirects and OAuth callback URLs.
- [ ] Enable hourly maintenance on a supported scheduler and alert on failures/refund-pending records.
- [ ] Set provider budgets, abuse monitoring, refund alerts, database backups and restore drills.
- [ ] Re-run end-to-end tests in staging and manually review 360px mobile, tablet and desktop layouts.
- [ ] Decide when large-workspace pagination and asynchronous queues are needed; recent usage views are capped at 200 records.
- [ ] Switch to live payments only after the staging gate is complete.

See [verification](VERIFICATION.md) for executed checks, and [deployment](DEPLOYMENT.md) for configuration and smoke tests.
