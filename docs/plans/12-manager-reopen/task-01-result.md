# Task Result: Reopen task and reward managers

## Plan reference

[Reopen Task and Reward Managers plan](plan.md) — F1

## Changed

- Removed the native History API mutation that desynchronized the visible URL from the Next.js router.
- Closing either manager now clears its route state through `router.replace`, so its header + link can open it again.

## Verification

- `npm test -- --run tests/reopen-manager.test.ts` — red: router-synchronized close handling absent; green: 1 passed after implementation.
- `npm run typecheck` — passed after the build completed.
- `npm run lint` — passed.
- `npm test` — passed: 24 files, 68 tests.
- `npm run build` — passed.

## Outcome and remaining risks

Closing and reopening task and reward managers no longer relies on an unsynchronized browser history update.
