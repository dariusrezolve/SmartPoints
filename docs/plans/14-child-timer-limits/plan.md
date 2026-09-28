# Feature Plan: Child Timer Limits

## Status

Approved 2026-09-28 through explicit user decisions.

## Outcome

Parents set per-child timer limits. A child cannot exceed their active timer allowance or their net daily timed-reward allowance.

## Decisions

| Decision | User decision |
| --- | --- |
| Scope | Limits apply independently per child. |
| Active limit | Default 60 minutes across all active timers for that child. |
| Daily limit | Default 120 minutes of timed redemptions per child calendar day. |
| Undo | Undo restores active and daily allowance. |

## Dependency matrix

| ID | Feature | Depends on | Unlocks | Completion check |
| --- | --- | --- | --- |
| F1 | Timer-limit settings | — | F2 | Menu persists 60/120-minute per-child limits. |
| F2 | Atomic timer-limit enforcement | F1 | Release validation | Redemption rejects excess active or daily time; Undo restores capacity. |

## Completed tasks

- F1 — complete locally; see [task-01-result.md](task-01-result.md).
- F2 — complete locally; see [task-02-result.md](task-02-result.md).
