# Deploy Habib AI Studio

The target domain is **mdhabiburrahman.xyz**. Code is configured for that canonical URL; no domain or external hosting changes have been made by this implementation.

## Services

Provision PostgreSQL 16+, an Anthropic API workspace, Vercel AI Gateway, Vercel Blob, Upstash Redis, Resend, and a Stripe account suitable for your operating business. Use staging resources first. Put secrets only in the host's secret manager; use `.env.example` as the complete variable reference.

Production validation requires the provider keys, Stripe configuration, Blob token, Resend key, distributed limiter pair, and `CRON_SECRET`. Set `AI_MOCK=false` and a random `BETTER_AUTH_SECRET` of at least 32 characters. Set `BETTER_AUTH_URL=https://mdhabiburrahman.xyz` and `EMAIL_FROM` to a verified sender. Verify `CONTACT_EMAIL` reaches a monitored inbox.

Claude uses `ANTHROPIC_API_KEY` on the server. The configured Claude model must support structured JSON output. Image generation uses `AI_GATEWAY_API_KEY` and `AI_IMAGE_MODEL` independently. Validate access to your selected models using staging smoke tests. Current contracts are based on [Anthropic structured output documentation](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) and [Vercel image-generation documentation](https://vercel.com/docs/ai-gateway/getting-started/image).

## Database

Take a backup before migrating an existing deployment. Use a direct PostgreSQL connection for migration, and an appropriate pooled connection for runtime. Never edit applied migrations.

```sh
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Set `DATABASE_URL` to a dedicated test database for `pnpm test`, then restore the production runtime URL for the build/deployment. The test suite creates test fixtures and must never run against a production database. Migrations `0004` and `0005` add workspace tables and cascade rules; they do not change the credit ledger or existing subscription state.

## Stripe

Create these prices and connect their IDs in the environment:

| Environment key            | Price           | Product usage                          |
| -------------------------- | --------------- | -------------------------------------- |
| STRIPE_PRICE_PRO_MONTHLY   | USD 9.00/month  | Creator, 200 credits per paid invoice  |
| STRIPE_PRICE_ULTRA_MONTHLY | USD 29.00/month | Studio, 1,000 credits per paid invoice |
| STRIPE_PRICE_TOPUP_100     | USD 5.00 once   | 100 credits                            |

Create the endpoint `https://mdhabiburrahman.xyz/api/stripe/webhook`. Configure `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`. Copy its signing secret to `STRIPE_WEBHOOK_SECRET`. Activate the Stripe Customer Portal and enable the intended cancellation and plan-switch behavior.

Signed raw-body verification and idempotency are retained from the starter. A success redirect is not proof of payment. Before launch, test checkout, duplicate webhook delivery, renewals with Stripe test clocks, plan changes, cancellation, failed payment recovery, and top-ups. Ensure actual Stripe prices match `src/config/plans.ts`.

## Hosting and domain

For Vercel, import your own repository, use pnpm, Node.js 24, and the default Next.js preset. Set build and runtime environment values separately for preview/staging/production. Image and campaign routes set a 180-second host budget; provider calls have 90-second abort deadlines. Use a host plan supporting those limits. The hourly cron in `vercel.json` requires a cron-compatible hosting plan; if using another host, schedule a GET to the protected maintenance endpoint with the same bearer secret.

Add `mdhabiburrahman.xyz` in your hosting dashboard. Apply the exact DNS records the host supplies through your registrar. Enable HTTPS and verify the root domain and any www redirect. Configure OAuth callback URLs using this domain if you enable social login. Verify Resend DNS and sender deliverability. Do not put live keys in preview environments.

For self-hosting, run `pnpm build` and `pnpm start` behind an HTTPS reverse proxy. Forward Host/Origin correctly for Server Actions. Use a stable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` if multiple independently built instances share traffic; manage it in the host environment as described by Next.js. Ensure database connections, storage, Redis, email, and the reconciliation scheduler remain available.

## Smoke test

1. Visit `/`, `/demo`, pricing, contact, privacy, terms and disclosure on desktop and mobile. Confirm artwork loads.
2. Sign up through email verification, sign in, reset a password, and test sign out.
3. Create a project and brand kit; enter a product and choose a goal/channel.
4. Generate a live Claude package. Confirm its usage/model/request ID appears in History and exactly 3 credits are spent.
5. Generate a live image separately. Confirm durable storage, model metadata, download, and exactly 1 credit spent.
6. Save/reload the campaign; export JSON/Markdown and image. Verify another account cannot view it.
7. Exercise a controlled provider failure in staging and confirm a refund. Interrupt a staging run and invoke `/api/maintenance/reconcile` with the secret after the grace period. Confirm no double refund on replay.
8. Complete Stripe test-mode transactions and lifecycle checks. Swap to live Stripe only after validation.
9. Test account deletion, exported data, asset-removal support procedure, backups, restore, monitoring and alerts.

Production image URLs currently use public Blob access. Review that choice with your privacy requirements. Stored files are not automatically deleted on account deletion; operator removal and backup/provider retention must be reviewed before launch. Keep deployment keys out of logs and history.

See [production readiness](PRODUCTION_READINESS.md) for the remaining operator gate. Deployment and external service smoke tests require your accounts and credentials.
