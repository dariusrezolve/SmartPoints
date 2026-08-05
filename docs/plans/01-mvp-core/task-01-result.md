# Task Result: F1 — Next.js and Supabase foundation

## Plan reference

[Core MVP plan](plan.md), F1.

## Changed

- Files: Next.js App Router application, Supabase SSR clients and proxy, email/password auth routes/actions, health endpoint, local Supabase configuration, migration/start/status helpers, environment example, test/lint/typecheck/build configuration, and foundation tests.
- Contracts: browser code accepts only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; no service-role key is accepted or exposed. Auth sessions use Supabase SSR cookies. Migration helpers require the pinned local CLI and clear a conflicting Docker platform override only for SmartPoints commands.

## Verification

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm test` — passed: 2 Supabase environment-boundary tests.
- `npm run build` — passed.
- `npm run db:start` — passed; local Supabase stack initialized.
- `npm run db:migrate:local` — passed; local database is up to date.
- Local synthetic API checks — sign-up, sign-in, and password-reset requests each returned HTTP 200 without logging keys/tokens.
- App-level local check — `/api/health` returned `supabaseConfigured: true`; unauthenticated `/` redirected to `/sign-in`.
- TDD note: the original foundation scaffold was created before the repository adopted mandatory TDD. The subsequent migration-script work was configuration/operational work; no separate test framework was added. Future behavior changes use the required red/green workflow.

## Outcome and remaining risks

The F1 application foundation is locally verified. A hosted Supabase project, production email configuration, and live production auth checks remain intentionally unconfigured. The next dependency-ready task is F2: parent-owned child profiles and their authorization model.
