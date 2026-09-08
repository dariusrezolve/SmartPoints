# Feature Plan: Weekly Balance Carry-Forward Repair

## Status

Complete — implemented and locally verified 2026-09-08

## Outcome

A child’s remaining points balance includes valid ledger activity from prior weeks after a weekly reset, while the received and redeemed figures remain scoped to the selected Monday–Sunday week.

## Facts, assumptions, and open questions

- Facts: The MVP contract says balances carry across week boundaries. `getResetPointSummary` starts from the latest reset anchor but filters additions to `effective_date >= currentWeekStart`, excluding post-reset events from prior weeks.
- Assumptions: A reset remains a correction anchor for its own week; no database records need to be changed.
- Open questions: None. The product decision to carry remaining balance across weeks was confirmed on 2026-09-08.

## Scope

### Included

- Correct reset-based balance aggregation across a Monday boundary.
- Add a regression test that fails with the current calculation.
- Record the result, checks, and next state in implementation status.

### Excluded

- Database migrations, backfills, or writes.
- Changes to reset inputs, activity visibility, weekly received/redeemed totals, or live-data diagnosis.

## Acceptance criteria

- [ ] Given a reset in the preceding week and a later ledger event in that week, the next week’s balance includes the anchor and that later event.
- [ ] Received and redeemed totals for the new week exclude the prior-week event.
- [ ] Existing same-week reset behavior remains covered and passing.
- [ ] Focused and applicable project checks are recorded accurately.

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | A parent sees the correct carried remaining balance after a weekly boundary. | All criteria above. | Deterministic domain aggregation, dashboard display, tests, documentation. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | Existing immutable ledger and reset-anchor contract | Accurate cross-week balance display | — | The aggregation contract and its test share ownership. | Regression test passes with the focused implementation. |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| Cross-week balance | Should remaining points carry across a weekly boundary while weekly received/redeemed totals reset? | Preserve the approved carry-forward balance rule; it fixes the discrepancy without changing reset semantics, but does not confirm individual live rows. | Yes — user confirmed 2026-09-08. | Scope F1 to deterministic aggregation and regression coverage. | Resolved |

## Contracts and boundaries

- Domain: `getResetPointSummary` must add every event created after the reset to remaining balance, regardless of its effective week; received/redeemed totals include only events in `currentWeekStart` or later.
- Web: `app/page.tsx` continues to consume the derived summary unchanged.
- Data and authorization: Read-only behavior; no schema, RPC, RLS, or provider changes.
- AI and analytics: No AI or analytics boundary.

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |
| 1 | F1 | Add a failing cross-week reset regression test. | `tests/weekly-task-plan.test.ts` | Focused Vitest run fails for the expected balance mismatch. |
| 2 | F1 | Make the smallest aggregation change to satisfy the carry-forward contract. | `lib/points/validation.ts` | Focused Vitest run passes; run `npm test`, lint, typecheck, and build where available. |
| 3 | F1 | Record result and resume state. | `docs/plans/06-weekly-balance-carry-forward/task-01-result.md`, `docs/plans/IMPLEMENTATION-STATUS.md` | Document exact check outcomes. |

## Risks and rollback

- Risk: Including pre-reset events would undo the correction anchor. Containment: filter balance additions by `created_at > reset_at`; regression test anchors the boundary.
- Risk: Weekly totals could accidentally carry forward. Containment: assert they remain zero for the new week when no current-week events exist.
- Rollback: Revert the small pure-function and test change; no database data is altered.
