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
- If a secret is committed or shared, treat it as compromised: revoke or rotate it and use an approved remediation process.

## Checks

Run a repository secret scanner before commit or push when available, for example `scripts/check-secrets .`. The scanner is only a guardrail; inspect diffs manually too.
