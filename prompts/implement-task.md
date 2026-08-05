# Implement Approved Plan

Implement approved SmartPoints plan tasks in dependency order.

1. Read `AGENTS.md`, implementation status, the approved plan, relevant contracts, and existing tests.
2. Confirm the task is dependency-ready and within approval scope. Stop for a new product or implementation decision and use `grill-me`.
3. Use `approval-gated-task-execution` for multi-task work and `implement-approved-task` for one scoped task.
4. Use `tdd` for behavior changes: write/run a focused failing test, make the smallest passing change, then run broader relevant checks.
5. Apply `supabase` and `supabase-postgres-best-practices` for Supabase work; use tracked, idempotent migrations and verify applied state.
6. Update contracts and `docs/plans/IMPLEMENTATION-STATUS.md`; write task-result evidence for material work.

Never push, deploy, delete data, create paid services, or transmit user data without explicit user authorization. Run `secret-safety` before secret-adjacent work, commits, or pushes.
