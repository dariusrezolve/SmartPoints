# Implementation Status

## Last updated

2026-08-09 — SmartPoints received a modern iPhone-first visual refresh and a one-click, duplicate-safe daily-task list editor; the release passed lint, typecheck, 33 tests, and a production build before Vercel deployment.

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
| 02-iphone-offline-pwa | F1 — PWA foundation | Complete: see `docs/plans/02-iphone-offline-pwa/task-01-result.md`. |
| 02-iphone-offline-pwa | F2 — iPhone-first workspace | Complete: see `docs/plans/02-iphone-offline-pwa/task-02-result.md`. |
| 02-iphone-offline-pwa | F3 — Scoped offline snapshot | Complete: see `docs/plans/02-iphone-offline-pwa/task-03-result.md`. |
| UI/UX refresh | Modern visual system and daily-task selector | Complete: shared typography, gradient actions, glass surfaces, consistent app menu, dashboard/statistics/auth/offline styling, and a one-click add/remove daily list. |

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
- The interface uses a consistent system type scale, emerald/teal brand gradients, warm reward accents, glass-like surfaces, and consistent menu typography across iPhone and desktop layouts.
- Set daily tasks presents unselected tasks as icon buttons, moves each selected task into a duplicate-safe list, and provides a quick remove control before saving.
- Tasks and rewards share a curated 32-icon Lucide catalog; the linked Supabase constraints were expanded through migration `202608090007` and verified as up to date on a repeat migration run.
- A linked hosted Supabase development project has all tracked migrations applied; no secrets are stored in the repository.

## Required before the next task can be fully verified

- Dedicated production Supabase project and email/recovery configuration before production verification; do not add secrets to the repository.
- Resolve and verify the reported child-profile query error through a browser-authenticated production session.

## Next task

1. F4 — Add idempotent queued daily actions and ordered reconciliation under `docs/plans/02-iphone-offline-pwa/plan.md`.
2. Resolve and verify the browser-authenticated child-profile query error in production.
3. Complete the remaining F3–F6 polish: task/reward editing and hiding, current-week day navigation, richer summary, and integration accessibility review.

## Resume protocol

1. Read `AGENTS.md`, this file, the roadmap, and the next approved plan.
2. Confirm required configuration without printing secrets.
3. Implement only the next dependency-ready task.
4. Run checks and record results.
