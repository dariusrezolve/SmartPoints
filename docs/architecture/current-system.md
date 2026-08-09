# Current System

## Current state

SmartPoints is a Next.js App Router application. It uses `@supabase/ssr` and Supabase Auth’s cookie-based session model for parent email/password registration, sign-in, sign-out, confirmation, and password reset. The protected root route now lets a parent create, switch, rename, and archive active child profiles, plus persist a shared household IANA time zone. A linked hosted Supabase development project is configured through untracked local environment values.

SmartPoints follows the same proportional architecture as WayWeGo: a modular Next.js monolith, server actions for mutations, Supabase Auth/Postgres, RLS on every product table, reviewed SQL migrations, and narrow RPCs only for validated transactional behavior. It remains a single application until a real boundary requires a separate package or deployable.

Its UI uses the same foundational approach as WayWeGo: Tailwind CSS v4 with small shared `Button`, `Card`, and `Input` primitives backed by CVA, `clsx`, and `tailwind-merge`. Radix primitives are added only when SmartPoints needs their specific accessible behavior.

## Security boundary

No secrets belong in this repository. `.env.example` contains only placeholders. Browser code may use only the Supabase project URL and publishable key; service-role and database credentials are never accepted by the application or placed in source.

## Product data implemented

- `parent_settings` is one row per parent (`id = auth.uid()`), with a shared household time zone.
- `children` belongs directly to a parent, has a case-insensitively unique active display name, and uses one-way `archived_at` archival in the MVP.
- Both tables enable RLS and grant only `SELECT`, `INSERT`, and `UPDATE` to `authenticated`; policies scope every operation to `auth.uid()`. Archived children are not readable or restorable through the application role.
- `tasks` and `rewards` are active child-owned records. `point_events` is an append-only ledger; the authenticated role can only read it.
- Three narrowly scoped `SECURITY DEFINER` RPCs (`record_task_completion`, `undo_task_completion`, and `redeem_reward`) validate ownership and write ledger events atomically. They use an empty search path, explicitly verify `auth.uid()`, and execute only for `authenticated`.

## Planned database operations

Supabase migrations will live in `supabase/migrations/`. After `supabase init`, use:

```bash
bash scripts/supabase-start.sh
bash scripts/supabase-migrate.sh local
bash scripts/supabase-migration-status.sh
bash scripts/supabase-migrate.sh linked       # remote dry run
bash scripts/supabase-migrate.sh linked --apply
```

The linked command defaults to a dry run. It applies only migration files not yet recorded in the linked project's migration history when `--apply` is explicit. It never resets a database or accepts credentials on the command line. The helpers require the project-pinned Supabase CLI installed by `npm install`; they never fall back to a developer's global CLI. They also clear a globally forced `DOCKER_DEFAULT_PLATFORM` only for SmartPoints’ Supabase commands, allowing the CLI to choose a compatible local image platform.

For this hosted-development setup, `npm run dev` first runs the linked migration runner with `--apply`, then starts Next.js. It is idempotent: after the first successful apply, later starts find no pending migration files. This convenience is intentionally for the linked development project, not a production deployment workflow.

Vercel preview and production deployments use the guarded `npm run deploy:vercel` workflow. It runs type checking, tests, and a production build before upload; migrations remain opt-in through `DEPLOY_MIGRATIONS=1`. The repository-local Vercel project link is ignored, and each environment contains only the public Supabase URL and publishable key. Vercel Authentication is disabled so testers can open the URLs without a Vercel account. Production currently uses the linked hosted Supabase project.

## Deferred decisions

- Data model and retention policy.
- AI provider, model contract, evaluation, cost, and privacy policy.
- Dedicated production Supabase project, domain, and production email configuration. The public Vercel preview uses the linked hosted project only for private-beta validation.
