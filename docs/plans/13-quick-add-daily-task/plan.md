# Feature Plan: Quick-add Task Selection

## Status

Approved 2026-09-28 — tasks created from the header + join the current daily list.

## Outcome

Creating a task through the Tasks header + immediately makes it available in the selected child’s daily task list.

## Scope and acceptance criteria

- Header + task creation includes an explicit selection flag.
- The task creation action atomically adds the new task to the child’s daily selection when flagged.
- Menu-based task creation remains catalog-only.

## Dependency matrix

| ID | Feature | Depends on | Unlocks | Completion check |
| --- | --- | --- | --- | --- |
| F1 | Select quick-added task | Daily selection access contract | Release validation | New header + task appears among current daily tasks. |
