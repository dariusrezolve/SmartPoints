# Review SmartPoints Change

Review the current SmartPoints change set before merge or handoff.

Focus on:

- User-visible correctness and regressions
- Product-plan and dependency alignment
- Next.js/server-action contracts and validation
- Supabase migrations, RLS, ownership, and RPC safety
- Point-ledger correctness, undo behavior, and reset semantics
- Accessibility, responsive UI behavior, and keyboard interaction
- Secrets in source, logs, fixtures, examples, or generated files
- Missing or weak tests and unrun verification

Return findings first:

```md
## Findings

- Severity: critical|high|medium|low
  File: `path:line`
  Issue: specific problem
  Recommendation: scoped fix

## Open questions

- question or None

## Checks

- `command`: result or not run

## Summary

brief outcome and remaining risk
```

Do not report accepted MVP deferrals as defects. If findings require edits, run `prompts/fix-review-findings.md` next.
