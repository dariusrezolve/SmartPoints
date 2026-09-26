# Task Result: Persistent redemption timer

## Plan reference

[Timed Rewards plan](plan.md) — F2

## Changed

- Added an immutable `timer_duration_minutes` snapshot to each timed redemption and a child/reward `reward_timers` record with its expiry.
- Timed redemptions atomically extend the existing expiry by their captured duration. Both immediate and queued Undo paths subtract the captured duration and remove an expired timer.
- Offline reward actions send their configured duration to the idempotent redemption RPC, so a later reward edit cannot change an already queued redemption.

## Verification

- `./node_modules/.bin/supabase test db --local supabase/tests/timed_reward_timer.test.sql` — red: the duration snapshot and five-argument RPC were absent; green: 6 passed after migration `202609260005`.
- `npm run typecheck` — passed.
- `npm run lint` — passed.

## Outcome and remaining risks

Timer state now persists per child and reward across reloads. F3 will read that state into the workspace, display a live countdown, and alert the parent while the workspace is open.
