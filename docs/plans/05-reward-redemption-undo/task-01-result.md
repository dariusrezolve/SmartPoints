# Task 01 Result: Reward Redemption Undo

## Outcome

Parents can undo any current-week reward redemption shown in Recent activity, including when offline. The reversal restores exactly the original reward cost once and remains a permanent, auditable ledger event.

## Implemented

- Added migration `202608130001_reward_redemption_undo.sql` with `reward_redemption_undo` ledger validation.
- Added access-checked `undo_reward_redemption` and idempotent `queue_reward_undo` security-definer RPCs. Both use the existing unique reversal relation; queued retries also reuse the existing request-id mapping.
- Added `undo_reward` to the offline action queue and dispatches it to the new queued RPC.
- Added Undo controls to original reward redemptions in both authoritative and cached Recent activity views. Undo is not shown for reversal events.
- Netted reward reversals in dashboard redeemed totals, reset summaries, optimistic offline totals, and reward-spend statistics.

## TDD record

- Added migration/RPC and optimistic-summary tests before production changes. The initial focused run failed because the migration and `undo_reward` accounting did not exist.
- Added UI and queue contract tests before wiring reward Undo. The focused run failed because neither activity view nor sync dispatch supported it.
- Passing focused verification: `npm test -- tests/cached-workspace.test.ts tests/offline-reconciliation.test.ts tests/statistics-trends.test.ts tests/points-validation.test.ts tests/optimistic-point-summary.test.ts` — 15 tests.

## Linked database verification

- `npm run db:migrate:apply` applied `202608130001_reward_redemption_undo.sql` to the linked development database.
- `npm run db:status` confirmed that local and remote migration histories both include `202608130001`.
- The CLI logged a non-blocking local Docker cache warning after the remote apply; the linked migration completed successfully.

## Full verification

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm test` passed: 19 files, 57 tests.
- `npm run build` passed.

## Release status

- No push or deployment was requested or performed.
