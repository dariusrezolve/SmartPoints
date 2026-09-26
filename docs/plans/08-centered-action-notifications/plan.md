# Feature Plan: Centered Action Notifications

## Status

Approved 2026-09-26 — user selected a large, centered confirmation card with action-specific colors.

## Outcome

Task completion and reward redemption feedback is immediately visible in the center of the workspace and clearly distinguishes points earned from points spent.

## Scope and acceptance criteria

- A task completion displays a centered emerald confirmation card with the added points.
- A reward redemption displays a centered amber confirmation card with the redeemed points.
- Offline and error states remain centered and use distinct slate and red colors.
- Notifications stay above dialogs, announce through the existing live region, and dismiss after the existing 3.5 seconds.

## Decision record

| Decision | Recommendation | User decision |
| --- | --- | --- |
| Placement and appearance | Use a large centered card with solid high-contrast action colors. | Approved: “yes, but make it central”. |

## Implementation and verification

| Task | Contract | Verification |
| --- | --- | --- |
| F1 | Give task, reward, offline, and error notifications separate visual states; center the popover. | Focused red/green test, then lint, typecheck, full test suite, and build. |
