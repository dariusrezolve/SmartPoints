# Task Result: First-child onboarding and ownership

## Plan reference

[Independent Family Onboarding plan](plan.md) — F1

## Changed

- Files: Added the first-family setup screen, an atomic `create_child_profile` database RPC, and focused web/database regression tests.
- Contracts: An authenticated parent creates the child, parent settings, and owner membership in one database transaction. The migration also repairs owner memberships missing from prior child creation.

## Verification

- `npm test -- --run tests/family-onboarding.test.ts` — red: two failing tests before the setup component and migration existed; green: 2 passed after implementation.
- `./node_modules/.bin/supabase test db --local supabase/tests/family_onboarding_rls.test.sql` — 4 passed under an authenticated database role.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test` — passed: 20 files, 60 tests.
- `npm run build` — passed.

## Outcome and remaining risks

A new parent with no readable children now sees a first-child setup form. Newly created children have an owner membership and are immediately readable through the existing RLS policies. The optional starter catalog copy and cross-family authorization matrix remain in F2 and F3.
