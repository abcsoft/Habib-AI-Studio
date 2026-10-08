# Vercel Hobby deployment: external maintenance scheduler

The original `vercel.json` specified an hourly cron (`0 * * * *`) that is unsupported by the Vercel Hobby tier. The cron declaration is removed in this branch to allow the deployment to proceed past the Hobby cron restriction. **Reconciliation is not disabled in the application, but it will not run automatically until a separate scheduler is configured.**

## Required production setup

1. Provision the PostgreSQL database and required environment values listed in `.env.example` and `docs/DEPLOYMENT.md`. `AI_MOCK=false` in production.
2. Set a strong random `CRON_SECRET` (32+ characters) in the Vercel project.
3. Once the app is deployed and its HTTPS domain is live, use a trusted scheduler (e.g. your CyberPanel VPS) to invoke **GET** `https://mdhabiburrahman.xyz/api/maintenance/reconcile` every hour with the HTTP header `Authorization: Bearer <CRON_SECRET>`.
4. Avoid storing the token in publicly readable files or logging the Authorization header. Use a root-owned mode-0600 config file and a scheduler wrapper; watch exit status and HTTP status (200 success, 401 secret mismatch, 503 absent secret, 500 reconciliation errors). Protect any logs containing secrets.
5. Run an authorized manual smoke test, verify audit/refund recovery, and set up alerting. Hourly credit reconciliation is operationally significant; do not launch paid credits without scheduling it.

The endpoint already authenticates requests and contains the reconciliation logic. This branch changes only the Vercel scheduling declaration. It does not waive production environment validation or configure external providers; those remain required.

## Alternative

Upgrade to a Vercel tier supporting the original hourly cron, and restore the `vercel.json` cron schedule.
