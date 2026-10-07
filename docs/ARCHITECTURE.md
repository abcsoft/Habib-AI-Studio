# Architecture and safety

## Provider responsibilities

Browser → authenticated Server Action → brand/project ownership → audit run → credit ledger → Anthropic Messages → validated campaign package.

An independent image action sends a prompt to Vercel AI Gateway, stores its result, creates an asset, and completes the image run. Claude never performs rendering. Provider secrets are read only in `src/lib/env.ts` and never serialized to the client.

Anthropic receives creative brand/product fields; database owner IDs and account email are omitted. Structured output and response envelopes are validated with Zod. Refusals, incomplete generation, malformed output, and HTTP errors fail the operation. Known token usage is retained for rejected/incomplete outputs. Public errors omit provider payloads and secrets.

## Persistence

`brand_kits`, `projects`, `campaigns`, `studio_runs`, and `creative_assets` belong to an account. Campaigns link a project and brand. Each run records its input, model, type, status, output, usage, cache tokens, credits, provider request ID, version, elapsed time, and refund state. Images also retain the upstream `generations` record for the existing development image authorization route.

The unique `(user_id, request_id)` index claims a generation before any spend. Same-ID/same-input completion returns the existing run; in-progress and failed requests do not repeat provider work. Reusing an ID for different input fails. Explicit new generation uses a fresh UUID and has the displayed cost.

## Money and recovery

Only `src/lib/credits` reads/writes credit tables. Spends use a conditional balance update inside the ledger transaction. Refunds derive their amounts from the original spend and append a compensating entry. Idempotency keys are `spend_<runId>` and `refund_<runId>`. Stripe writes subscription state only through the original sync module and validates raw webhook signatures.

Provider/storage errors are audited before refunds; a failed refund becomes `refund_pending`. Unknown commit acknowledgements leave pending rows instead of hiding possible charges. Protected cron maintenance recovers stale pending/failed unrefunded work older than 15 minutes, up to 100 rows per invocation. It queries the ledger, only refunds an actual spend, and can safely replay. Alert on maintenance errors and persistent pending rows. No provider request is intentionally repeated by maintenance.

## Authorization and boundaries

Every authenticated page and Server Action calls `requireSession`. Data reads have a user predicate. Creating a campaign verifies ownership of both related records. Generation and save operations recheck campaign ownership. The proxy is only an optimistic redirect, not the authorization boundary.

Auth/session cookies are managed by Better Auth. Input boundaries use Zod. Image filenames are UUID-validated, traversal is refused, and local image delivery checks its owner's generation row. The maintenance endpoint requires a long bearer secret with constant-time comparison. Next.js provides Server Action origin checks and body limits. Security response headers refuse framing and MIME sniffing.

Production requires verified account email delivery, distributed Redis rate limiting, durable Blob storage, live provider configuration, Stripe settings, and maintenance credentials. The public demo uses validated browser storage and local samples, and never spends real credits or calls providers.

## Operational limits to review

History/usage are recent-200 views, not lifetime totals; the billing ledger shows recent 100 transactions. Workspace metadata is loaded into the client for the selected account; large-workspace pagination should precede heavy scale. Generation is synchronous with bounded provider timeouts, not a background job queue. Image model token units differ from Claude; the displayed Claude input/output/cache counters measure Claude calls.

Production images are public by URL. Database account deletion does not remove Blob files or third-party retained content. A private delivery mechanism and automated asset retention are deployment choices still to be implemented if required. Teams, roles, social publishing, performance tracking, bulk export ZIPs and image editing are outside this delivery.
