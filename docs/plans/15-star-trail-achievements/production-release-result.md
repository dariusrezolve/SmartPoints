# Production release result — 2026-09-29

Commits `ba1fa82` and `d186a27` were pushed to `main`. Git integration produced a ready Vercel production deployment at `https://smartpoints-navy.vercel.app` after a successful preview build.

The linked Supabase project matched the Vercel preview and production Supabase URL. Migrations `202609280001` through `202609280008` were applied to that project, and a repeat dry run reported the remote database up to date.

## Checks

- `npm run lint` — passed.
- `./node_modules/.bin/supabase test db --local` — passed: 8 files, 51 assertions.
- Preview deployment script: `npm run typecheck`, `npm test` (30 files, 74 tests), and `npm run build` passed locally; Vercel preview build completed.
- Preview `/api/health` returned `{"status":"ok","supabaseConfigured":true}`; preview `/sign-in` returned HTTP 200.
- Production deployment status was `READY`; live `/api/health` returned the same healthy JSON, `/sign-in` returned HTTP 200, and unauthenticated `/achievements` redirected to sign-in.

## Remaining validation

No authenticated browser walkthrough was run against production. The Playwright E2E suite is planned but not implemented. Preview and production currently share the same Supabase backend, so preview checks did not create users or mutate point data.
