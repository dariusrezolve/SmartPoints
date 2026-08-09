# Feature Plan: iPhone Offline PWA

## Status

Implemented — F1–F5 complete

## Outcome

A parent can add SmartPoints to an iPhone Home Screen, use it in a focused app-like layout, and record daily point actions without connectivity. The app persists those actions locally and automatically synchronizes them as additive, idempotent ledger operations when connectivity returns.

## Facts, assumptions, and open questions

### Facts

- SmartPoints is a Next.js App Router app with Supabase Auth, server actions, and an immutable `point_events` ledger.
- Task completion, undo, and reward redemption already use server-authoritative transactional RPCs.
- The product is parent-operated; children do not authenticate directly.
- The mobile/offline target is iPhone. iPad remains responsive but is not an installation/offline acceptance target.

### Assumptions

- Safari’s PWA limitations mean sync runs while the installed app is opened or resumed after connectivity returns; it is not guaranteed to run while fully closed.
- The selected child’s current-week read model is sufficient for the first offline session.

### Open questions

- None material for this release.

## Scope

### Included

- iPhone-first responsive layout and safe-area/full-screen PWA presentation.
- Web App Manifest, icons, service worker, app-shell caching, and a Safari-specific Add to Home Screen tip after first successful use.
- Cache only the authenticated parent’s selected-child, current-week snapshot and the minimal task/reward data needed to show daily actions.
- Offline queueing for task completion, completion undo, and reward redemption only.
- Optimistic local updates with an ordered, persistent action queue and client-generated idempotency keys.
- Automatic ordered sync on startup, connectivity, app-resume, and a short retry interval, plus compact `Offline — n queued`, `Syncing`, and `Synced` status.
- Automatic recovery of legacy rejected actions without a manual discard workflow.
- Clear local-data deletion on explicit sign-out.

### Excluded / post-MVP

- Offline creation, editing, archival, or selection of child profiles, tasks, rewards, daily tasks, or weekly resets.
- Offline navigation to older weeks, full activity history, or child-profile switching.
- Guaranteed background synchronization while Safari is closed, push notifications, native wrappers, or App Store distribution.
- Cross-device real-time subscriptions while both devices remain open.
- Caching authenticated HTML responses or retaining any offline data after explicit sign-out.

## Acceptance criteria

- [ ] On iPhone Safari, a parent can add SmartPoints to the Home Screen and open it in standalone app-like display.
- [ ] The app remains usable on iPhone widths, including safe-area spacing, touch targets, dialogs, menus, and scrolling.
- [ ] After an authenticated online load, disabling connectivity and reopening the installed app shows the cached selected-child current-week workspace and daily actions.
- [ ] Offline completion, undo, and redemption update the local display immediately and enter exactly one ordered queue record each.
- [ ] A queued action is not sent while offline and is sent once when the app regains connectivity or resumes online.
- [ ] Retrying/reloading/reconnecting cannot duplicate a completed, undone, or redeemed point event.
- [ ] A transiently rejected queued action remains optimistic and retries automatically without parent intervention.
- [ ] Independent actions from multiple devices are additive; replaying the same request ID never duplicates an event.
- [ ] Offline management actions are unavailable with clear online-only wording; no management mutation is queued.
- [ ] Explicit sign-out clears the cached snapshot and pending queue for that parent/device.
- [ ] Service-worker caching never stores authenticated HTML/API responses or Supabase credentials.

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | iPhone parents can install and launch SmartPoints as a focused PWA. | Manifest, icons, standalone display, Safari install guidance work. | Web, service worker, deployment assets. |
| F2 | The daily workspace remains readable and touch-friendly on iPhone. | Primary dashboard, dialogs, menu, and status fit iPhone screens. | Web/UI. |
| F3 | A parent can reopen an authenticated current-week snapshot offline. | Correct selected-child snapshot is local and sign-out clears it. | Web, browser storage, auth boundary. |
| F4 | Daily point actions work offline and sync once in order. | Complete: completion, undo, redemption queue and reconcile idempotently with captured values. | Web, API/RPC, data contract, authorization. |
| F5 | A parent can trust automatic reconciliation without managing errors. | Complete: status remains accurate and legacy rejected actions recover automatically. | Web, browser storage, API errors. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | — | F3–F5 | — | Service-worker and install contracts control cached assets for all later features. | iPhone install and offline app-shell launch pass. |
| F2 | — | F3–F5 | A with F1 | UI ownership is independent of service-worker build configuration. | Core flows fit supported iPhone sizes. |
| F3 | F1, F2 | F4–F5 | — | Queue UX needs a defined, safe cached snapshot. | Offline reload renders only the scoped snapshot. |
| F4 | F3 | F5 | — | Queue schema, idempotency contract, and reconciliation are shared. | Reconnect sends each daily action once. |
| F5 | F4 | Release gate | — | Status and retry handling consume finalized reconciliation states. | Automatic retry survives reload and needs no discard flow. |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| Offline scope | Which actions should work offline first? | Daily ledger actions deliver the highest value; management mutations add conflicts. | Completion, undo, redemption only. | Defer all management actions. | Resolved |
| Retention | How long can offline data remain? | Keep it until explicit sign-out for reliable family use; it increases device-local data retention. | Until sign-out. | Clear device cache/queue on sign-out. | Resolved |
| Device target | Which mobile device is primary? | Focus iPhone for the strongest daily-use experience; iPad is responsive only. | iPhone. | iPhone install/offline acceptance criteria. | Resolved |
| Synchronization | How should reconnection behave? | Automatic sync with explicit status reduces parent effort; rejections need visible handling. | Automatic sync and status. | Ordered reconcile lifecycle. | Resolved |
| Install guidance | Include iPhone install help? | A Safari-specific tip compensates for lack of a reliable native install prompt; adds onboarding UI. | Yes. | Add dismissible post-use tip. | Resolved |
| Rejections | What happens to actions the server rejects? | Retry additive, captured-value operations automatically; avoids parent cleanup but preserves an unresolved operation until authorization returns. | Automatically retry; no manual discard. | Replace Needs attention with additive reconciliation. | Superseded 2026-08-09 |
| Cross-device merge | How should concurrent device actions combine? | Immutable idempotent operations converge without last-write-wins loss; captured values may differ from later edits. | Add/subtract every unique captured-value action exactly once. | Extend queued RPC contract with captured points/cost and duplicate-undo convergence. | Resolved 2026-08-09 |
| PWA implementation | Which offline foundation? | Serwist plus IndexedDB is maintained and suited to Next.js offline support; adds dependencies/Webpack setup. | Serwist plus IndexedDB. | Add PWA build and storage boundary. | Resolved |

## Contracts and boundaries

- **Browser storage:** IndexedDB records are versioned and scoped by authenticated parent ID; they contain the selected child current-week snapshot and queue only. Sign-out deletes that scope.
- **Queue contract:** each record has a generated idempotency key, action kind (`complete`, `undo`, `redeem`), child/task/reward references, effective date where applicable, and the point value captured when tapped.
- **Server/API:** idempotency-key handling applies each unique captured-value mutation once. The server remains the only ledger writer, validates current child access and source ownership, and accepts archived-but-retained tasks/rewards.
- **Service worker:** precache versioned static assets and the offline shell; never cache authenticated route HTML, Supabase REST/Auth responses, cookies, or credentials.
- **Conflict policy:** FIFO replay with automatic retry. Unique operations are additive, duplicate request IDs are no-ops, and duplicate undo requests converge to the existing reversal.
- **Auth:** no cached data is served before a browser session exists; sign-out clears offline records before redirecting.

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |
| 1 | F1 | Add Serwist, manifest, icons, service worker, and offline shell. | `next.config.*`, `app/manifest.*`, `app/sw.*`, public icons, PWA registration. | iPhone Safari install; service-worker cache inspection; offline shell test. |
| 1 | F2 | Make workspace and dialogs iPhone-first. | `app/globals.css`, workspace/menu/dialog components. | Component tests and manual iPhone viewport checks. |
| 2 | F3 | Introduce scoped IndexedDB snapshot storage and sign-out clearing. | Offline storage module, root workspace hydration, sign-out route/action. | Storage unit tests; offline reload and sign-out manual tests. |
| 3 | F4 | Add idempotent mutation contract and persistent FIFO action queue. | migration/RPCs, points actions, queue/reconciliation modules. | TDD for duplicate replay, ordering, auth, and rejection cases; linked migration verification. |
| 4 | F5 | Add sync status, Needs attention list, discard, reconnect/resume triggers, and install tip. | workspace UI, queue state, install-tip component. | Queue lifecycle tests; online/offline iPhone manual matrix. |
| 5 | Release gate | Verify cache privacy, accessibility, deployment, and rollback. | Vercel/PWA config, docs/status. | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, iPhone Safari matrix. |

## Risks and rollback

| Risk | Containment | Rollback |
| --- | --- | --- |
| Stale authenticated content leaks through caching | Cache static shell/assets only; browser storage is owner-scoped and cleared on sign-out. | Disable service-worker registration and release a cache-clearing version. |
| Reconnect duplicates points | Server-enforced idempotency key plus queued-record state transition only after confirmation. | Disable queue sending and preserve items for review. |
| Safari does not run background sync while closed | Sync on app open, resume, and connectivity events; never promise closed-app background delivery. | Queue remains visible for manual reconnect. |
| Deployed service worker serves stale UI | Versioned precache and update notification/reload path. | Publish a service-worker unregister/cache-clear release. |
| Offline snapshot becomes invalid after another device changes management data | Server validates all replayed actions; rejected action remains visible. | Discard rejected action; refresh snapshot online. |
