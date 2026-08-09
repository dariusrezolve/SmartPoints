# Statistics Trends Plan

## Scope and decisions

- **Recommendation:** compare the selected week with the immediately preceding Monday–Sunday week in one dashboard.
  **Why:** it answers whether points earned and spent are changing without adding a new date-range model.
  **Trade-off:** this is a two-week comparison, not a long-term forecasting view.
  **Decision:** approved by the user's request and standing instruction to use recommendations.
- **Recommendation:** calculate trends deterministically from the existing point-event ledger, netting task undo events.
  **Why:** the ledger is the source of truth and no new provider or dependency is required.
  **Trade-off:** aggregation remains application-side until family histories justify a database view.
  **Decision:** approved by standing instruction.
- **Recommendation:** show zero-baseline changes as `New` instead of an infinite percentage.
  **Why:** a percentage from zero is undefined and would be misleading.
  **Trade-off:** not every row displays a numeric percentage.
  **Decision:** approved by standing instruction.

## Features and dependencies

| ID | Feature | Prerequisite | Unlocks | Completion check |
| --- | --- | --- | --- | --- |
| ST1 | Deterministic two-week aggregation | Existing `point_events` ledger | ST2 | Unit tests cover totals, undo events, percentage changes, daily series, and spend shares. |
| ST2 | Overall and task/reward trend UI | ST1 | ST3 | Statistics page shows overall cards, line trends, task ranking, and reward-spend percentages. |
| ST3 | Release verification | ST2 | Deployment | Lint, typecheck, tests, build, and production smoke check pass. |

ST1 and ST2 share a data contract and must remain sequential. ST3 follows both.
