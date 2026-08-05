# Fix Pull Request Comments

For the current SmartPoints pull request, collect unresolved in-scope review feedback, implement concrete fixes, verify them, and prepare a factual handoff.

Before any external change, inspect branch/remotes/auth and use `secret-safety`. Stop if the worktree is dirty with unrelated changes, the target PR cannot be determined, comments conflict, or a comment requires a product decision.

Prioritize functional defects, contract/RLS issues, missing tests, maintainability, then style. Apply minimal changes, run focused plus relevant broader checks, and update plan/status documentation when contracts change.

Do not commit, push, post PR comments, or request reviews unless the user explicitly authorizes that external action.
