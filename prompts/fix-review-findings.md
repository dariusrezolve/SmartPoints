# Fix Review Findings

Apply actionable findings from `prompts/review-change.md`.

1. Use the latest review output; stop if there are no actionable findings or the finding is ambiguous/conflicting.
2. Address correctness, security, contracts, tests, then maintainability in that order.
3. Keep each fix scoped; do not refactor unrelated code.
4. Use TDD for behavior changes and update affected contracts/docs.
5. Run the relevant checks from `AGENTS.md` and report anything intentionally deferred.
6. Use `secret-safety` for config, logs, environment, or credential-adjacent changes.
