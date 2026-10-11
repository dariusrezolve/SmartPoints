# Feature Plan: Instant Installed-PWA Action Feedback

## Status

Complete locally 2026-10-04 — see `task-01-result.md`; not deployed.

## Outcome

An installed SmartPoints PWA confirms a task completion, reward redemption, or Undo immediately after the parent taps it. The action remains safely queued and reconciles in the background, with the UI replacing the provisional feedback when the sync succeeds, remains offline, or is rejected.

## Facts, assumptions, and open questions

- Facts:
  - The PWA manifest starts installed launches at `/~offline`, whose cached workspace is usable before an authoritative navigation.
  - The cached workspace currently waits for `queue()` and `sync()` before assigning `notice`; this makes visible feedback wait for IndexedDB work and a Supabase RPC.
  - The normal workspace already shows `Saved. Syncing…` before queueing/syncing and uses a synchronous pending-action guard to prevent duplicate taps.
  - Queue records have client-generated IDs and server-side idempotent RPC handling; changing presentation does not require a migration or RPC change.
- Assumptions:
  - The cached workspace remains the installed-PWA first view; this patch does not alter its privacy, cached-data, or routing policy.
  - A pending task/reward/Undo control should reject repeated taps until the initial reconciliation settles.
- Open questions: None material. The user approved the immediate optimistic-feedback direction on 2026-10-04.

## Scope

### Included

- Immediate, action-specific provisional feedback in the cached `/~offline` workspace.
- Immediate pending state and duplicate-tap protection for cached task completion, reward redemption, task Undo, and reward Undo.
- Existing optimistic point-summary update remains driven by the durable queued action.
- Existing success, offline/queued, and rejection outcomes replace the provisional feedback after reconciliation.
- Focused regression coverage and an implementation-status task result.

### Excluded

- Changes to Supabase RPCs, schema, idempotency behavior, or authorization.
- Caching authenticated server responses, changing the PWA launch route, or changing offline-storage retention/privacy.
- New animation, service, analytics, notification permission, or deployment.

## Acceptance criteria

- [ ] On the cached installed-PWA workspace, a task, reward, or Undo tap renders an action-specific “Saved. Syncing…” acknowledgement before IndexedDB queueing or network reconciliation completes.
- [ ] The tapped cached control visibly enters pending state and cannot generate a second action until the first one settles; unrelated controls remain usable.
- [ ] The point summary reflects the queued action as soon as the queue state is refreshed.
- [ ] Successful reconciliation replaces the provisional message with the existing success wording; offline/queued and rejected outcomes use clear existing-compatible feedback.
- [ ] A rejected action does not remain represented as an optimistic point change after the queue refresh.
- [ ] No server, storage-schema, authorization, or service-worker contract changes occur.

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | Cached daily actions feel immediate and remain duplicate-safe. | Immediate provisional feedback, pending lock, deterministic final outcome for complete/redeem/Undo. | Cached workspace UI and existing client queue only. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | Existing `useOfflineActionSync` and cached snapshot action model | Release validation | — | The cached screen owns both the feedback and control state, so its behavior and test must change together. | Focused regression test proves feedback is set before awaits and matching controls are pending/disabled. |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| Installed-PWA action feedback | Should the cached installed PWA acknowledge task, reward, and Undo taps immediately rather than wait for sync? | Show an optimistic, immediate acknowledgement and reconcile in the background; a later sync failure must replace the provisional result with clear status. This feels responsive but temporarily presents a pending, not server-confirmed, outcome. | Approved by user 2026-10-04. | Add F1 to align cached-workspace feedback and duplicate protection with the normal workspace while retaining the existing durable queue. | Resolved |

## Contracts and boundaries

- **Web:** `app/~offline/page.tsx` owns provisional notification and per-action pending state. It must make visible state updates before its first `await`.
- **Queue/data:** Continue using `useOfflineActionSync`, IndexedDB queue records, optimistic-summary projection, request IDs, and existing final sync statuses unchanged.
- **API/database/authorization:** No changes. The same Supabase RPCs and server idempotency rules remain authoritative.
- **Privacy/cache:** The cached route, bounded snapshot, sign-out cleanup, static-only service-worker cache, and manifest start route remain unchanged.

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |
| 1 | F1 | Add focused failing assertions for immediate cached-workspace feedback and duplicate-safe pending controls. | `tests/cached-workspace.test.ts` (or a new focused client-contract test). | Targeted test fails before code change. |
| 2 | F1 | Add the minimal cached-workspace provisional state, per-action guard, and final outcome handling; reuse established wording and queue hook. | `app/~offline/page.tsx`. | Focused test passes; manual local interaction confirms tap feedback precedes throttled sync. |
| 3 | F1 | Record result and update the resume status. | `docs/plans/18-installed-pwa-action-feedback/task-01-result.md`, `docs/plans/IMPLEMENTATION-STATUS.md`. | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check`. |

## Risks and rollback

| Risk | Containment | Rollback |
| --- | --- | --- |
| A queued action appears confirmed but the server rejects it | Use provisional wording and replace it with the queue’s existing rejection result; queue refresh removes its optimistic point effect. | Revert cached feedback/pending UI only; queue and server behavior are untouched. |
| Rapid taps create duplicate queue entries | Guard by action key synchronously before the first await and disable only that matching control. | Revert the UI patch; existing server idempotency remains a safety net. |
| Cached and authoritative views diverge during refresh | Do not change refresh routing or summary projection; preserve the current queue overlay. | Revert the client-only patch. |
