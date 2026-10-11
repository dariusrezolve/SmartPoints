# Feature Plan: Share the SmartPoints App

## Status

Complete locally 2026-10-11 — see `task-01-result.md`; not deployed.

## Outcome

Parents can select a new **Share app** entry directly above **Install app** in the workspace menu to send SmartPoints’ public home link to someone else. A supported browser opens its native share sheet; other browsers copy the same link and confirm the result.

## Facts, assumptions, and open questions

- Facts:
  - `WorkspaceMenu` already owns the existing **Install app** entry and browser-only menu interactions.
  - The separate **Share access** feature creates an email-bound, one-time invitation to a child and must remain distinct.
  - The browser’s current origin is available client-side and does not require a server endpoint or environment setting.
- Assumptions:
  - The shared app link is `${window.location.origin}/`; it contains no child ID, invitation token, query parameter, or household data.
  - Native Web Share is optional browser capability; copying is the deterministic fallback.
- Open questions: None material. The user approved the behavior and placement on 2026-10-11.

## Scope

### Included

- A **Share app** menu action immediately above **Install app**.
- Native sharing of the public home link where `navigator.share` is supported.
- Clipboard fallback with visible success/failure feedback when native sharing is unavailable or dismissed/fails.
- Focused regression coverage and status/task-result documentation.

### Excluded

- Changes to child sharing/invitations, authentication, database, server actions, or PWA installation behavior.
- Referral tracking, analytics, custom messages, social-provider integrations, or sharing any authenticated/workspace URL.

## Acceptance criteria

- [ ] The menu shows **Share app** immediately before **Install app**.
- [ ] The target is always the public root URL from the current origin, without child or invite data.
- [ ] On browsers with Web Share, selecting the action opens the native share flow with the public app link.
- [ ] Without Web Share, the link is copied to the clipboard and a user-visible confirmation is shown.
- [ ] A sharing or clipboard failure leaves the workspace usable and displays clear feedback.
- [ ] The existing **Share access** invitation and **Install app** behaviors are unchanged.

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | Parents can safely recommend SmartPoints from the menu. | Public-only URL, native share/copy fallback, clear feedback, required placement. | Client menu UI and browser APIs only. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | Existing workspace menu | Release validation | — | Menu ownership, browser capability detection, and its regression test share one client contract. | Focused test proves the action, placement, public URL construction, and fallback contract. |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| Public sharing behavior | Should the app share the public home link via native Web Share with clipboard fallback? | Share `${window.location.origin}/` through native sharing, falling back to copy. Native sharing is best on phones; clipboard requires the sender to paste the link in browsers without it. | Approved by user 2026-10-11. | Add F1 without touching the existing child invitation flow. | Resolved |
| Menu placement | Where should **Share app** appear? | Place it immediately above **Install app**, grouping app-discovery actions together. | Approved by user 2026-10-11. | Require the exact menu ordering in F1. | Resolved |

## Contracts and boundaries

- **Web:** `WorkspaceMenu` invokes only browser APIs after an explicit menu click. It constructs `new URL("/", window.location.origin).toString()` or an equivalent root-only URL.
- **Data/auth/server:** No data reads/writes, server action, invitation, auth, or authorization changes.
- **Privacy:** No selected child, query state, user identity, or invitation token enters the shared link.
- **Browser fallback:** When `navigator.share` is absent or rejects, attempt `navigator.clipboard.writeText`; report success or a non-blocking failure.

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |
| 1 | F1 | Add a focused failing menu-contract test for public-link sharing, fallback, and placement. | Existing/new focused menu test. | Targeted test fails before implementation. |
| 2 | F1 | Add the minimal client handler, feedback state, and menu action above install. | `app/components/workspace-menu.tsx`. | Focused test passes; manual browser check of supported/fallback paths where available. |
| 3 | F1 | Record the completed task and update the resume status. | `docs/plans/19-share-app-link/task-01-result.md`, `docs/plans/IMPLEMENTATION-STATUS.md`. | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check`. |

## Risks and rollback

| Risk | Containment | Rollback |
| --- | --- | --- |
| An authenticated or child-specific URL is shared | Construct a root-only URL from the origin; regression-test its contract. | Revert the client-only menu action. |
| Browser lacks Web Share or clipboard permission | Use the two-stage fallback and non-blocking feedback; do not prevent other menu actions. | Revert the action with no persisted state to clean up. |
| Users confuse app sharing with child access | Keep the existing **Share access** label and place **Share app** in the app-discovery group beside installation. | Revert or relabel the new entry independently. |
