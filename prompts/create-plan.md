# Create Feature Implementation Plan

Create an approval-ready SmartPoints feature plan.

1. Read `AGENTS.md`, product vision, current architecture, implementation status, and relevant source/contracts.
2. Identify affected user-visible behavior, data/API/RLS contracts, migrations, dependencies, acceptance criteria, and verification.
3. Run the complete `grill-me` flow before writing or updating a plan. Resolve one material branch at a time and record the decision.
4. Consider `tdd`; each behavior-changing task must specify its focused failing test and red/green verification.
5. Save the plan under `docs/plans/<feature>/plan.md`, using the repository feature-plan template.

Hard gate: do not save an implementation plan while material decisions are open. Do not assume product, provider, data-retention, or security choices.

The final response must summarize scope, contract impact, test strategy, dependencies, and the saved plan path. Do not paste the whole plan into chat.
