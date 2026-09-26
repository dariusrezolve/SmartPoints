# Task Result: Countdown and end alert

## Plan reference

[Timed Rewards plan](plan.md) — F3

## Changed

- The workspace loads active child-local reward timers and renders their live remaining time directly on the matching reward card.
- An active countdown continues after refresh. When it reaches zero in an open workspace, the app shows the centered amber alert and plays a brief tone.
- When browser notification permission already exists, the same completion event also creates a system notification. The app does not prompt during reward redemption.

## Verification

- `npm test -- --run tests/timed-rewards.test.ts` — red: countdown helper absent; green: 3 passed after implementation.
- `npm test` — passed: 22 files, 65 tests.
- `npm run lint` — passed.
- `npm run typecheck` — passed after the production build completed.
- `npm run build` — passed.

## Outcome and remaining risks

Timed rewards are complete locally. The alarm runs while the SmartPoints workspace remains open; it cannot guarantee an alert after the browser or app has been closed.
