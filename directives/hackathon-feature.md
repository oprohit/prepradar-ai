# Directive: Hackathon Feature

## Objective

Implement the smallest high-impact, rubric-aligned vertical slice that makes the product’s value visible in a reliable demo.

## When to Use

- Building a primary journey or judge-facing capability during the hackathon.

## Inputs

- Filled portions of `HACKATHON_BRIEF.md`, primary journey, acceptance criteria, and demo narrative.

## Preconditions

- Platform classification is known.
- The feature maps to an explicit requirement or is clearly identified as a product assumption.

## Required Tools & MCPs

- **Primary:** Existing application stack, local runners, and workspace editor.
- **Preferred MCPs:** Relevant configured design, AI, documentation, or browser capability only when it advances the selected slice.
- **Fallback:** Direct implementation and clearly marked demo/test fixtures.

## Ordered Execution Steps

1. Map the feature to a brief requirement and define the smallest trigger → result path.
2. Prove the riskiest integration early (AI, realtime, database, or hardware) before visual polish.
3. Build the user-facing states and a visible, truthful outcome.
4. Add an AI/API circuit breaker and recovery behavior where an external service is critical.
5. Add deterministic local demo data only through `node execution/seed-demo.mjs --demo` when it helps the demo.

## Validation Steps

1. Run the feature end-to-end in the actual client runtime.
2. Verify the success, invalid/error, and provider-unavailable paths.
3. Verify any visible metric or claim is sourced, measured, or clearly labeled as demo/test data.

## Failure Handling

- **Scope pressure:** protect the primary path; cut secondary work rather than faking completeness.
- **AI/API limit or failure:** stop that provider, show the recovery state, or use explicit demo/test data without representing it as live output.

## Security & Cost Constraints

- Use relevant configured services when they help the vertical slice; do not enable billing, upgrades, or auto-recharge.
- Keep presentation claims synchronized with verified behavior.

## Outputs

- Working vertical slice, verification evidence, and optional marked demo fixture.

## Definition of Done

- The intended outcome is reachable quickly, works in the real runtime, and every demo claim is truthful.
