# Implementation Status

## Last updated

2026-08-05 — Confirmed weekly point reset verified.

## Current position

SmartPoints has a locally verified Next.js/Supabase auth and migration foundation. The parent-operated core MVP is in progress under `docs/plans/01-mvp-core/plan.md`.

## Completed task bundles

| Plan | Task | Result |
| --- | --- | --- |
| Framework bootstrap | Create operating framework | Complete: governance, local skills, planning templates, and baseline documentation created. |
| 01-mvp-core | Create core MVP plan | Complete: product decisions, dependencies, contracts, and verification gates recorded; pending approval. |
| 01-mvp-core | F1 — Next.js and Supabase foundation | Complete: see `docs/plans/01-mvp-core/task-01-result.md`. |
| 01-mvp-core | F2 — Parent settings and child profiles | Complete: see `docs/plans/01-mvp-core/task-02-result.md`. |
| 01-mvp-core | F3–F5 — Basic points workspace vertical slice | Complete for the requested basic UI: see `docs/plans/01-mvp-core/task-03-result.md`. Remaining management and week-navigation polish stays in the MVP plan. |

## Verified state

- Repository governance is defined in `AGENTS.md`.
- Local skills are available under `.agents/skills/`.
- Next.js App Router, Supabase SSR auth boundaries, and a health endpoint are implemented.
- The local Supabase stack and migration helper are verified; the helper reports the current migration set is up to date.
- Parent-owned settings and active child profiles are protected by authenticated grants and ownership RLS; live local cross-parent checks passed.
- The protected workspace shows the household current day, child tasks selected for the Monday–Sunday week, point balance, reusable rewards, and recent activity. Database RPCs make task-plan updates, completion, undo, and redemption atomic.
- A single page-header menu contains child-profile switching/management, setup actions, and sign-out. Its task, reward, daily-task, and family-management dialogs render outside the menu and close on backdrop interaction.
- The daily dashboard shows the all-time remaining balance, points received today, and points redeemed today from the full ledger; the activity list remains bounded to recent entries.
- Tasks have a validated, child-friendly Lucide icon. Parents can create a task directly from Set Daily tasks; Today shows only each task’s icon and point value, with the name available on hover/focus.
- Parents can confirm a current-week reset with manual remaining, received, and redeemed totals. The reset hides prior activity for that week in the app and later events accumulate from the entered values.
- Tailwind v4 and shared WayWeGo-style UI primitives provide the default application interface.
- A linked hosted Supabase development project has all tracked migrations applied; no secrets are stored in the repository.

## Required before the next task can be fully verified

- Hosted Supabase project and email/recovery configuration before production verification; do not add secrets to the repository.
- Hosted Supabase project and email/recovery configuration before production verification; do not add secrets to the repository.

## Next task

1. Complete the remaining F3–F6 polish: task/reward editing and hiding, current-week day navigation, richer summary, and integration accessibility review.

## Resume protocol

1. Read `AGENTS.md`, this file, the roadmap, and the next approved plan.
2. Confirm required configuration without printing secrets.
3. Implement only the next dependency-ready task.
4. Run checks and record results.
