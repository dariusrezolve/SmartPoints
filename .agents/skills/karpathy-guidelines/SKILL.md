---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes.
license: MIT
---

# Karpathy Guidelines

These guidelines prioritize caution and verifiability over speed.

## Think before coding

- State assumptions. Do not silently choose between material interpretations.
- Surface confusion, trade-offs, and simpler alternatives.
- Ask when uncertainty affects scope or safety.

## Simplicity first

- Write the minimum code solving the requested problem.
- Add no unrelated features, abstractions, configuration, or impossible-scenario handling.
- If a change is much larger than necessary, simplify it.

## Surgical changes

- Touch only files and lines required by the request.
- Do not refactor adjacent code or remove pre-existing dead code unless asked.
- Preserve existing project patterns.
- Remove only imports or variables made unused by your own change.

## Goal-driven execution

- Turn requests into observable acceptance checks.
- Add a reproduction test for bugs and make it pass.
- For multi-step work, state each step and its verification.
- Do not stop at “implemented”; stop at verified success.
