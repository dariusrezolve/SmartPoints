# Task 01 Result: Cached Launch Contract

## Outcome

Newly installed SmartPoints PWAs launch to the cached route, and future saved daily workspaces include the bounded recent activity needed for offline Undo.

## Implemented

- Set the PWA manifest start URL to `/~offline`.
- Added a typed offline event read model to snapshots and passed current bounded activity into the snapshot writer.
- Kept the IndexedDB database version unchanged, so existing snapshots remain available; older snapshots simply have no Undo records until the next online save.

## TDD record

- Added two focused contract tests before production changes: cached activity storage and manifest launch route.
- `npm test -- tests/offline-storage.test.ts` failed as expected with both new contract assertions absent.
- After implementation, `npm test -- tests/offline-storage.test.ts` passed: 4 tests.

## Verification

- `npm run typecheck` passed.

## Risks and next task

- The cached route is still the prior read-only fallback until Task 02 replaces it with the approved daily workspace. No data is deleted during this schema-compatible update.
- Next: implement the cached daily workspace and reuse the existing offline action queue.
