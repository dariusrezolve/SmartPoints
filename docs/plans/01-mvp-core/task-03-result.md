# F3–F5 Result: Basic Points Workspace

## Outcome

The selected child now has a basic, protected workspace. It displays the current household day, current derived balance, reusable tasks and rewards, and recent activity. A parent can add a starter/custom task, tap it repeatedly to award points, undo one completion, add a reward, and redeem it even into a negative balance.

## Implemented

- Added active child-owned `tasks` and `rewards`, plus an immutable `point_events` ledger.
- Added ownership RLS, appropriate table grants, indexes, and restricted transactional RPCs for completion, undo, and redemption.
- Added local starter tasks and shared title, integer-point, and household-date validation.
- Added the current-day workspace UI, activity feed, balance, task completion controls, reward redemption controls, and setup forms.

## Verification

- `tests/points-validation.test.ts` was written first and initially failed because the new domain helper did not exist; it passed after implementation.
- Local migration applied successfully.
- A disposable two-parent local Data API flow verified repeated completion, one undo, negative-balance redemption, correct derived balance, and cross-parent RPC rejection.
- `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` passed.

## Remaining MVP work

- Editable/hide controls for tasks and rewards.
- Current-week prior-day selection/navigation and its UI validation.
- Full weekly summary/dashboard and final integration/accessibility polish.
