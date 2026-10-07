# Habib AI Studio

An AI creative and advertising workspace for founders, marketers, and small businesses. Branded for **https://mdhabiburrahman.xyz** and built on [Nikandr Surkov's AI SaaS Starter](https://github.com/nikandr-surkov/ai-saas-starter), with the upstream MIT license retained.

## What works

- Marketing site with original creative imagery, showcase, workflow, pricing, FAQ, a captioned 75-second demo video, interactive walkthrough, and trust pages.
- Public `/demo` workspace: fashion, SaaS, restaurant, and skincare brands. Simulated generations, browser persistence, reset, credits, and exports. No signup or AI calls.
- Authenticated projects, brand kits, campaigns, saved creatives, generation history, usage dashboard, settings, and billing.
- Server-side **Anthropic Claude** Messages API with structured JSON output: strategy, audience analysis, brand voice, hooks, headlines, copy, concepts, briefs, visual direction, and image prompts.
- **Separate image generation** through Vercel AI Gateway. Configurable model, durable production storage, and downloadable assets.
- Credit ledger with atomic spends, idempotent request IDs, compensating refunds, and protected interrupted-job reconciliation.
- Token usage, cache tokens, provider request IDs, prompt version, timing, status, credits, and refund audit fields.
- JSON and Markdown campaign exports, copy controls, image downloads, and history export.
- Better Auth account flows and Stripe Checkout, Customer Portal, signed webhooks, recurring credit grants, and top-ups.

## Run locally

Requirements: Node.js 24, pnpm 10, PostgreSQL 16+ (Docker is optional).

```sh
pnpm install --frozen-lockfile
node scripts/setup-dev.mjs
docker compose up -d
pnpm db:migrate
pnpm dev
```

If you already have PostgreSQL, skip Docker and set `DATABASE_URL` in `.env` to a dedicated database before migrating. `setup-dev.mjs` creates a development `.env` only if none exists, with a random auth secret and `AI_MOCK=true`.

Visit [localhost:3000](http://localhost:3000) for marketing and [localhost:3000/demo](http://localhost:3000/demo) for the offline workspace. Sign up to test persistent data and the real ledger. Development mock generations use zero provider tokens but exercise credit spends/refunds in PostgreSQL and are clearly labeled. A product brief or image prompt containing `FAIL` exercises a refund.

This workspace has a local database configured in the ignored `.env`, using port 55432. Its data is isolated under `.local-postgres`. It is a development fixture, not a production database.

For this Windows workspace, restart the isolated database after a reboot with `& 'C:/Program Files/PostgreSQL/16/bin/pg_ctl.exe' -D .local-postgres -l .local-postgres/server.log -o '-p 55432 -h 127.0.0.1' start`, then run `pnpm dev`. Do not use this trust-authenticated local cluster for public hosting.

## Connect live AI

Set `AI_MOCK=false`, `ANTHROPIC_API_KEY`, and `AI_GATEWAY_API_KEY`. Set `ANTHROPIC_MODEL` to a Claude model supporting structured outputs; the default is `claude-sonnet-4-6`. Set `AI_IMAGE_MODEL` to the separate gateway image model (default `openai/gpt-image-1`). Restart the server after changes.

Claude never renders images. Image prompts are created by Claude; clicking **Generate image** calls the image provider separately. Missing development credentials return a setup explanation before credits are spent. API keys are never sent to client components. Provider and storage calls have timeouts.

Live AI calls and live Stripe payments need your service credentials and have not been verified with paid services in this workspace. Automated provider-contract tests use mocked HTTP responses; integration and browser tests use real PostgreSQL and simulated AI.

## Plans and credits

`src/config/plans.ts` is the source of truth. Existing Stripe plan IDs (`pro`, `ultra`) are retained for compatibility; their names are Creator and Studio.

| Plan    | Price (USD) | Credits                |
| ------- | ----------- | ---------------------- |
| Starter | Free        | 10 once at signup      |
| Creator | $9/month    | 200 per paid invoice   |
| Studio  | $29/month   | 1,000 per paid invoice |
| Top-up  | $5 once     | 100                    |

Campaign package: **3 credits**. Image: **1 credit**. Credits accumulate without expiry. Failed generation refunds append a compensating ledger entry. Replays of a request ID never charge twice. Pricing is configuration, not provider cost accounting; validate margins against your selected model before launch.

## Verify

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Database tests use a separate `ai_saas_starter_test` database by default and provision migrations automatically. Set `DATABASE_URL` to your dedicated test database if needed. Browser tests use another isolated database, mock providers, and the real authentication/credit paths. `E2E_DATABASE_URL` and `E2E_PORT` override their defaults.

Production builds require all production environment values. Do not set `AI_MOCK=true` for a production build. CI supplies build-only dummy credentials and never calls paid providers. See the deployment guide for real production configuration.

## Implementation and operations

`src/lib/studio/types.ts` validates inputs and output; `src/lib/ai/claude.ts` implements Anthropic; `src/app/(app)/studio-actions.ts` owns authenticated mutations; `src/lib/studio/data.ts` scopes reads by account. New tables are added by migrations `0004` and `0005`; upstream migrations are unchanged.

Generation order: validate/authenticate → check resource ownership → insert a uniquely keyed audit run → atomic spend → provider → persist output/asset → complete. Failed work is marked and refunded. Unknown commit acknowledgements leave a discoverable record. Hourly maintenance recovers stale runs after a 15-minute grace period. `GET /api/maintenance/reconcile` requires `Authorization: Bearer <CRON_SECRET>`; `vercel.json` schedules it. Configure a compatible cron plan or an equivalent external scheduler.

Workspace records are private to their account. Production Blob images are publicly accessible by URL; the privacy policy discloses this. Do not put confidential material in generated images. Account deletion cascades database records and cancels active Stripe subscriptions; stored Blob files require operator removal. Implement private asset delivery and a lifecycle deletion policy if your launch requires confidential images or automated erasure.

Usage/history currently summarize the latest 200 generation records; Billing shows the latest 100 ledger entries. These are clearly labeled recent views, not lifetime accounting or provider invoices. Large-workspace pagination, teams, background queues, and scheduled campaign publishing are not included.

## Delivery documents

- [Deployment guide](docs/DEPLOYMENT.md)
- [Production readiness checklist](docs/PRODUCTION_READINESS.md)
- [75-second demo script](docs/DEMO_SCRIPT.md)
- [Architecture and security](docs/ARCHITECTURE.md)
- [Creative assets and generation prompt](docs/CREATIVE_ASSETS.md)
- [Verification results](docs/VERIFICATION.md)

Production environment validation requires AI providers, Stripe, Blob, Resend, distributed rate limiting, and the maintenance secret. Public deployment, DNS changes, service provisioning, mailbox verification, live AI and payment smoke tests, and legal/operator review must be completed before taking paying customers.
