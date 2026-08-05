# SmartPoints — AI Development Guide

## Purpose

SmartPoints is a new product whose exact customer problem and MVP are still to be
confirmed. Its development process is AI-assisted, but product decisions,
external spending, and irreversible actions remain human-controlled.

## Operating Model

1. Read relevant product, architecture, and implementation-status documents before changing code.
2. Split work into independently testable, user-meaningful features.
3. Write assumptions, scope, acceptance criteria, and a dependency matrix in a plan.
4. Get explicit plan approval before implementation; re-approve if scope or order changes.
5. Use `tdd` for behavior-changing implementation: write a focused failing test first, make the smallest change to pass it, then run the relevant broader checks. A TDD skip is allowed only for documentation/configuration-only work and must be recorded with its reason.
6. Implement one approved task at a time with a focused diff.
7. Run the narrowest useful checks and record exact results.
8. Update contracts and documentation with the code. Update customer-facing feature state for material product changes.

Use the project skills in `.agents/skills/`.

Use `tdd` for test-first implementation, regression-tested bug fixes, and behavior changes that need proof through tests. Its red/green loop is mandatory for those tasks.

## Planning and Dependencies

- A feature is a reversible, user-meaningful outcome—not a technical layer.
- Every feature plan needs feature IDs, prerequisites, what each feature unlocks, a parallel group only where safe, and a completion check.
- Do not parallelize work that shares a contract, migration, or ownership boundary.
- If a discovered dependency changes the approved order, update and re-approve the plan.

## Mandatory Plan Critique

Run `grill-me` before plan approval. Resolve one material branch at a time and record the question, recommendation/trade-off, decision, and plan change. Do not implement with open material decisions.

Before asking the user any product or implementation question, provide a concrete recommendation and its meaningful trade-off. Use repository evidence to avoid questions that can be answered without the user; ask only when the answer affects product scope, safety, cost, or architecture.

For every AI-originated product or implementation suggestion or decision—whether or not it asks a question—lead with a concrete recommendation, its meaningful trade-off, and the evidence or assumption behind it. Do not present a list of choices without stating which option you recommend and why.

Every `grill-me` question must use this explicit order, with these labels: **Recommendation**, **Why**, **Trade-off**, then **Decision needed**. Never place the question first or bury the preferred option inside a paragraph.

## AI Decision Gate

Use `grill-me` for every product or implementation decision made by AI—not only during planning. Before adopting a decision, present one decision branch, a concrete recommendation, and its meaningful trade-off; obtain and record the user’s answer. Do not silently select an architecture, dependency, data model, user behavior, provider, security policy, or other implementation approach on the user’s behalf.

## Product and AI Rules

- Treat provider data, prices, availability, and model output as advisory until verified.
- Keep deterministic business rules in code, not prompts.
- Validate versioned model output before application logic or persistence.
- Never place keys, personal data, raw provider payloads, or tokens in source, fixtures, logs, prompts, plans, or documentation.
- Do not add a paid service, AI provider, database, authentication, or payment flow until an approved plan defines its contract, privacy, cost, and fallback behavior.

## Quality Gate

Run applicable project checks before declaring completion:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Never report an unrun check as passed.

## Implementation Continuity

- `docs/plans/IMPLEMENTATION-STATUS.md` is the one resume point for active work.
- After each task: write a task result, update status/next step/blockers, and record checks.
- A new session reads this status document before changing code.

## Approval Boundaries

Ask before adding paid services, creating external accounts, transmitting user data to a third party, changing retention, deleting data, pushing, or deploying.
