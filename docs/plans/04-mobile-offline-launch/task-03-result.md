# Task 03 Result: Online First-Launch Recovery

## Outcome

An installed app with no saved workspace no longer claims it is offline when the device has mobile data or Wi-Fi. It opens the authoritative workspace instead.

## Cause

The PWA start URL is `/~offline`. Its cached-workspace refresh existed only after IndexedDB returned a snapshot, so a first launch or cleared local storage rendered the offline empty state regardless of actual connectivity.

## Implemented

- Subscribe to browser online/offline status from the launch route.
- When no snapshot is present and the device is online, replace the launch route with `/` to load the authenticated authoritative workspace.
- Retain the actual offline instruction only when the browser reports no connection.

## TDD record and verification

- Added a focused regression test to `tests/cached-workspace.test.ts` before the code change.
- `npm test -- tests/cached-workspace.test.ts` failed because the online empty-snapshot route was absent.
- After implementation, the focused test passed: 3 tests.
- `npm run lint`, `npm run typecheck`, `npm test` (19 files, 54 tests), and `npm run build` all passed.

## Release status

- This corrective change is local only. No push or deployment was requested in this conversation turn.
