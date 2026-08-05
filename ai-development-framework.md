# AI Development Framework Bootstrap Guide

This document describes how to reproduce the AI-assisted development framework used by this repository in a new, empty project. It is intentionally product- and provider-neutral: copy the process and guardrails, then replace the example product language with the new product’s needs.

## What this framework provides

- Human approval before implementation, deployment, external spending, or irreversible work.
- Small, user-meaningful features rather than large technical batches.
- A dependency matrix so work is performed or parallelized in a safe order.
- A recorded decision grill before a plan is approved.
- A single resume document so a new agent/session can continue without reconstructing history.
- Versioned AI contracts, deterministic validation, privacy/cost boundaries, and evaluations.
- Secure handling of secrets, database migrations, and third-party providers.
- Customer-facing feature-state documentation that can be reused in sales material.

## 1. Create the repository structure

From the root of a new repository, create this structure:

```text
.
├── AGENTS.md
├── .agents/
│   └── skills/
│       ├── approval-gated-task-execution/
│       ├── evaluate-ai-change/
│       ├── grill-me/
│       ├── implement-approved-task/
│       ├── karpathy-guidelines/
│       ├── plan-feature/
│       ├── secret-safety/
│       ├── supabase/
│       ├── supabase-postgres-best-practices/
│       └── tdd/
├── apps/
│   ├── web/                 # customer-facing application
│   └── api/                 # only if a separate API boundary is required
├── packages/
│   ├── domain/              # provider-independent business rules/types
│   └── ai/                  # provider-independent AI contracts/prompts/evals
├── docs/
│   ├── architecture/
│   ├── plans/
│   ├── product/
│   └── templates/
├── prompts/                 # reusable AI workflow prompts
│   ├── workspace.md
│   ├── create-plan.md
│   ├── implement-task.md
│   ├── review-change.md
│   ├── fix-review-findings.md
│   ├── fix-pr-comments.md
│   └── create-pull-request.md
├── supabase/
│   └── migrations/          # only when Supabase/Postgres is in scope
└── scripts/
```

Use a monorepo only when more than one application/package genuinely needs to share code. A single application can still use this framework with `app/`, `docs/`, `.agents/`, and `scripts/` at the root.

## 2. Install the project skills

Each skill is a directory containing a `SKILL.md`. In a fresh project, copy the skills from this framework source (or from a maintained shared framework repository) rather than retyping them.

```bash
FRAMEWORK_SOURCE=/absolute/path/to/smart_trip_planner

mkdir -p .agents/skills
for skill in \
  approval-gated-task-execution \
  evaluate-ai-change \
  grill-me \
  implement-approved-task \
  karpathy-guidelines \
  plan-feature \
  secret-safety \
  supabase \
  supabase-postgres-best-practices \
  tdd; do
  cp -R "$FRAMEWORK_SOURCE/.agents/skills/$skill" ".agents/skills/$skill"
done
```

If the framework is being built from the Rezolve shared skills checkout instead, copy the locally available skills from its `.agents/skills/` directory. In particular, this project copied these three from `~/work/rezolve/rp/.agents/skills/`:

- `approval-gated-task-execution`
- `karpathy-guidelines`
- `secret-safety`

### Skill responsibilities

| Skill | Use it when | Required behavior |
| --- | --- | --- |
| `plan-feature` | Planning any feature or integration | Read relevant docs, create a feature plan with acceptance criteria and dependency matrix, run `grill-me`, then wait for approval. |
| `grill-me` | Stress-testing a plan/design | Ask one material decision at a time, give a concrete recommendation/trade-off before every product or implementation question, and record the answer. |
| `implement-approved-task` | Implementing an approved plan task | Make the smallest scoped change, test it, and write a task-result handoff. |
| `approval-gated-task-execution` | Multi-task approved work | Execute in approved dependency order, summarize each task, preserve result bundles, and perform an integration gate. |
| `karpathy-guidelines` | Any code change/review/refactor | Prefer simple, surgical, verifiable work; surface uncertainty instead of inventing scope. |
| `secret-safety` | Before commits/pushes or config changes | Prevent secrets from being committed, logged, or copied into docs/examples. |
| `evaluate-ai-change` | Adding/changing an AI capability | Define repeatable quality/safety evaluation before broad rollout. |
| `supabase` | Any Supabase Auth/DB/RLS/migration work | Check current docs/changelog, apply RLS/security rules, migrate safely, and verify live behavior. |
| `supabase-postgres-best-practices` | Writing/reviewing Postgres schema or queries | Apply performance and safety practices appropriate to the database change. |
| `tdd` | Test-first development, regression-tested bug fixes, or behavior changes needing proof | Write a focused failing test first, make the smallest change to pass, then run focused and relevant broader tests. |

Do not install a skill merely because it exists. Read and apply it whenever its trigger matches the task.

## 3. Add the repository operating contract (`AGENTS.md`)

Create `AGENTS.md` at the repository root. This is the durable instruction set for every agent/session. Adapt product nouns, commands, and technology names, but retain the governance rules.

```md
# <Product> — AI Development Guide

## Purpose

This repository is a <product description>. Its development process is AI-assisted,
but product decisions, external spending, and irreversible actions remain human-controlled.

## Operating Model

1. Read relevant product, architecture, and implementation-status documents before changing code.
2. Split work into independently testable, user-meaningful features.
3. Write assumptions, scope, acceptance criteria, and a dependency matrix in a plan.
4. Get explicit plan approval before implementation; re-approve if scope/order changes.
5. Implement one approved task at a time with a focused diff.
6. Run the narrowest useful checks and record exact results.
7. Update contracts and documentation with the code. Update customer-facing feature state for material product changes.

Use the project skills in `.agents/skills/`.

## Planning and Dependencies

- A feature is a reversible, user-meaningful outcome—not a technical layer.
- Every feature plan needs feature IDs, prerequisites, what each feature unlocks,
  a parallel group only where safe, and a completion check.
- Do not parallelize work that shares a contract, migration, or ownership boundary.
- If a discovered dependency changes the approved order, update and re-approve the plan.

## Mandatory Plan Critique

Run `grill-me` before plan approval. Resolve one material branch at a time and record:
question, recommendation/trade-off, decision, and plan change. Do not implement with open material decisions.

Before asking the user any product or implementation question, provide a concrete recommendation and its meaningful trade-off. Use repository evidence to avoid questions that can be answered without the user; ask only when the answer affects product scope, safety, cost, or architecture.

For every AI-originated product or implementation suggestion or decision—whether or not it asks a question—lead with a concrete recommendation, its meaningful trade-off, and the evidence or assumption behind it. Do not present a list of choices without stating which option you recommend and why.

Every `grill-me` question must use this explicit order, with these labels: **Recommendation**, **Why**, **Trade-off**, then **Decision needed**. Never place the question first or bury the preferred option inside a paragraph.

## AI Decision Gate

Use `grill-me` for every product or implementation decision made by AI—not only during planning. Before adopting a decision, present one decision branch, a concrete recommendation, and its meaningful trade-off; obtain and record the user’s answer. Do not silently select an architecture, dependency, data model, user behavior, provider, security policy, or other implementation approach on the user’s behalf.

## Product and AI Rules

- Treat provider data, prices, availability, and model output as advisory until verified.
- Keep deterministic business rules in code, not in prompts.
- Validate versioned model output before application logic or persistence.
- Never place keys, personal data, raw provider payloads, or tokens in source, fixtures, logs, prompts, plans, or documentation.
- Do not add a paid service, AI provider, travel/provider integration, database, or payment flow until an approved plan defines contract, privacy, cost, and fallback behavior.

## Quality Gate

Run applicable project checks before declaring completion, for example:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Never report an unrun check as passed.

## Implementation Continuity

- `docs/plans/IMPLEMENTATION-STATUS.md` is the one resume point for active work.
- After each task: write a task result, update status/next step/blockers, and record checks.
- A new session reads this status document before changing code.

## Approval Boundaries

Ask before adding paid services, creating external accounts, transmitting user data to a third party,
changing retention, deleting data, pushing, or deploying.
```

## 4. Create the documentation baseline

Create these files before the first implementation task.

| File | Purpose | Keep current when |
| --- | --- | --- |
| `docs/product/vision.md` | Product premise, user problem, MVP/non-MVP boundaries, unresolved questions | Product decisions change |
| `docs/product/current-feature-state.md` | Sales-deck-safe description of what users can use now and important limitations | A customer-visible capability or limitation changes |
| `docs/architecture/current-system.md` | Current web/API/data/auth/provider architecture, security boundaries, operations | A boundary, provider, data flow, or deployment process changes |
| `docs/architecture/principles.md` | Durable architectural rules | A deliberate architectural decision is made |
| `docs/plans/mvp-roadmap.md` | Top-level MVP feature inventory and dependency matrix | MVP scope/order changes |
| `docs/plans/IMPLEMENTATION-STATUS.md` | Current position, completed result bundles, verified state, blockers, next task | Every implementation task ends |
| `docs/templates/feature-plan.md` | Reusable approval-ready feature-plan template | Rarely; keep stable |
| `docs/templates/task-result.md` | Reusable task handoff/result template | Rarely; keep stable |
| `docs/templates/adr.md` | Optional architecture decision record template | Rarely; keep stable |

Recommended starter files:

```md
<!-- docs/plans/IMPLEMENTATION-STATUS.md -->
# Implementation Status

## Last updated

<date and concise state>

## Current position

<what is implemented and what milestone is active>

## Completed task bundles

| Plan | Task | Result |
| --- | --- | --- |

## Verified state

- <only evidence-backed statements>

## Required before the next task can be fully verified

- <external configuration or live checks; do not include secrets>

## Next task

1. <first dependency-ready task>

## Resume protocol

1. Read `AGENTS.md`, this file, the roadmap, and the next approved plan.
2. Confirm required configuration without printing secrets.
3. Implement only the next dependency-ready task.
4. Run checks and record results.
```

## 5. Use this feature-plan template

Save this as `docs/templates/feature-plan.md`.

```md
# Feature Plan: <name>

## Status

Draft | Approved | Implementing | Complete

## Outcome

<user-visible outcome and why it matters>

## Facts, assumptions, and open questions

- Facts:
- Assumptions:
- Open questions:

## Scope

### Included

### Excluded

## Acceptance criteria

- [ ]

## Functional feature breakdown

| ID | Feature and outcome | Acceptance criteria | Boundaries affected |
| --- | --- | --- | --- |
| F1 | | | |

## Dependency matrix

| Feature | Depends on | Unlocks | Parallel group | Parallel-safety rationale | Completion check |
| --- | --- | --- | --- | --- | --- |
| F1 | — | | — | | |

## Grill-me record

| Decision branch | Question | Recommendation and trade-off | Decision | Plan change | Status |
| --- | --- | --- | --- | --- | --- |
| | | | | | Open |

## Contracts and boundaries

<web, API, data, AI, provider, authorization, and analytics contracts affected>

## AI considerations

Remove this section if the feature has no AI boundary.

- Input/output schema and version:
- Deterministic validation:
- Fallback behavior:
- Privacy and cost boundary:
- Evaluation fixtures and success measure:

## Implementation order

| Wave | Feature | Task | Files/contracts | Verification |
| --- | --- | --- | --- | --- |

## Risks and rollback

<failure modes, containment, reversal>
```

## 6. Planning workflow

For every non-trivial feature:

1. Read `AGENTS.md`, current product/architecture docs, implementation status, adjacent plans, and relevant code.
2. Separate facts, assumptions, and genuine open questions.
3. Split work into manageable functional features. Each must have a user-observable outcome and acceptance criteria.
4. Identify affected contracts: web, API, domain, data, authorization, AI, analytics, external providers, or deployment.
5. Write the dependency matrix before implementation order.
6. Run `grill-me` one decision branch per turn. Record all material decisions.
7. Write the plan in `docs/plans/<NN>-<feature-slug>/plan.md`.
8. Wait for explicit approval.

### Dependency-matrix rules

- `Depends on`: direct prerequisites only.
- `Unlocks`: the next user-meaningful capability or safe task.
- `Parallel group`: use only when no code ownership, contract, migration, or deployment overlap exists.
- `Completion check`: an observable/automated condition, not “implementation done.”
- A database migration, shared data type, or shared UI component normally makes tasks sequential.

## 7. Implementation workflow

After plan approval:

1. Build a task execution matrix from the plan.
2. Before each task, restate goal, affected boundaries, files/contracts, risks, checks, and rollback.
3. Apply `karpathy-guidelines`: choose the simplest change that satisfies acceptance criteria.
4. Implement only that task’s scope. Do not opportunistically refactor.
5. Add/adjust focused tests for behavior or contract changes.
6. Run focused checks, then broader package checks and a production build when appropriate.
7. Write `docs/plans/<plan>/task-<NN>-result.md` using this template:

```md
# Task Result: <task name>

## Plan reference

<link to plan and feature/task IDs>

## Changed

- Files:
- Contracts:

## Verification

- Checks run and result:
- Tests added or changed:

## Outcome and remaining risks

<what is true now and what remains>
```

8. Update `IMPLEMENTATION-STATUS.md`, plus architecture/product state when relevant.
9. For a multi-task plan, use task results as the handoff between tasks and run a final integration gate.

## 8. AI capability standard

Use this whenever an AI provider is introduced or changed.

1. Keep provider-specific code behind a small adapter/interface in `packages/ai` or a server-only boundary.
2. Version every input/output contract, for example `feature-name/v1`.
3. Send the minimum necessary user data. Never send identity, unrelated records, secrets, or analytics IDs without explicit approval.
4. Use structured output where supported; validate length, IDs, enum values, ordering, and numeric ranges deterministically.
5. Do not persist raw prompt/provider response unless an approved retention policy says so.
6. Require a human review step before AI output mutates user data whenever accuracy matters.
7. Define timeout, failure message, retry/fallback policy, quota/cost boundary, and privacy impact in the plan.
8. Create synthetic, non-personal evaluation fixtures before broad rollout; record quality, latency, and cost observations.

Recommended package shape:

```text
packages/ai/
├── src/
│   ├── contracts.ts
│   ├── providers.ts
│   └── index.ts
└── evals/
    └── <feature>.test.ts
```

## 9. UX framework standard

Use Tailwind CSS as the default UI framework for every new web interface unless the user explicitly chooses another framework. Start from a small shared component layer (for example `Button`, `Card`, and `Input`) backed by Tailwind utilities and a class-composition helper such as `class-variance-authority`, `clsx`, and `tailwind-merge`.

- Do not introduce a second styling system by default.
- Reuse the project’s shared UI primitives before adding one-off component styles.
- Add Radix primitives only when the product needs their behavior (for example dialogs, menus, or accessible popovers).
- Record an explicit user choice whenever deviating from Tailwind.

## 10. Database, authentication, and migration standard

When using Supabase/Postgres:

- Read the `supabase` skill and current Supabase changelog/docs before implementation.
- Keep publishable/browser keys separate from server-only credentials; never expose a service-role key.
- Enable RLS on exposed tables and use policies tied to real ownership/membership checks.
- Use migrations for every schema/RPC/policy change. Make migrations idempotent where appropriate and record application state.
- Treat security-definer functions as exceptional: explicit search path, caller validation, least privilege, and revoked public execution.
- Verify migrations with both schema/function inspection and an authorization-aware test when possible.
- Prefer stable IDs. Do not delete/recreate all records during a save if other features reference those IDs.
- Before changing an existing save path, inspect foreign keys and cascading behavior.

Example migration runner expectations:

```bash
pnpm db:migrate     # applies only unapplied, tracked migrations
pnpm typecheck
pnpm test
pnpm build
```

Never put a production database URL in committed configuration. Keep it in an untracked local environment file or a managed secret store.

## 11. Security and secret checklist

Before every commit, push, deployment, or configuration change:

1. Read/apply `secret-safety`.
2. Inspect `git diff` and `git status` for `.env`, tokens, logs, provider payloads, and URLs containing credentials.
3. Run the repository’s secret scanner if available (for example `scripts/check-secrets .`).
4. Confirm browser-visible environment variables are intentionally public and restricted by provider policy.
5. Use placeholder-only `.env.example` files. Never commit populated `.env.local` files.
6. If a real secret is ever committed or shared, rotate/revoke it and follow an approved history-remediation process.

## 12. Deployment and operations standard

- Separate build/deploy from database migrations unless explicitly approved.
- Use a manual, repeatable deploy script first; add CI/CD only after the manual flow is reliable.
- Store production secrets in the deployment platform, not source code.
- Run local checks before deployment and record the deployed revision/environment.
- Maintain an architecture document covering runtime components, data/auth/provider flows, server-only variables, operational commands, and deferred work.
- Do not claim a feature is production-ready until its provider configuration, authorization, migration, and live checks are complete.

## 13. Prompt workflow library

Keep reusable workflow prompts in `prompts/`. They complement skills: prompts define the end-to-end workflow, while skills supply mandatory behavior within that workflow. Copy and adapt the maintained prompt set from the framework source; remove source-specific ticket, repository, model, and deployment assumptions before reuse.

| Prompt | Use it for | Required guardrail |
| --- | --- | --- |
| `workspace.md` | Starting or resuming a session | Read status/plan first; do not mutate state during startup. |
| `create-plan.md` | Drafting an implementation plan | Finish `grill-me` before saving a plan; include TDD strategy and dependencies. |
| `implement-task.md` | Approved implementation | Follow dependency order, TDD, and applicable security/database skills. |
| `review-change.md` | Reviewing a change set | Report concrete findings, contract risk, security risk, and unrun checks first. |
| `fix-review-findings.md` | Applying a prior review | Fix only actionable findings and verify each scoped change. |
| `fix-pr-comments.md` | Addressing pull-request feedback | Do not push or post externally without authorization. |
| `create-pull-request.md` | Preparing a pull request | Require explicit user authorization before rebase, push, or PR creation. |

`AGENTS.md` remains authoritative. In particular, every AI-originated product or implementation decision must still use `grill-me`, and `secret-safety` applies before commits, pushes, deployments, or credential-adjacent work.

## 14. Embedded skill definitions

The following are the complete operational instructions needed to recreate the framework skills. Create one directory per skill under `.agents/skills/<skill-name>/` and save the corresponding block as `SKILL.md`.

### `approval-gated-task-execution/SKILL.md`

```md
---
name: approval-gated-task-execution
description: Execute planned implementation tasks sequentially with per-task approval, critique, scoped sub-agents, handoff bundles, and a final integration gate.
license: MIT
---

# Approval-Gated Task Execution

Use this skill when implementing an approved component plan.

## Workflow

1. Build an execution matrix from the approved plan: task, affected component, dependencies, files/contracts, and verification checks.
2. Execute tasks sequentially in approved plan order.
3. Before each task, summarize its goal, affected component, key files/contracts, risks, checks, and rollback.
4. Apply `karpathy-guidelines` to check for overcomplication, scope creep, and missing success criteria.
5. Run a quick rubber-duck critique. If it finds a likely flaw, revise the task summary and get approval again.
6. After approval, use a component-scoped sub-agent only when useful; do not grant it broader file access than needed.
7. After each task, capture files changed, contract changes, checks, and unresolved risks in a compact result bundle.
8. Use result bundles as the handoff to subsequent tasks. After all tasks, run a cross-component integration gate.

## Rules

- Follow the approved plan; do not reorder or expand scope without updating/re-approving it.
- Implement every approved planned item. Do not silently leave items partial.
- Stop for plan update when new required work is out of scope.
- Keep fixing failed checks within the task unless genuinely blocked.
- Make only needed changes, preserve project patterns, add no unrelated dependencies, and do not edit out-of-scope folders.
```

### `evaluate-ai-change/SKILL.md`

```md
---
name: evaluate-ai-change
description: Define and run safe, repeatable evaluation for an AI capability.
---

# Evaluate an AI Change

Use this skill whenever model behavior, a prompt, an AI schema, or a provider adapter changes.

1. Define the user outcome and a schema-valid success condition.
2. Add representative, non-sensitive fixtures to `packages/ai/evals/`.
3. Test valid output, malformed output, missing information, conflicting constraints, and provider/model failure.
4. Verify deterministic constraints are enforced outside the model.
5. Record prompt/model/schema versions and evaluation results in the feature plan or task result.
6. Never commit production user data or personal data in fixtures.
```

### `grill-me/SKILL.md`

```md
---
name: grill-me
description: Interview the user about a plan or design until reaching shared understanding and resolving each decision branch.
license: MIT
---

# Grill Me

Use this skill for every product or implementation decision made by AI, as well as when the user asks to stress-test a plan or design. Do not silently make an AI decision on the user's behalf.

1. Ask what plan/design to stress-test if it is not already clear.
2. Identify top-level decision branches.
3. Resolve branches sequentially.
4. Give a concrete recommendation and meaningful trade-off before every product or implementation question.
5. Explore the codebase to answer questions that evidence can resolve.
6. Continue until every material branch is resolved and recorded.

Rules:

- Ask one question per turn.
- Do not accept vague answers; follow up until the answer is concrete.
- Surface trade-offs explicitly.
- Never ask a product or implementation question without a concrete recommendation and its meaningful trade-off.
- Format every question in this exact order: **Recommendation**, **Why**, **Trade-off**, then **Decision needed**. Never put the question first or embed the preferred option only in prose.
- For every AI-originated product or implementation suggestion or decision, lead with a concrete recommendation, its meaningful trade-off, and the evidence or assumption behind it—even when no question is required.
- Do not present choices without explicitly stating which option is recommended and why.
- Use repository evidence to resolve questions that do not require a user decision.
```

### `implement-approved-task/SKILL.md`

```md
---
name: implement-approved-task
description: Implement one approved project task with small diffs and recorded verification.
---

# Implement an Approved Task

1. Confirm the task belongs to an approved plan and restate goal, boundaries, contracts, risks, and success checks.
2. Make only the minimum change required. Do not add speculative abstractions, providers, or configuration.
3. Keep deterministic business rules in provider-independent domain code and provider/model details behind API or AI boundaries.
4. Add or update focused tests with the behavior change.
5. Run the plan's checks and record files, contract changes, results, and unresolved risks with the task-result template.
6. Stop and request a plan update if new required work is outside approved scope.
```

### `karpathy-guidelines/SKILL.md`

```md
---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes.
license: MIT
---

# Karpathy Guidelines

These guidelines prioritize caution and verifiability over speed.

## Think before coding

- State assumptions. Do not silently choose between material interpretations.
- Surface confusion, trade-offs, and simpler alternatives.
- Ask when the uncertainty affects scope or safety.

## Simplicity first

- Write the minimum code solving the requested problem.
- Add no unrelated features, abstractions, configuration, or impossible-scenario handling.
- If a change is much larger than necessary, simplify it.

## Surgical changes

- Touch only files/lines required by the request.
- Do not refactor adjacent code or remove pre-existing dead code unless asked.
- Preserve existing project patterns.
- Remove only imports/variables made unused by your own change.

## Goal-driven execution

- Turn requests into observable acceptance checks.
- Add a reproduction test for bugs and make it pass.
- For multi-step work, state each step and its verification.
- Do not stop at “implemented”; stop at verified success.
```

### `plan-feature/SKILL.md`

```md
---
name: plan-feature
description: Produce an approval-ready, evidence-based feature plan.
---

# Plan a Feature

Use before implementing a feature or integration.

1. Read `AGENTS.md`, relevant product/architecture docs, implementation status, and adjacent plans.
2. Separate facts, assumptions, and open questions. Do not invent rules.
3. Decompose into small, user-meaningful, independently reviewable and reversible features with testable acceptance criteria.
4. Identify affected web, API, domain, AI, data, authorization, and provider boundaries. Update contracts first where necessary.
5. Build the dependency matrix before ordering work. Mark parallel work only when it shares no contract, migration, or code ownership.
6. Order tasks by prerequisite.
7. Run `grill-me`, resolving one decision at a time, before seeking approval.
8. For AI work specify versioned schema, deterministic processing, fallback, privacy, cost, and evaluation cases.
9. Write the plan with `docs/templates/feature-plan.md` and wait for approval.

Plans are executable commitments: include files/contracts, acceptance criteria, dependency matrix, completed grill record, implementation order, verification, risks, and rollback.
```

### `secret-safety/SKILL.md`

```md
---
name: secret-safety
description: Prevent credentials and sensitive tokens from being committed, logged, or pushed.
license: MIT
---

# Secret Safety

Use before commits, pushes, pull requests, and configuration/example/log/credential changes.

## Rules

- Never commit credentials, API keys, tokens, cookies, certificates, keystores, or populated environment files.
- Keep secrets in local untracked environment files or an approved secret manager.
- Commit only clearly non-secret placeholder examples.
- Never paste secrets into prompts, plans, logs, documentation, commit messages, or PR descriptions.
- If a secret is committed/shared, treat it as compromised: revoke/rotate it and use an approved remediation process.

## Checks

Run a repository secret scanner before commit/push when available, for example:

```bash
scripts/check-secrets .
```

The scanner is only a guardrail; inspect diffs manually too.
```

### `supabase/SKILL.md`

```md
---
name: supabase
description: Use for any Supabase Database, Auth, RLS, Storage, Edge Function, migration, client-library, or security task.
metadata:
  author: supabase
  version: "0.1.2"
---

# Supabase

## Required first steps

1. Fetch the current Supabase changelog and check relevant breaking changes.
2. Read current official documentation for the specific product/API before implementation.
3. Verify every implemented database/auth fix with a query or authorized flow; do not rely on code inspection alone.
4. After two or three failed approaches, stop retrying blindly and inspect errors/logs/assumptions.

## Data API and RLS

- Data API exposure and RLS are separate. When a SQL-created table is inaccessible, verify both exposure/grants and RLS.
- Enable RLS on every table in exposed schemas. Policies must match real ownership/membership; `TO authenticated` alone is not authorization.
- `UPDATE` requires a usable `SELECT` policy and both `USING` and `WITH CHECK` where ownership must not change.
- Do not use editable `user_metadata` claims for authorization. Use server-controlled app metadata or relational authorization data.
- Views can bypass RLS; use `security_invoker` where supported or restrict access explicitly.

## Keys and privileged functions

- Never expose service-role/secret keys in browser code. `NEXT_PUBLIC_*` values are public in Next.js.
- Do not use `SECURITY DEFINER` merely to bypass an authorization problem. If it is genuinely required, use explicit search path, caller checks, minimal grants, and revoke public execution.

## CLI and migration rules

- Discover Supabase CLI commands with `--help`; do not guess flags.
- Choose declarative versus imperative schema workflow first.
- For imperative migrations, iterate with SQL/MCP in a safe environment, then create/review a clean migration.
- Run advisors for schema/security-sensitive changes when available.
- Apply migrations with a tracked, idempotent runner and verify function/policy/schema state afterward.
- Before changing save/delete flows, inspect foreign keys and cascade behavior.

## Auth/security reminders

- Deleting a user does not automatically invalidate already issued access tokens; revoke sessions when required.
- JWT authorization claims can be stale until token refresh.
- Storage upsert needs the appropriate insert/select/update policies.
- Pin dependencies and commit lockfiles.
```

### `supabase-postgres-best-practices/SKILL.md`

```md
---
name: supabase-postgres-best-practices
description: Postgres performance and safety practices for Supabase/Postgres queries, schema, RLS, and configuration.
license: MIT
---

# Supabase Postgres Best Practices

Apply when writing/reviewing SQL, indexes, schema, RLS, connection behavior, or database performance.

Priority order:

1. Query performance: use indexes that match filters/joins/order, avoid N+1 queries, inspect query plans, and use pagination.
2. Connection management: use an appropriate pooler, avoid exhausting connections, and keep transactions short.
3. Security/RLS: index policy predicates, avoid repeated expensive auth subqueries, grant least privilege, and verify policies with real roles.
4. Schema design: use appropriate data types, primary keys, constraints, foreign-key indexes, and lowercase identifiers.
5. Locking/concurrency: avoid long transactions, prevent deadlocks through consistent order, use advisory locks/`SKIP LOCKED` only when justified.
6. Data access: batch inserts/updates and use explicit upsert behavior.
7. Monitoring: use `EXPLAIN (ANALYZE, BUFFERS)`, `pg_stat_statements`, and vacuum/analyze evidence when diagnosing performance.
8. Advanced features: add full-text/JSONB indexes and partitioning only after a measured need.

For a fuller optional reference pack, consult current PostgreSQL and Supabase documentation rather than copying stale optimization examples into product code.
```

### `tdd/SKILL.md`

```md
---
name: tdd
description: Use a test-driven workflow for implementation tasks. Write or update a failing test first, implement the smallest change to pass, then verify and refactor.
license: MIT
---

# TDD

Use this skill when the user asks for TDD, test-first development, bug fixes with regression tests, or implementation where behavior should be proven by tests.

## Workflow

1. Identify the smallest observable behavior change.
2. Find the closest existing test file, fixture style, and assertion pattern.
3. Write or update a focused test before changing production code.
4. Run the narrowest relevant test command and confirm the test fails for the expected reason.
5. Implement the smallest production change needed to pass.
6. Re-run the focused test.
7. Run the nearest broader relevant test set when the change touches shared behavior, contracts, event payloads, or public APIs.
8. Refactor only after tests pass, then re-run the focused test.

## Component Commands

Prefer component-local instructions when present. Otherwise use the verification matrix from `AGENTS.md`.

For focused tests, use the component's existing test-runner syntax for a single file, module, class, or test case.

## Constraints

- Do not make broad refactors before the red/green loop is complete.
- Do not add new test frameworks or dependencies unless the component already uses them and the change requires it.
- Do not add large test scaffolding when an existing test style can cover the behavior.
- Do not skip the failing-test step unless tests cannot run locally or the change is documentation/configuration only.
- If the failing-test step is skipped, explain why before editing production code.
- Keep tests focused on observable behavior, not private implementation details.
- For bug fixes, the first test should fail on the original bug.
- For new behavior, the first test should encode the expected contract or user-visible behavior.

## Reporting

In the final response, include:

- The test added or changed.
- The initial failing command and failure summary, if run.
- The passing verification command.
- Any broader tests that were skipped and why.
```

## 15. First-day bootstrap checklist

Use this sequence in a new project:

1. Initialize repository, package manager, and basic app health endpoint/page.
2. Copy `.agents/skills` and create `AGENTS.md`.
3. Create `docs/product`, `docs/architecture`, `docs/plans`, and `docs/templates`.
4. Write `vision.md`, a draft MVP roadmap, architecture principles, and an empty implementation-status ledger.
5. Create the first plan: mandatory infrastructure. Include an MVP dependency matrix.
6. Run `grill-me`, resolve decisions, and get approval.
7. Implement the foundation one task at a time, recording each task result.
8. Add auth/database/provider integrations only through separately approved plans with security, cost, and privacy boundaries.
9. Keep `current-feature-state.md` accurate from the first customer-visible capability onward.
10. Before the first commit, run quality checks and the secret-safety review.

## 16. Framework completion test

The framework is ready when a new agent can answer all of these by reading repository files alone:

- What product problem and MVP boundary are approved?
- What is implemented today, and what is explicitly deferred?
- What task is next, why is it next, and what blocks it?
- What plan and approval govern the work?
- What contracts/data/providers are affected?
- What checks have actually passed?
- Where are secrets allowed to live?
- How can a contributor safely run migrations, tests, builds, and deployments?

If any answer requires reconstructing chat history, add or update the relevant document before continuing.
