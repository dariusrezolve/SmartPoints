# Implementation Status

## Last updated

2026-09-28 — Star Trail is verified locally, including its Magic Kingdom dashboard card, per-child visibility control, and full-point star calculation. It has not been deployed.

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
| 03-statistics-trends | Weekly comparison dashboard | Complete: deterministic two-week ledger aggregation, overall trend cards, daily and task SVG sparklines, and reward spending shares/percentages. |
| 02-iphone-offline-pwa | F4–F5 — Additive offline reconciliation | Complete: captured-value idempotent RPCs, automatic retries/recovery, duplicate-undo convergence, and no manual discard queue. |
| PWA visual identity | Emerald task-card app icon | Complete: browser and Apple Home Screen icons share a high-contrast emerald/teal task-completion mark with a warm point accent. TDD was skipped only for the release-policy documentation because it is governance-only; the icon behavior has a focused regression test. |
| PWA clean start | Clear pre-MVP offline point state | Complete: IndexedDB schema upgrade removes the old dashboard snapshot and queued actions once, so the requested ledger reset cannot be visually stale or replayed from an installed iPhone. |
| PWA discoverability | Menu install action | Complete: the workspace menu offers native installation when a browser exposes it and clear Safari Home Screen instructions on iPhone. |
| 04-mobile-offline-launch | F1 — Cached launch contract | Complete: see `docs/plans/04-mobile-offline-launch/task-01-result.md`. |
| 04-mobile-offline-launch | F2–F4 — Cached daily workspace, refresh, and cache boundary | Complete: see `docs/plans/04-mobile-offline-launch/task-02-result.md`. |
| 04-mobile-offline-launch | Online first-launch regression | Complete locally: see `docs/plans/04-mobile-offline-launch/task-03-result.md`; pending push/deployment. |
| 05-reward-redemption-undo | F1–F3 — Reward redemption Undo | Complete locally: see `docs/plans/05-reward-redemption-undo/task-01-result.md`; pending push/deployment. |
| 06-weekly-balance-carry-forward | F1 — Carry weekly balance forward after a reset | Complete locally: see `docs/plans/06-weekly-balance-carry-forward/task-01-result.md`. |
| 07-multi-family-onboarding | F1 — First-child onboarding and ownership | Complete locally: see `docs/plans/07-multi-family-onboarding/task-01-result.md`. |
| 07-multi-family-onboarding | F2 — Optional starter catalog | Complete locally: see `docs/plans/07-multi-family-onboarding/task-02-result.md`. |
| 07-multi-family-onboarding | F3 — Family-scoped authorization matrix | Complete locally: see `docs/plans/07-multi-family-onboarding/task-03-result.md`. |
| 07-multi-family-onboarding | Production release | Complete: Vercel preview and production deployments are healthy; migrations `202609260001`–`202609260003` are applied to the linked production database. |
| 08-centered-action-notifications | F1 — Centered action notifications | Deployed: see `docs/plans/08-centered-action-notifications/task-01-result.md`. |
| 09-timed-rewards | F1 — Timed reward configuration | Complete locally: see `docs/plans/09-timed-rewards/task-01-result.md`. |
| 09-timed-rewards | F2 — Persistent redemption timer | Complete locally: see `docs/plans/09-timed-rewards/task-02-result.md`. |
| 09-timed-rewards | F3 — Countdown and end alert | Deployed: see `docs/plans/09-timed-rewards/task-03-result.md`. |
| 10-mobile-action-responsiveness | F1 — Responsive, duplicate-safe daily actions | Complete locally: see `docs/plans/10-mobile-action-responsiveness/task-01-result.md`. |
| 11-activity-undo-state | F1 — Accurate activity Undo state | Complete locally: see `docs/plans/11-activity-undo-state/task-01-result.md`. |
| 12-manager-reopen | F1 — Reopen task and reward managers | Complete locally: see `docs/plans/12-manager-reopen/task-01-result.md`. |
| 13-quick-add-daily-task | F1 — Quick-add task selection | Complete locally: see `docs/plans/13-quick-add-daily-task/task-01-result.md`. |
| 14-child-timer-limits | F1–F2 — Per-child timer settings and atomic enforcement | Complete locally: see `docs/plans/14-child-timer-limits/task-01-result.md` and `task-02-result.md`. |
| 15-star-trail-achievements | F1–F3 — Per-child Star Trail and badge history | Complete locally: see `docs/plans/15-star-trail-achievements/task-02-result.md`. |

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
- Statistics compare the selected Monday–Sunday week with the prior week, net task undo events, identify improving tasks, and show each reward's share of spending without a third-party chart dependency.
- Action toasts use the browser top layer so success and failure feedback stays visible above native modal dialogs.
- Offline daily actions use captured values and idempotency keys. Distinct actions from different devices are additive; duplicate requests are not, and legacy terminal queue items are retried automatically.
- Updating from the pre-MVP PWA upgrades the local offline database once, deleting its old snapshots and queued actions; new MVP offline actions persist normally afterward.
- The workspace menu includes Install app, opening a native browser prompt where supported or the Safari Add to Home Screen flow for iPhone.
- The browser favicon, manifest icon, and iPhone Apple touch icon use the emerald/teal task-completion mark; browser rendering does not depend on an external icon font.
- Installed PWAs start at the static cached-workspace route, so a saved daily workspace is visible before a network navigation. The route uses the established idempotent queue for offline daily actions and transitions to the authoritative route only after online queued work clears.
- Original current-week reward redemptions have a one-time Undo that adds an immutable linked reversal. The linked development database migration is applied; production remains unchanged until explicitly deployed.
- A weekly reset remains its own week’s correction anchor; events created after it always contribute to remaining balance across later weeks, while received/redeemed totals restart each Monday.
- Release policy requires staging/preview validation before production and an explicit current-conversation production request.
- A fresh parent can create a first child through an empty-family setup screen. The protected database RPC atomically writes the child, household settings, and owner membership; existing missing owner memberships are repaired by migration `202609260001`.
- Each child setup form has an explicit, unchecked starter-list choice. When selected, the atomic setup RPC copies the approved six daily tasks and five rewards into that child only, with no point or redemption history.
- Child records, catalog entries, daily selections, and point operations are isolated per child. The local authorization matrix proves that unrelated parents cannot access supplied foreign IDs and shared parents operate only on their explicitly shared child. Shared weekly resets now use that same access boundary.
- Task and reward feedback is locally updated to a large centered card: emerald for earned points, amber for redeemed points, slate for offline work, and red for errors.
- Rewards can be marked Time based. Their configured duration is optional, child-owned, and constrained to 1–1,440 minutes. Each timed redemption snapshots that duration and atomically extends a child-local timer; Undo reverses the recorded duration.
- Timed reward cards show the active countdown after redemption and preserve it across refresh. Reaching zero in an open workspace creates the centered alert and a short tone, plus a browser notification where permission was already granted.
- A daily task or reward tap acknowledges immediately, and its card blocks only duplicate pending taps while reconciliation completes. Centered notifications do not intercept taps on the workspace.
- Activity rows retain task and reward Undo controls only until their linked reversal exists; cached mobile activity uses the same rule.
- Closing task and reward managers clears their opening route state through Next.js, so each header + button can reopen its manager.
- A task created through the Tasks header + is selected for that child’s daily task list in the same database operation.
- Each child has independent active and daily timed-reward limits. Defaults are 60 active minutes and 120 net timed minutes per local calendar day; the workspace menu can change them. Timed redemption checks run under a child-specific transaction lock, and Undo returns both active and daily capacity.
- Each child can show or hide a child-friendly Magic Kingdom Star Trail. Every net task point earns one current-week star; milestones at 5, 10, 20, and 35 stars award weekly titles and bonus points. Achievements are permanent, child-scoped badge history. The local database test covers a 10-point task reaching two milestones and reverses each affected bonus on Undo.

## Required before the next task can be fully verified

- Dedicated production Supabase project and email/recovery configuration before production verification; do not add secrets to the repository.
- Resolve and verify the reported child-profile query error through a browser-authenticated production session.

## Next task

1. Run a browser-authenticated production walkthrough: signup, first-child creation, optional starter copy, an independent second family, and a shared-parent invitation.
2. Configure an isolated preview Supabase/Auth backend if future releases require an end-to-end staging signup check.
3. Deploy the locally verified centered action notification change when authorized.
4. Run the production browser walkthrough for the deployed timed reward configuration, redemption, extension, Undo, and expiry alert.
5. Deploy the locally verified mobile action responsiveness update when authorized.
6. Deploy the locally verified activity Undo state update when authorized.
7. Implement header + task creation that immediately selects the new task for the daily list.
8. Deploy the locally verified mobile responsiveness, activity Undo, manager reopening, and quick-add task updates when authorized.
9. Deploy the locally verified per-child timer-limit settings and enforcement when authorized.
10. Deploy the locally verified Star Trail and Magic Kingdom dashboard when authorized.

## Resume protocol

1. Read `AGENTS.md`, this file, the roadmap, and the next approved plan.
2. Confirm required configuration without printing secrets.
3. Implement only the next dependency-ready task.
4. Run checks and record results.
