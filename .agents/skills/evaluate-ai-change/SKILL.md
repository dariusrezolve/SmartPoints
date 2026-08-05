---
name: evaluate-ai-change
description: Define and run safe, repeatable evaluation for an AI capability.
---

# Evaluate an AI Change

Use this skill whenever model behavior, a prompt, an AI schema, or a provider adapter changes.

1. Define the user outcome and a schema-valid success condition.
2. Add representative, non-sensitive fixtures to `packages/ai/evals/` or the equivalent project location.
3. Test valid output, malformed output, missing information, conflicting constraints, and provider/model failure.
4. Verify deterministic constraints are enforced outside the model.
5. Record prompt/model/schema versions and evaluation results in the feature plan or task result.
6. Never commit production user data or personal data in fixtures.
