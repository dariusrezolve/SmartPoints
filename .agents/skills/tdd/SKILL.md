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

Prefer component-local instructions when present. Otherwise use the verification matrix from `AGENTS.md`:

- SmartPoints: `npm test`

For focused tests, use Vitest’s existing single-file or test-name syntax.

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
