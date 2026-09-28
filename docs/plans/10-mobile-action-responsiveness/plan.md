# Feature Plan: Mobile Action Responsiveness

## Status

Approved 2026-09-28 — user approved one pending tap per task or reward action.

## Outcome

A mobile tap gives immediate visible confirmation, the centered notification does not block the cards beneath it, and repeated taps cannot create duplicate pending actions for the same card.

## Assumptions

- The existing IndexedDB queue remains the durable, offline-safe action record.
- A parent should wait for the same task or reward action to leave its pending state before tapping that card again.

## Scope and acceptance criteria

- Mark an action pending as soon as the tap handler starts, before network reconciliation completes.
- Display the queued/saved acknowledgement immediately.
- Prevent pointer events on the centered notification card.
- Disable only the card whose action is pending; other cards remain usable.
- Clear the pending state after reconciliation settles.

## Dependency matrix

| ID | Feature | Depends on | Unlocks | Completion check |
| --- | --- | --- | --- | --- |
| F1 | Responsive, duplicate-safe daily actions | Existing offline queue | Release validation | One tap gives immediate feedback and a matching card cannot create a second pending action. |

## Verification

- Add a focused red/green regression test.
- Run lint, typecheck, full tests, and production build.
