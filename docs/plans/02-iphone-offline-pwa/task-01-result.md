# F1 Result: PWA Foundation

## Outcome

SmartPoints now has the safe, installable PWA foundation needed for iPhone. It can provide an app shell and offline fallback without caching authenticated family data.

## Implemented

- Added Serwist and its Next.js integration.
- Added standalone web manifest, dynamic SmartPoints app and Apple icon routes, and an offline fallback route.
- Added a build-generated `/sw.js` service worker that precaches only versioned build assets and routes offline document navigation to the fallback page.
- Switched the production build to Webpack, as required by the Serwist Next.js integration.

## Contract and safety notes

- The service worker has no runtime caching rules; authenticated HTML, API responses, Supabase Auth/REST responses, cookies, and credentials are not cached.
- Offline family snapshot storage and queued point actions are intentionally deferred to F3/F4.

## Verification

- `tests/pwa-foundation.test.ts` was written first and failed because the manifest, service-worker source, and Serwist configuration did not exist.
- `npm test -- tests/pwa-foundation.test.ts` passed: 2 tests.
- `npm run typecheck` passed.
- `npm run build` passed and generated `/sw.js`, `/manifest.webmanifest`, `/icon`, `/apple-icon`, and `/~offline`.

## Next dependency-ready task

F2 — make the daily workspace and dialogs iPhone-first.
