---
name: approval-gated-task-execution
description: Execute planned implementation tasks sequentially with per-task approval, critique, scoped sub-agents, handoff bundles, and a final integration gate.
license: MIT
---

# Approval-Gated Task Execution

Use this skill when implementing an approved component plan.

1. Build an execution matrix from the approved plan: task, affected component, dependencies, files/contracts, and verification checks.
2. Execute tasks sequentially in approved plan order.
3. Before each task, summarize its goal, affected component, key files/contracts, risks, checks, and rollback.
4. Apply `karpathy-guidelines` to check for overcomplication, scope creep, and missing success criteria.
5. Run a quick rubber-duck critique. If it finds a likely flaw, revise the task summary and get approval again.
6. After approval, use a component-scoped sub-agent only when useful; do not grant it broader file access than needed.
7. After each task, capture files changed, contract changes, checks, and unresolved risks in a compact result bundle.
8. Use result bundles as the handoff to subsequent tasks. After all tasks, run a cross-component integration gate.

## Rules

- Follow the approved plan; do not reorder or expand scope without updating and re-approving it.
- Implement every approved planned item. Do not silently leave items partial.
- Stop for a plan update when new required work is out of scope.
- Keep fixing failed checks within the task unless genuinely blocked.
- Make only needed changes, preserve project patterns, add no unrelated dependencies, and do not edit out-of-scope folders.
