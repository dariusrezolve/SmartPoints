---
name: plan-feature
description: Produce an approval-ready, evidence-based feature plan.
---

# Plan a Feature

Use before implementing a feature or integration.

1. Read `AGENTS.md`, relevant product and architecture docs, implementation status, and adjacent plans.
2. Separate facts, assumptions, and open questions. Do not invent rules.
3. Decompose into small, user-meaningful, independently reviewable and reversible features with testable acceptance criteria.
4. Identify affected web, API, domain, AI, data, authorization, and provider boundaries. Update contracts first where necessary.
5. Build the dependency matrix before ordering work. Mark parallel work only when it shares no contract, migration, or code ownership.
6. Order tasks by prerequisite.
7. Run `grill-me`, resolving one decision at a time, before seeking approval.
8. For AI work specify versioned schema, deterministic processing, fallback, privacy, cost, and evaluation cases.
9. Write the plan with `docs/templates/feature-plan.md` and wait for approval.

Plans are executable commitments: include files/contracts, acceptance criteria, dependency matrix, completed grill record, implementation order, verification, risks, and rollback.
