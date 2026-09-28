# Feature Plan: Reopen Task and Reward Managers

## Status

Approved 2026-09-28 — repair the reported + button reopening failure.

## Outcome

After a parent closes the task or reward manager, the matching + button reliably opens it again.

## Scope and acceptance criteria

- Keep the `manage` query parameter while its manager is open.
- Remove it through Next.js navigation when that manager closes.
- Do not use the native History API for this route state.

## Dependency matrix

| ID | Feature | Depends on | Unlocks | Completion check |
| --- | --- | --- | --- | --- |
| F1 | Router-synchronized manager closing | Existing manager URL entry | Release validation | A task or reward manager can be opened, closed, and opened again. |

## Verification

- Add a focused red/green regression test.
- Run lint, typecheck, full tests, and production build.
