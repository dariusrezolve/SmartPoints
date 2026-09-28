# Task Result: Accurate activity Undo state

## Plan reference

[Activity Undo State plan](plan.md) — F1

## Changed

- The normal workspace builds a reversal set from activity events and hides Undo for any original task completion or reward redemption that already has a reversal.
- The cached mobile workspace stores each reversal reference and applies the same rule while offline.
- Remaining controls are labelled “Undo task” or “Undo reward”.

## Verification

- `npm test -- --run tests/activity-undo-state.test.ts` — red: reversal state was absent; green: 1 passed after implementation.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test` — passed: 23 files, 67 tests.
- `npm run build` — passed.

## Outcome and remaining risks

An activity Undo action now appears only while it can create a ledger reversal. Existing cached snapshots without reversal data remain readable; a newly saved snapshot includes it.
