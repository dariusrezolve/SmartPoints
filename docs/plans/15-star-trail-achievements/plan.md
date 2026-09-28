# Feature Plan: Star Trail and Achievements

## Status

Complete locally — 2026-09-28.

## Outcome

Each child sees a compact Star Trail on their points dashboard. Earning task points fills a weekly trail, unlocks a weekly title and milestone bonus points, and adds permanent badges that are visible on a separate achievements page.

## Facts, assumptions, and open questions

- Facts:
  - Task completion and Undo already create immutable, child-owned point-event rows.
  - The workspace calculates dates and weeks in the household time zone.
  - The workspace already has a compact summary-card row and a child-specific secondary statistics page.
  - Existing completion RPCs have immediate and queued variants; both must preserve idempotency and child access checks.
- Assumptions:
  - Star Trail uses only task-completion points; reward redemptions and milestone bonus points never earn stars.
  - Milestones are fixed product content for the first release, not parent-configurable.
- Open questions: none.

## Scope

### Included

- Per-child, current-week Star Trail: one star per task point earned.
- Fixed milestones: 5 / 10 / 20 / 35 stars, with bonuses of +2 / +3 / +5 / +8 points.
- Weekly titles: Star Starter, Super Helper, Trailblazer, and Star Champion.
- Permanent badge history per child, including the original date and milestone.
- Atomic bonus creation and reversal in direct and offline queued task-completion and Undo flows.
- A compact dashboard card below point summaries and a dedicated achievements page.
- Current-week reset starts a new trail and restores that week’s bonus eligibility; badges remain permanent.

### Excluded

- Parent-configurable milestones, titles, stars, or bonus values.
- Adventure maps, streaks, social competition, push notifications, or paid assets.
- Child authentication and separate child accounts.

## Acceptance criteria

- [ ] A child earns one star for every net task-completion point in the active local week.
- [ ] The dashboard card displays current stars, current weekly title, the next milestone, and a restrained progress display.
- [ ] Each milestone creates its bonus exactly once per child and trail instance, even under duplicate offline requests.
- [ ] Undo removes stars, weekly title eligibility, and the associated milestone bonus; the permanent badge remains.
- [ ] Reset this week starts a fresh trail and makes its milestone bonuses eligible again; existing badges remain.
- [ ] A child-specific achievements page lists permanent badges and explains milestones without cluttering the dashboard.
- [ ] Unrelated families cannot read or affect another child’s trail, awards, badges, or bonus events.

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | Deterministic Star Trail ledger | Net task points produce stars and atomically award/reverse weekly bonuses across direct, queued, Undo, and reset paths. | Data, Supabase RPC, authorization, offline contract. |
| F2 | Magic Kingdom child dashboard progress | The main workspace shows a bright quest card with a star pouch, milestone path, current title, and next quest below point summaries. | Server page query, workspace UI. |
| F3 | Achievements history | A child-scoped page lists permanent badges, titles, milestones, and simple explanations. | Route, authorization, UI. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | — | F2, F3 | — | Changes shared event/RPC contract and migration ownership. | Database tests cover progress, duplicate queue calls, Undo, reset, and cross-family isolation. |
| F2 | F1 | Release validation | — | Consumes F1’s progress contract in the main workspace. | Focused UI test plus rendered dashboard review. |
| F3 | F1 | Release validation | P1 with F2 after F1 | Uses a separate route and does not modify dashboard ownership. | Focused route/data test and rendered achievements-page review. |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| Progress model | Point-based stars or one star per task? | One star per task point makes each task’s configured point value visible in the trail. | Point-based weekly Star Trail. | Store no task-count score; derive net task points directly. | Resolved |
| Title lifecycle | Weekly or permanent titles? | Weekly titles keep the trail lively; permanent badges preserve history. | Reset titles weekly; badges permanent. | Derive title from current trail, persist badge history. | Resolved |
| Undo | Does Undo reverse trail rewards? | Reverse stars and bonus to keep points consistent; title may disappear. | Yes. | Add bonus reversal in task Undo paths. | Resolved |
| Card placement | Dashboard or separate surface? | Compact dashboard card makes progress visible; details remain on a separate page. | Dashboard card plus achievements page. | Add card below point summaries and new child route. | Resolved |
| Bonus recurrence | Re-award after Undo? | One bonus per trail prevents repeated completion/Undo farming; correcting Undo does not repay it. | Once per week. | Persist milestone-award eligibility by trail instance. | Resolved |
| Weekly reset | Preserve or restart trail state? | Restart aligns with existing reset behavior; it allows awards in a fresh trail. | Restart trail and bonus eligibility; retain badges. | Use reset boundary in trail calculations and award identity. | Resolved |

## Contracts and boundaries

### Data and Supabase

- Add an `achievement_awards` child-owned ledger with a stable trail-instance key, milestone key, badge metadata, earned timestamp, and the linked bonus point event.
- Add the `achievement_bonus` and `achievement_bonus_undo` event types to the constrained point-event ledger.
- Derive current stars from unreversed `task_completion` events after the current week’s most recent reset boundary, using their full net point value.
- Extend `record_task_completion`, `queue_task_completion`, `undo_task_completion`, and `queue_task_undo` to evaluate milestones in their existing transaction and idempotency boundaries.
- Use a child advisory transaction lock around trail evaluation, just as timer limits serialize child-level timed changes.
- Keep direct table writes unavailable to clients. Grant only access-checked RPC execution; RLS allows members to read their child’s awards and badges.

### Web and offline

- Add a pure trail-calculation module shared by the workspace and achievements-page server queries.
- Extend the current dashboard data query with only the current child’s trail inputs and awards.
- Add `/achievements?child=<id>` with the same authentication and selected-child access pattern as `/statistics`.
- Add an Achievements link from the Star Trail card. Keep the existing workspace menu unchanged unless a route shortcut improves navigation after visual review.
- Offline actions retain the existing captured task points and request IDs. The authoritative RPC adds or reverses any bonus; the workspace refresh reconciles its card after sync.

### Authorization and privacy

- Every record and query remains scoped by `child_id` and `public.can_access_child`.
- Badges include only fixed product labels and achievement timestamps; no provider, AI, or third-party service is introduced.

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |
| 1 | F1 | Add failing pure-calculation and database contract tests, then implement the milestone-award ledger, access policies, event constraints, and atomic RPC changes. | `lib/achievements/*`, migration, `supabase/tests/*`, task action RPC migrations. | Focused Vitest red/green; local migration; pgtap progress, idempotency, Undo, reset, and RLS tests. |
| 2 | F2 | Add failing dashboard-card test, then query and render the child-friendly Magic Kingdom quest card. | `app/page.tsx`, `app/components/points-workspace.tsx`, new component/tests. | Focused red/green and visual local review. |
| 3 | F3 | Add failing route/history test, then implement the achievements page and navigation. | `app/achievements/page.tsx`, components/tests. | Focused red/green and visual local review. |
| 4 | F1–F3 | Document feature state and run release checks. | Product state and implementation status. | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and local Supabase database tests. |

## Risks and rollback

- Milestone duplication: unique child/trail/milestone records and existing request-id locks prevent duplicate bonuses.
- Undo ordering: child-level advisory locking serializes task completion, Undo, and milestone evaluation.
- Reset ambiguity: trail instance includes the latest reset boundary, so a reset begins a clean weekly trail without deleting permanent badges.
- Visual clutter: the quest card keeps detailed badge history on its separate page while showing only the current title, star pouch, next quest, and milestone path on the dashboard.
- Rollback: remove the dashboard and achievements routes first; the migrated ledger remains auditable and bonus event reversals preserve point history.

## Verification

- Red: `npm test -- --run tests/star-trail-dashboard.test.ts` failed because the original card had none of the required Magic Kingdom quest-card content.
- Green: `npm test -- --run tests/star-trail-dashboard.test.ts tests/star-trail-ledger.test.ts` passed (2 files, 2 tests).
- Local Supabase database tests passed: 8 files, 51 assertions, including a 10-point task that reaches both the 5- and 10-star milestones and reverses both bonuses on Undo.
- `npm run lint`, `npm run typecheck`, `npm test` (30 files, 74 tests), and `npm run build` passed.
