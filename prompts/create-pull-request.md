# Create Pull Request

Create a SmartPoints pull request only after explicit user authorization.

Before creating it:

1. Inspect status, current branch, remote, GitHub CLI availability/authentication, and commits ahead of the target branch.
2. Stop if the branch is the target branch, unrelated work is uncommitted, there are no relevant commits, or secret scanning reports a concern.
3. Run `secret-safety`, review the full diff with `prompts/review-change.md`, and run the applicable checks from `AGENTS.md`.
4. Rebase only with explicit authorization; stop on conflicts.
5. Use a factual title and body covering summary, user-visible impact, contracts/migrations, verification, and remaining risks.
6. Push and create the PR only after the user confirms the exact branch/target and external action.

Final response: PR URL, source/target, verification, review summary, and remaining risk.
