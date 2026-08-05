---
name: grill-me
description: Interview the user about a plan or design until reaching shared understanding and resolving each decision branch.
license: MIT
---

# Grill Me

Use this skill for every product or implementation decision made by AI, as well as when the user asks to stress-test a plan or design. Do not silently make an AI decision on the user's behalf.

1. Ask what plan or design to stress-test if it is not already clear.
2. Identify top-level decision branches.
3. Resolve branches sequentially.
4. Give a concrete recommendation and meaningful trade-off before every product or implementation question.
5. Explore the codebase to answer questions that evidence can resolve.
6. Continue until every material branch is resolved and recorded.

## Rules

- Ask one question per turn.
- Do not accept vague answers; follow up until the answer is concrete.
- Surface trade-offs explicitly.
- Never ask a product or implementation question without a concrete recommendation and its meaningful trade-off.
- Format every question in this exact order: **Recommendation**, **Why**, **Trade-off**, then **Decision needed**. Never put the question first or embed the preferred option only in prose.
- For every AI-originated product or implementation suggestion or decision, lead with a concrete recommendation, its meaningful trade-off, and the evidence or assumption behind it—even when no question is required.
- Do not present choices without explicitly stating which option is recommended and why.
- Use repository evidence to resolve questions that do not require a user decision.
