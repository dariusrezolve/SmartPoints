# Feature Plan: Reward Redemption Undo

## Status

Complete — implemented and verified locally 2026-08-13

## Outcome

A parent can undo a mistaken current-week reward redemption from Recent activity. The undo restores exactly the original reward cost once, works offline through the existing queue, and remains an immutable, auditable ledger reversal.

## Facts, assumptions, and open questions

### Facts

- `point_events` already has an immutable `reversal_of` relationship with a unique reversal index, but its constraints currently allow only task-completion undo events.
- Task Undo is shown in Recent activity and reconciles offline through `queue_task_undo`, which deduplicates both request IDs and the event reversal.
- Reward redemptions are stored as negative `reward_redemption` point events. Current summaries and statistics count their absolute value as redeemed points.
- The activity feed is bounded to the selected Monday–Sunday week, so its current-week redemption entries are the available correction surface.

### Assumptions

- “Undo redemption” means a one-time reversal of the original redemption event, not a deletion or a new editable reward action.
- Restoring a redemption should decrease the displayed redeemed total by its original cost, while increasing the remaining balance by that same amount.

### Open questions

- None material for this release.

## Scope

### Included

- A `reward_redemption_undo` immutable ledger event linked to its original redemption.
- Server-authoritative, access-checked, duplicate-safe online and queued-offline reward-reversal RPCs.
- Undo controls for current-week reward redemptions in both the authoritative and cached workspace activity views.
- Correct optimistic summaries, weekly summary, and statistics redemption totals after a reversal.
- A migration, TDD coverage, task results, and implementation-status update.

### Excluded

- Undoing entries outside the activity view’s current-week scope.
- Editing or deleting ledger events, partial refunds, repeating an Undo, or undoing a reversal.
- New providers, payment flows, or service-worker caching changes.

## Acceptance criteria

- [ ] A current-week reward redemption in Recent activity has an Undo control.
- [ ] Undo creates exactly one `reward_redemption_undo` event linked to the selected redemption and restores exactly its original cost.
- [ ] A reward redemption cannot be reversed twice; retries and duplicate request IDs converge on the same reversal event.
- [ ] A parent cannot reverse another household’s redemption or a non-redemption event.
- [ ] Offline reward Undo updates balance and redeemed totals optimistically, queues exactly one action, and reconciles once when online.
- [ ] The authoritative and cached activity feeds present Undo only for original, not reversed, reward redemptions.
- [ ] Weekly summaries and reward-spend statistics show net redeemed points after redemption reversals.

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | Parents can safely reverse a reward redemption once. | Immutable, authorized, duplicate-safe reversal restores its exact cost. | Postgres migration, RPC, authorization. |
| F2 | Parents can correct a redemption from any current-week workspace state. | Both online and cached activity show a working Undo control. | Web UI, IndexedDB queue, sync. |
| F3 | Parents see accurate redeemed totals after a correction. | Dashboard and statistics net redemption reversals deterministically. | Domain summaries, statistics, UI. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | — | F2, F3 | — | It defines the shared ledger event and idempotency contract. | Migration and focused RPC/security tests pass. |
| F2 | F1 | F3 | — | UI and offline queue must call the finalized reversal contract. | Online and offline undo behavior tests pass. |
| F3 | F1, F2 | Release gate | — | Summary semantics depend on finalized event type. | Summary/statistics tests net reversals correctly. |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| Redemption correction window | Should reward Undo be available for every current-week redemption shown in activity? | Match task Undo and allow any listed current-week redemption; this favors correcting honest mistakes but permits reversing an older visible redemption. | Approved: every current-week redemption shown in activity. | Scope controls to original current-week redemption events in both activity views. | Resolved — 2026-08-13 |

## Contracts and boundaries

- **Data:** Add `reward_redemption_undo` as a valid event type. It has a positive `point_delta`, a `reward_id`, the original redemption’s effective date, and `reversal_of` set to the original event. The existing unique reversal index guarantees one reversal per event.
- **RPC:** Add `undo_reward_redemption(event_id)` and idempotent `queue_reward_undo(event_id, request_id)`. Both validate authentication, child access, original event type, and exact captured cost; duplicate retries return the existing reversal.
- **Offline queue:** Add a distinct `undo_reward` action kind so task and reward reversals dispatch to separate RPCs. Its optimistic delta is positive and reduces redeemed total by the original cost.
- **UI:** Render Undo only for original `task_completion` and `reward_redemption` events. Reversal events remain visible but are not reversible.
- **Summary/statistics:** Treat `reward_redemption` as redeemed spending and `reward_redemption_undo` as the matching negative correction to spending.
- **Authorization:** All ledger writes remain through security-definer RPCs with explicit authenticated parent/child checks. No credentials or raw provider payloads are added.

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |
| 1 | F1 | Write failing migration/RPC contract tests; add the additive event type and online/idempotent reward-undo RPCs. | `supabase/migrations/202608130001_reward_redemption_undo.sql`, `tests/offline-reconciliation.test.ts`. | Complete — linked migration applied and recorded; focused contract tests pass. |
| 2 | F2 | Extend queue action typing/dispatch and render current-week reward Undo in both workspace views. | `lib/offline/storage.ts`, `app/components/offline-action-sync.tsx`, `app/components/points-workspace.tsx`, `app/~offline/page.tsx`. | Complete — cached and authoritative activity tests pass. |
| 3 | F3 | Net reversal events in dashboard totals and reward-spend statistics; update documentation and status. | `lib/points/validation.ts`, `lib/statistics/weekly-trends.ts`, related tests/docs. | Complete — summary and trend reversal tests pass. |
| 4 | Release gate | Run local checks; deploy only with a separate explicit request. | No deployment implied. | Complete locally — lint, typecheck, 57 tests, and production build pass. No deployment performed. |

## Risks and rollback

| Risk | Containment | Rollback |
| --- | --- | --- |
| Duplicate reward restoration | Unique `reversal_of` index plus idempotency-request mapping return the same reversal event. | Disable reward-Undo UI while retaining immutable ledger records. |
| Incorrect redeemed totals | Test net accounting in weekly summaries and statistics before UI release. | Hide corrected totals and roll back UI/RPC usage; ledger remains auditable. |
| Cross-household reversal | Explicit ownership checks in both RPCs plus focused rejection tests. | Revoke execute on the new RPC while investigating. |
| Offline queue calls the wrong reversal API | Separate `undo_reward` kind and focused dispatch tests. | Keep queued action records and disable sending until corrected. |
