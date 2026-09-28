# Task Result: Atomic timer-limit enforcement

## Plan reference

[Child Timer Limits plan](plan.md) — F2

## Changed

- Added a per-child advisory transaction lock before each timed redemption limit check.
- Enforced both active-timer and net local-day limits in direct and offline-queued redemption RPCs.
- Calculated daily use from unreversed timed-redemption events, so reward Undo restores daily capacity as well as reducing the active timer.

## Verification

- `npm test -- --run tests/timer-limit-enforcement.test.ts` — red: migration absent; green: passed.
- `bash scripts/supabase-migrate.sh local` — applied `202609280003_timer_limit_enforcement.sql` and `202609280004_timer_limit_undo_lock.sql`.
- `./node_modules/.bin/supabase test db --local` — passed: 47 database tests, including active, daily, direct, queued, and Undo capacity cases.
- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm test` — passed: 27 files, 71 tests.
- `npm run build` — passed.
