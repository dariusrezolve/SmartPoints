# Task Result: F1 — Carry Weekly Balance Forward After a Reset

## Plan reference

[Weekly Balance Carry-Forward Repair](plan.md), F1

## Changed

- Files: `lib/points/validation.ts`, `tests/weekly-task-plan.test.ts`.
- Contracts: A reset anchor supplies the corrected remaining balance. Every ledger event created after that anchor contributes to remaining balance across week boundaries; received and redeemed figures remain limited to the requested week. Reset counters contribute only when the reset is in that requested week.
- No database schema, data, RPC, authorization, provider, or configuration changes.

## Verification

- Initial focused test command: `npm test -- tests/weekly-task-plan.test.ts` could not start because `vitest` was absent from the checkout (`sh: vitest: command not found`). Restored exact lockfile dependencies with `npm ci --include=dev`; the regression then failed against the original calculation as expected (`balance: 10` rather than `14`, with prior-week received/redeemed figures leaked into the new week).
- Focused regression: `npm test -- tests/weekly-task-plan.test.ts` — passed (4 tests).
- Full tests: `npm test` — passed (19 files, 58 tests).
- Lint: `npm run lint` — passed.
- Type check: `npm run typecheck` — passed.
- Production build: `npm run build` — passed.
- Tests added: prior-week post-reset activity increases next week’s remaining balance while the new week’s received/redeemed figures remain zero.

## Outcome and remaining risks

The code-only aggregation defect is repaired. Live records were not queried, so this confirms the deterministic calculation but does not identify the affected child/reset/event rows in the hosted database.
