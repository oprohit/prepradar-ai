# Directive: Frontend Feature

## Objective

Build accessible, responsive user interface that advances the primary journey and behaves correctly at runtime.

## When to Use

- Adding or modifying screens, dashboards, forms, navigation, or visual components.

## Inputs

- UI requirement, existing component patterns, optional supplied design source, and acceptance criteria.

## Preconditions

- Target framework/styling system and local development command are known.

## Required Tools & MCPs

- **Primary:** Workspace editor and the existing component system.
- **Preferred MCPs:** Figma only for supplied Figma input; v0 only when it materially helps; DevTools/Playwright for runtime validation.
- **Fallback:** Direct semantic implementation with existing CSS/components.

## Ordered Execution Steps

1. Inspect existing components, tokens, and an analogous UI pattern.
2. Use a design MCP only when a relevant source exists; otherwise implement directly.
3. Build semantic, keyboard-accessible, responsive UI with clear states.
4. Integrate state and actions without exposing API details or secrets.
5. Test the actual user journey at desktop and mobile widths.

## Validation Steps

1. Verify populated, loading, empty, error, and recovery states.
2. Verify keyboard flow, basic labels/semantics, and responsive layout.
3. Verify zero console errors and no unexpected failed requests.

## Failure Handling

- **Figma/v0 unavailable or limited:** stop using it and implement directly.
- **Render failure:** reproduce, inspect console/state, make a focused fix, and re-test.

## Security & Cost Constraints

- A configured design service may be used when relevant; do not enable billing or upgrades.
- Never put API keys or privileged data into client code.

## Outputs

- Integrated, responsive component/page with runtime verification evidence.

## Definition of Done

- The feature is accessible and responsive, shows truthful states, and works in the actual browser runtime.
