# Task Result: Family-scoped authorization matrix

## Plan reference

[Independent Family Onboarding plan](plan.md) — F3

## Changed

- Files: Added a real-role database authorization matrix and migration `202609260003_shared_parent_weekly_reset.sql`.
- Contracts: An unrelated parent cannot read another family's child, tasks, or rewards, and cannot add points with supplied IDs. A shared parent can read and update only the explicitly shared child. Weekly resets now use `can_access_child` and the child household's time zone, matching the daily point RPC boundary.

## Verification

- `./node_modules/.bin/supabase test db --local supabase/tests/family_isolation_rls.test.sql` — red: shared-parent weekly reset failed with `42501`; green: 11 passed after the membership-boundary repair.
- `./node_modules/.bin/supabase test db --local supabase/tests/family_onboarding_rls.test.sql` — passed: 9 assertions.
- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm test` — passed: 20 files, 61 tests.
- `npm run build` — passed.
- `git diff --check` — passed.

## Outcome and remaining risks

Families now have child-scoped read and point-mutation behavior locally verified across owner, unrelated-parent, and shared-parent roles. A preview deployment and browser-authenticated signup walkthrough remain required before release; no remote database migration or deployment was performed.
