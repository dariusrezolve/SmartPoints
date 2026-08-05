# SmartPoints MVP Roadmap

## Status

Core MVP scope is documented in the draft `01-mvp-core` plan and awaits explicit approval before implementation.

## Candidate feature inventory

| ID | Candidate outcome | Status | Depends on | Notes |
| --- | --- | --- | --- | --- |
| D1 | Confirm target user, problem, and MVP outcome | Complete | — | Parent-operated points/rewards MVP is defined in the draft plan. |
| D2 | Approve product and technical foundation plan | In review | D1 | Next.js + Supabase selected; explicit plan approval remains required. |
| D3 | Implement first user-visible MVP capability | Blocked by D2 | D2 | Must use the approved `01-mvp-core` plan. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| D1 | — | D2 | — | Product decisions govern all later work. | Approved vision defines user, problem, and MVP boundary. |
| D2 | D1 | D3 | — | Foundation contracts depend on product scope. | Approved foundation plan and completed grill record exist. |
| D3 | D2 | Future features | — | First capability sets initial contracts. | Customer-visible acceptance criteria are verified. |
