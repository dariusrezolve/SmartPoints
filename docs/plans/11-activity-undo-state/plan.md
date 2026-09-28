# Feature Plan: Activity Undo State

## Status

Approved 2026-09-28 — hide stale Undo actions and use task/reward-specific labels.

## Outcome

An activity entry offers Undo only while it can change the ledger. The normal and cached mobile workspaces both identify the action as a task or reward undo.

## Scope and acceptance criteria

- An original task completion or reward redemption with a reversal has no Undo action.
- Other original task completions show “Undo task”; other reward redemptions show “Undo reward”.
- The cached workspace persists and applies the same reversal relationship.

## Dependency matrix

| ID | Feature | Depends on | Unlocks | Completion check |
| --- | --- | --- | --- | --- |
| F1 | Accurate activity Undo state | Existing reversal events | Release validation | Reversed task and reward entries have no Undo action in either workspace. |

## Verification

- Add a focused red/green regression test.
- Run lint, typecheck, full tests, and production build.
