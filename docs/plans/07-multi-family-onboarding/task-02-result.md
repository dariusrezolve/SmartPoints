# Task Result: Optional starter catalog

## Plan reference

[Independent Family Onboarding plan](plan.md) — F2

## Changed

- Files: Added an unchecked starter-list choice to both first-child and add-child forms, extended the child setup RPC, and added migration `202609260002_child_starter_template.sql`.
- Contracts: The explicit boolean choice atomically creates the child and owner membership, then optionally copies the approved six task definitions, five rewards, and six daily selections. It creates no ledger events, balances, or redemption history.

## Verification

- `npm test -- --run tests/family-onboarding.test.ts` — red: missing opt-in controls; green: 3 passed.
- `./node_modules/.bin/supabase test db --local supabase/tests/family_onboarding_rls.test.sql` — red: the three-argument RPC did not exist; green: 9 passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test` — passed: 20 files, 61 tests.
- `npm run build` — passed.

## Outcome and remaining risks

Every newly created child can begin empty or receive independent catalog records from the approved snapshot. The final task must prove owner, invited-parent, and unrelated-parent isolation across reads and point mutations.
