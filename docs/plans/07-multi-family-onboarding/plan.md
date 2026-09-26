# Feature Plan: Independent Family Onboarding

## Status

Released to production — 2026-09-26. Preview health validation and production migration/health verification passed.

## Outcome

A new parent can sign up, create a family with one or more child profiles, and optionally start each child with a copy of the approved task and reward definitions. Each child's selections, points, and redemptions remain separate. An invited parent retains access only to the child explicitly shared with them.

## Facts, assumptions, and open questions

- Facts: The protected home page renders the family menu only when a readable child already exists. The membership migration backfilled owners for children present at migration time but does not create owner memberships for later children. Child reads and point-action RPCs now require membership.
- Facts: Tasks, rewards, daily task selections, and ledger events are child-owned. The current "Set daily tasks" list persists across weeks, despite older weekly-plan naming. The repository has no production data connection or production template export.
- Facts: Existing tests do not exercise a fresh account creating its first child or two families operating concurrently. Supabase's current RLS guidance requires both grants and policies and recommends real-role database tests.
- Assumption pending verification: New users will use the existing email/password sign-up flow; hosted Auth email and redirect configuration must be checked before rollout.
- Facts: A read-only production query on 2026-09-26 found exactly one active approved source profile. It returned only active task/reward definitions and daily-selection flags; it excluded identifiers, emails, point events, balances, and other family data.
- Open input: None.

## Scope

### Included

- Fresh-account empty state and first-child creation.
- Owner membership for every newly created child and repair of any existing owner memberships missing since the original backfill.
- Optional, independent copies of approved task/reward definitions and selected tasks for each new child.
- Real-role checks for owner, invited parent, and unrelated account access to children, catalog records, selections, and point changes.
- Update current-system, customer-facing feature state, and implementation status after verified tasks.

### Excluded

- Copying historical point events, redemptions, balances, child identities, or private family data.
- Live synchronization from the original family's tasks or rewards into other families.
- New provider, payment, or child-login flows.
- Production deployment until the release policy's current-conversation authorization is given.

## Approved starter snapshot

The template copies these active definitions into new, child-owned records only when the parent opts in. Every listed task is selected in the copied persistent daily list.

| Kind | Name | Value | Icon | Selected |
| --- | --- | ---: | --- | --- |
| Task | Rutina de dimineata | 1 point | School | Yes |
| Task | Go to the bathroom | 1 point | Bath | Yes |
| Task | Rutina de seara | 1 point | BedDouble | Yes |
| Task | Ma opresc la timp | 1 point | Medal | Yes |
| Task | Extra tasks | 1 point | WashingMachine | Yes |
| Task | Mers la baie x 3plus bonus | 4 points | Sun | Yes |
| Reward | Book | 3 points | Sparkles | — |
| Reward | Screen time | 1 point | Gamepad2 | — |
| Reward | Jucarie | 2 points | ToyBrick | — |
| Reward | Joc | 10 points | Palette | — |
| Reward | Shopping | 1 point | Star | — |

## Acceptance criteria

- [x] A newly registered parent with no children sees a clear setup action and can create a first child without a hidden or unusable profile.
- [x] The owner can create further children; each is readable and has its own tasks, rewards, selected tasks, and point balance.
- [x] The template choice creates independent task/reward records and selected tasks only for the new child; choosing no template starts with empty lists.
- [x] Adding, editing, completing, redeeming, undoing, or resetting one child's points does not alter another child's data or balance.
- [x] An unrelated account cannot read or mutate another family's records by supplying IDs directly. A shared parent can access only the invited child.
- [ ] A new account can complete the sign-up and first-child flow in a staging/preview environment with the configured Auth email behavior. Preview is deployed and healthy; it has no isolated Auth backend, so this walkthrough remains a production follow-up.

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | A new parent creates and opens their first child profile. | Empty state works; owner membership is written atomically; existing missing owner memberships are repaired. | Web, Auth, database, RLS. |
| F2 | A parent optionally starts a child from an approved starter set. | Independent definitions and selection are copied once; no ledger history is copied. | Web, server action/RPC, database, product content. |
| F3 | Separate families use points without interference. | Two-family and invited-parent authorized flows prove read/write isolation and child-local balances. | RLS, RPCs, offline reconciliation, verification. |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | — | F2, F3 | — | Establishes child ownership and first-use contract. | Fresh account creates and reads a child under its own role. |
| F2 | F1, approved sanitized template snapshot | F3 | — | Shares child creation and selection contracts with F1. | Template and empty setup both create usable independent children. |
| F3 | F1, F2 | Release validation | — | Exercises the same RLS, RPC, and child records. | Two-family and shared-parent authorization matrix passes. |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| Template semantics | Should the production catalog be copied as definitions without history? | Copy task/reward definitions and selected tasks per child; copies can drift from later source changes but stay independent. | User: "yes, copy definitions only". | Exclude all history and balance imports; make copies child-owned. | Resolved |
| Template source | How will the exact current production definitions be obtained? | Use a sanitized export with names, point values/costs, icons, and selection flags; requires manual snapshot but avoids accessing credentials or child data. | User directed a read of the current production Supabase database, using one named child's catalog as the source. | Read only the approved source child's definitions and selection, then sanitize before recording the reusable template. The read found exactly one match and is recorded above. | Resolved |
| Selection behavior | Should the copied selection follow the existing daily list across weeks? | Preserve the existing selection model; it avoids a new weekly rules change but cannot vary by week. | User: use the current daily list; week-specific selection is unnecessary for now. | Copy the source child's selected active tasks into each opted-in child's persistent daily list. | Resolved |
| Creation boundary | How should child/profile/template setup be committed? | Show an unchecked opt-in for each child and use one database transaction for child, owner membership, and optional template copy; extra SQL keeps setup from partially succeeding. | User: "yes, use atomic optin". | Add explicit per-child opt-in and an atomic database setup path. | Resolved |

## Contracts and boundaries

- Authentication: retain the existing Supabase email/password flow and verify hosted signup, confirmation, and redirect settings before rollout.
- Authorization: every child must have an owner membership; access to child, task, reward, selection, and ledger records is limited to the owner or a child-specific shared membership. Do not trust client-supplied child IDs alone.
- Data: template definitions carry only approved generic name, positive point value/cost, and valid icon; selected task flags map to the child's newly created task IDs. Each child starts with no events or resets.
- Offline: queued point operations keep their existing child ID, captured value, and idempotency contract. Verify two-account and two-child separation without introducing a new queue format unless a failure is found.
- Provider: no new service or key. The existing hosted Supabase Auth configuration must be verified before sharing with new users.

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |
| 1 | F1 | Add a failing first-child regression and database authorization test; repair owner membership and render empty-family setup. | `app/page.tsx`, `app/children/actions.ts`, new migration, focused tests. | Complete locally: red/green, authenticated-role read, lint, typecheck, full test suite, and build passed. |
| 2 | F2 | Add failing opt-in template tests; add the approved sanitized template and atomic child setup path. | Template source, child setup UI/action or RPC, migration if needed, focused tests. | Complete locally: explicit opt-in, 6 task definitions, 5 rewards, six daily selections, and zero copied events verified. |
| 3 | F3 | Add two-family and invited-parent regression matrix; fix any exposed child-scope defects. | Database tests, relevant RPC/policies, docs. | Complete locally: 11 real-role assertions, lint, typecheck, full test suite, and build passed. Preview sign-up validation remains. |

## Risks and rollback

- Missing owner memberships can hide newly created children. A forward migration should repair only `(child_id, parent_id)` owner pairs that match `children.parent_id`; verify before/after counts without printing family data. Roll back code by disabling new setup UI if verification fails; do not remove existing valid memberships.
- A template snapshot may contain family-specific text. Review and sanitize it before adding any definitions to source or migration files.
- Partial child/catalog setup could leave an unusable profile. The chosen creation boundary must be transactional or provide a verified safe retry path.
- Existing production Auth configuration may prevent confirmation or recovery. Stage and test sign-up before any production release.
