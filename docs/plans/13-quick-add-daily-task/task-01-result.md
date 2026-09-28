# Task Result: Quick-add task selection

## Plan reference

[Quick-add Task Selection plan](plan.md) — F1

## Changed

- Tasks created from the Tasks header + carry an explicit quick-add flag.
- An access-checked RPC creates the task and adds it to the selected child’s daily list in one transaction.
- Task creation opened from the menu remains catalog-only.

## Verification

- `npm test -- --run tests/quick-add-daily-task.test.ts` — red: quick-add contract absent; green: passed.
- `./node_modules/.bin/supabase test db --local supabase/tests/quick_add_daily_task.test.sql` — 2 passed.
- `npm run typecheck` and `npm run lint` — passed.
- `npm test` — passed: 25 files, 69 tests.
- `npm run build` — passed.
