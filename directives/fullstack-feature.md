# Directive: Full-Stack Feature

## Objective

Deliver one end-to-end vertical slice across UI, validated backend behavior, authorization, and persistence.

## When to Use

- A user journey needs client-server communication, authentication, realtime behavior, or stored data.

## Inputs

- User journey, API contract, data model, authorization rule, and acceptance criteria.

## Preconditions

- The platform and selected backend are known.
- Any relevant configured API is checked only when needed with the targeted readiness checker.

## Required Tools & MCPs

- **Primary:** Workspace editor, existing application tools, and local terminal.
- **Preferred MCPs:** Context7 for current docs; Postman only for complex API work; DevTools/Playwright for runtime proof.
- **Fallback:** Native `fetch`/`curl`, focused tests, and local development persistence.

## Ordered Execution Steps

1. Define shared types and validation schemas before handlers and clients diverge.
2. Implement the server boundary: validate input, authenticate, authorize the requested resource, and return safe errors.
3. Implement parameterized database access and idempotency where a write may be retried.
4. Build the UI state for loading, empty, error, success, and recovery.
5. Exercise the complete path in the browser or relevant client runtime.

## Validation Steps

1. Test valid input, invalid input, unauthenticated access, unauthorized access, and the relevant write/read path.
2. Verify persistence across reload or a direct follow-up read.
3. Verify the browser journey, console, and network behavior.

## Failure Handling

- **Database/service unavailable:** return a truthful recovery state. Do not replace a failed real write with mock success.
- **API timeout:** retry once only when safe and idempotent; otherwise show actionable recovery.
- **Demo/test mode:** use clearly marked deterministic fixtures only when no real write is represented as complete.

## Security & Cost Constraints

- Never expose database service-role keys or other secrets to a client.
- Use the selected configured backend normally, but stop its calls on quota, billing, auth, or repeated-timeout signals and follow the documented local/degraded path.
- Never enable billing or paid upgrades on the user's behalf.

## Outputs

- A vertical slice with shared contract, secured backend boundary, persistence behavior, UI states, and evidence.

## Definition of Done

- The intended user action completes end-to-end, errors are truthful, and protected data/actions are verified as protected.
