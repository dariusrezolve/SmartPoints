# Feature Plan: Timed Rewards

## Status

Approved 2026-09-26 through explicit user decisions.

## Outcome

Parents can mark a reward as time based, give it a default duration, and see one persistent countdown on that reward after redemption. The timer extends on repeat redemption, follows Undo, and alerts while the workspace remains open.

## Decisions

| Decision | User decision |
| --- | --- |
| Timed reward setup | A “Time based” checkbox reveals a Duration field with a 30-minute default. |
| Duration range | 1–1,440 minutes. |
| Repeat redemption | Add the configured duration to the running countdown. |
| Undo | Subtract the undone redemption’s duration; remove the timer when no duration remains. |
| End alert | Centered in-app alert with a short sound, plus browser notification where permission is granted. No push service. |

## Scope

- Optional `duration_minutes` setting per reward.
- Immutable per-redemption duration snapshot and child/reward timer state that respects Undo.
- Countdown on each timed reward card across reloads.
- Foreground end alert and optional browser notification.

## Excluded

- Push notifications or a guaranteed alarm after the browser is closed.
- Copying active timers into new-family templates.

## Dependency matrix

| ID | Feature | Depends on | Unlocks | Completion check |
| --- | --- | --- | --- | --- |
| F1 | Timed reward configuration | — | F2 | Reward form stores a nullable duration and exposes the checkbox/default field. |
| F2 | Persistent redemption timer | F1 | F3 | Redeem/Undo atomically extend or reduce child-local timer state. |
| F3 | Countdown and end alert | F2 | Release validation | Countdown survives refresh and alerts in an open workspace. |

## Verification

- Add focused failing tests before each feature.
- Run real-role database tests for child isolation and timer mutation.
- Run lint, typecheck, full test suite, and build after F3.
