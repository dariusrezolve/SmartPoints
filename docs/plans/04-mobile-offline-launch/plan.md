# Feature Plan: Fast Mobile Offline Launch

## Status

Complete — automated verification passed 2026-08-11

## Outcome

An installed SmartPoints app opens its last saved daily workspace immediately on iPhone, including completion, redemption, and undo actions while offline. When connectivity is available, the authoritative workspace refreshes in the background without blocking the first usable view.

## Facts, assumptions, and open questions

### Facts

- The protected home route is server-rendered and waits for an Auth claims request plus several Supabase reads before it can render the workspace.
- The service worker precaches versioned static assets only. It does not cache authenticated HTML, API responses, Auth/REST requests, cookies, or credentials.
- A scoped IndexedDB snapshot is written only after an online workspace render. It presently lacks activity records and is rendered only from the `/~offline` fallback page.
- Queueing already supports idempotent offline completion, undo, and reward redemption; automatic reconciliation runs on launch, reconnect, resume, and an interval.
- Explicit sign-out already clears the local offline database.

### Assumptions

- The primary target remains the installed iPhone PWA; ordinary responsive browser use should remain correct.
- “Fast” means that, after one successful online visit, the saved workspace becomes visible without waiting for a network request. This plan does not set a numeric network-performance target because no production timing data is available yet.

### Open questions

- None material for this release.

## Scope

### Included

- A cached daily-workspace launch surface that reads the selected snapshot immediately from IndexedDB.
- Snapshot coverage for the daily dashboard, including the recent activity needed for offline Undo.
- The existing completion, redemption, and undo queue actions from that cached workspace.
- A non-blocking online refresh that replaces cached data with the authoritative workspace when it arrives.
- Clear offline/stale/refreshing state and a safe online-only boundary for management and week navigation.
- Regression tests, updated offline-PWA documentation, and implementation-status results.

### Excluded

- Caching authenticated HTML, Supabase Auth/REST responses, cookies, credentials, or server-rendered user data in the service-worker cache.
- Offline child switching, task/reward/daily-task management, weekly reset, or week navigation.
- Background synchronization while Safari is closed, native wrappers, or new providers/services.
- Encryption beyond the browser/device protection already provided by the installed app’s local storage.

## Acceptance criteria

- [ ] After one successful online visit, opening the installed app without connectivity renders the saved daily workspace without waiting for a failed document navigation.
- [ ] The offline workspace shows saved child identity, point summary, daily tasks, rewards, and recent activity required to select an Undo action.
- [ ] Offline completion, reward redemption, and Undo update the displayed summary optimistically and create exactly one existing-format queued action per tap.
- [ ] When online, the cached workspace is usable first and then refreshes from the authoritative route without losing queued optimistic changes.
- [ ] Management controls and week navigation clearly require connectivity and do not create offline mutations.
- [ ] Explicit sign-out deletes cached workspace data and queued actions; no saved workspace appears afterward.
- [ ] The service worker continues to cache static app-shell assets only, never authenticated HTML/API/Auth data.
- [ ] Existing online workspace behavior and automatic queue reconciliation remain intact.

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | Parents see a saved daily workspace instantly when launching the installed app. | Cached launch does not depend on an unavailable network navigation. | Web shell, IndexedDB, service worker navigation policy. |
| F2 | Parents can take all existing daily point actions from the saved workspace. | Completion, reward redemption, and Undo are optimistic and queue exactly once offline. | Workspace UI, browser storage, queue contract. |
| F3 | Parents receive authoritative online data without losing a useful first view. | Background refresh updates the snapshot; offline-only constraints are explicit. | Web routing/hydration, offline status UX. |
| F4 | Parents’ local data remains bounded and private. | Sign-out erases it; no authenticated network data enters Cache Storage. | Auth, IndexedDB, service worker. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | — | F2, F3 | — | It establishes the read model and launch ownership used by all later work. | Offline relaunch shows the cached daily workspace. |
| F2 | F1 | F3 | — | Activity snapshot and action UI share the cached workspace contract. | All three daily action kinds queue and update offline. |
| F3 | F1, F2 | F4, release validation | — | Refresh merges the finalized cached read/action model. | Online launch remains immediately usable and later authoritative. |
| F4 | F1 | Release validation | A with F3 | Its auth/cache checks do not share UI ownership with refresh implementation. | Sign-out and cache-privacy regression tests pass. |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| Launch behavior | Should offline launch prioritize an immediate saved workspace and queued daily actions instead of the read-only fallback? | Show the saved workspace first, then refresh in the background; it may be briefly stale. The current fallback waits for navigation failure and is read-only. | Approved: immediate workspace with queued daily actions. | Replace fallback-only offline use with an offline-first workspace launch. | Resolved — 2026-08-11 |
| Local privacy | May the saved workspace display before a live server session check succeeds? | Permit display on the same installed device and clear it on sign-out; offline cannot make a server session check, so physical device access could reveal last-saved child points. | Approved. | Cache remains device/browser-local, and no new server cache is introduced. | Resolved — 2026-08-11 |
| Offline dashboard scope | Should the saved workspace include Undo? | Persist recent activity so the complete daily dashboard works offline; this adds a small amount of locally stored data, while management stays online-only. | Approved: include Undo; management online-only. | Extend snapshot with activity records and use the normal daily action queue. | Resolved — 2026-08-11 |

## Contracts and boundaries

- **Browser storage:** Version the existing owner-scoped snapshot to include only the selected child’s daily-dashboard data: identity, summary, daily tasks, rewards, and bounded recent activity. Existing queue records and idempotency keys remain unchanged.
- **Launch/rendering:** A client-owned launch surface may render the latest snapshot before network availability is established. It must clearly identify saved/offline state and must not claim a server refresh occurred.
- **Refresh:** A successful authoritative workspace response replaces snapshot data, then existing queued optimistic actions are applied on top in the client. Network failure retains the local workspace.
- **Offline actions:** Reuse `useOfflineActionSync`; point mutations remain server-authoritative and idempotent during reconciliation. No new RPC or migration is planned.
- **Service worker:** Retain static precache plus offline fallback only. It must never add runtime caching for authenticated documents or Supabase traffic.
- **Authorization/privacy:** Do not expose management controls from cached data. Explicit sign-out deletes both snapshots and actions before redirecting.

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |
| 1 | F1 | Add focused failing tests for snapshot version/contents and fast cached launch state; extend the storage read model. | `tests/offline-storage.test.ts`, `lib/offline/storage.ts`, `app/manifest.ts`. | Complete — focused Vitest tests failed before implementation and then passed. |
| 2 | F1–F2 | Create the cached daily-workspace renderer, reuse the queue hooks, and add bounded activity to snapshot writes. | `app/~offline/page.tsx`, `app/components/points-workspace.tsx`, offline components/storage. | Complete — targeted cached-workspace tests pass; iPhone manual matrix remains release validation. |
| 3 | F3 | Connect the normal launch path to the cached surface and background authoritative refresh without replacing pending optimistic actions. | Cached route client refresh, tests. | Complete — cached route schedules `router.replace("/")` only after online queue state is clear. |
| 4 | F4 | Verify sign-out deletion, cache boundaries, inaccessible management controls, and stale-status copy; update PWA docs/status. | `app/components/workspace-menu.tsx`, service-worker tests, plan result/status docs. | Complete — static-cache regression coverage and existing sign-out clearing retained; iPhone manual matrix remains release validation. |
| 5 | Release gate | Run repository quality checks and staging/preview validation if a release is requested separately. | No production deployment in this task. | Complete locally — lint, typecheck, tests, and production build pass. No deployment or iPhone device matrix run. |

## Risks and rollback

| Risk | Containment | Rollback |
| --- | --- | --- |
| Cached workspace is stale | Label saved/refreshing state; server remains authoritative; apply queued actions separately. | Disable cached-first launch and retain the existing offline fallback. |
| Offline action duplicates a ledger event | Preserve existing client-generated request IDs and server-enforced idempotency. | Disable send/replay while preserving queue records for later retry. |
| Local data is visible to someone holding an unlocked device | Store only the bounded daily workspace, prohibit management data, and erase on sign-out. | Release a storage-schema upgrade that clears snapshots and queues. |
| Service worker leaks authenticated data | Keep runtime caching empty; assert this in tests. | Publish a cache-clearing service-worker release. |
| Cached and server data fight during refresh | Define snapshot replacement first, then overlay queued actions deterministically. | Keep cached workspace read-only until the merge is corrected. |
