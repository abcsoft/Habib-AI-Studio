# Verification record

Validation performed on October 8, 2026 in this Windows workspace with Node.js 24, pnpm 10 and an isolated PostgreSQL 16 cluster. Test suites use dedicated databases and simulated AI providers; no paid generation was performed.

| Check            | Result                           | Scope                                                                                                                                                          |
| ---------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript       | Passed                           | Strict application and test type checking                                                                                                                      |
| ESLint           | Passed                           | Repository source and scripts                                                                                                                                  |
| Prettier         | Passed                           | Repository formatting, with generated/runtime folders excluded                                                                                                 |
| Vitest           | 117 tests passed across 15 files | Real PostgreSQL ledger/actions, concurrency, tenant isolation, auth, refunds, maintenance, webhook grants, Claude HTTP contract and token audit                |
| Playwright       | 15 tests passed                  | Signup, protected routes, billing, image spend/refund, zero credits, landing, complete offline and authenticated campaign workflows, saving, export and reload |
| Production build | Passed                           | Optimized App Router build with `AI_MOCK=false` and isolated build-only credentials                                                                            |
| UI/media review  | Passed                           | Desktop 1280px, mobile 390px, 360px overflow check, real image loading, captioned MP4 playback, branded 404                                                    |
| Migration        | Passed                           | New migrations 0004 and 0005 applied to isolated development/test databases                                                                                    |

The browser suite validated the complete campaign path: brand and project creation → product/goal input → package generation → copy/prompts → image → save → export. Authenticated checks verify persisted audit runs and credit effects. Malformed and incomplete Claude responses preserve usage metadata, fail safely and refund. Repeated request IDs do not repeat provider work or spends. Delayed-payment Stripe top-ups require confirmed payment.

Screenshots: [desktop landing](screenshots/habib-landing-desktop.png), [mobile landing](screenshots/habib-landing-mobile.png), [desktop dashboard](screenshots/habib-dashboard-desktop.png), [mobile dashboard](screenshots/habib-dashboard-mobile.png). The recorded demo is approximately 75 seconds, H.264 MP4, 1280×800, with English WebVTT captions and no audio track.

Provider contract references reviewed: [Anthropic structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [Vercel image-model gateway support](https://vercel.com/changelog/image-only-models-available-in-vercel-ai-gateway). These checks establish request compatibility and local application behavior, not successful paid calls under a production account.

Live Anthropic/image calls, actual Stripe payments and lifecycle clocks, production email delivery, domain/DNS, hosting, private-image requirements, file-erasure operations and operator/legal review remain launch gates. Production was not deployed. See [the readiness checklist](PRODUCTION_READINESS.md) and [deployment guide](DEPLOYMENT.md).

The final production build passed. Starting an additional production test server was rejected by automatic approval review with the reason 'blocked by policy'. No production test server was started; the separate production-runtime smoke test remains unverified. The development browser suite and media checks passed.
