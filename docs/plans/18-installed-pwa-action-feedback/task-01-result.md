# Task Result: Immediate cached-PWA action feedback

## Plan reference

[Instant Installed-PWA Action Feedback plan](plan.md) — F1

## Changed

- Cached `/~offline` task completion, reward redemption, task Undo, and reward Undo now show action-specific “Saved. Syncing…” feedback before IndexedDB queueing or network reconciliation.
- Each matching cached control now has a synchronous pending-action guard and is disabled only while its own action settles; unrelated controls remain available.
- Final feedback distinguishes successful task/reward/Undo completion, offline/queued work, and rejected or unexpected failures.
- The change is client-only: the existing queue, request IDs, Supabase RPCs, storage schema, service worker, privacy boundary, and PWA launch route are unchanged.

## TDD record

- Added the focused cached-workspace feedback and pending-control regression test in `tests/cached-workspace.test.ts`.
- `npm test -- --run tests/cached-workspace.test.ts` — red: 1 assertion failed because the cached workspace did not set feedback before `queue()`/`sync()` and had no pending-action guard.
- After the minimal cached-workspace patch, `npm test -- --run tests/cached-workspace.test.ts` — green: 4 passed.

## Verification

- `npm run lint` — passed.
- `npm run typecheck` — passed after restoring the missing declared local `@playwright/test` dependency with `npm install`.
- `npm test` — passed: 33 files, 81 tests.
- `npm run build` — passed; `/~offline` remains static and the service worker bundles.
- `git diff --check` — passed after the final documentation update.

## Outcome and remaining risks

Installed-PWA daily actions no longer make visible confirmation wait for the network round trip. Feedback is intentionally provisional until sync completes; an error or offline state replaces it when appropriate. Device-level installed-iPhone verification and any deployment remain separate release work.
