# Directive: API Integration

## Objective

Integrate only the API required by the user journey, use configured credentials normally, and degrade honestly when that service cannot respond.

## When to Use

- Connecting an application to an AI model, database service, mapping, notification, or partner API.

## Inputs

- Official API documentation, selected endpoint, input/output schema, and the user-visible fallback.

## Preconditions

- Credentials exist in ignored environment configuration; never hardcode or print them.
- Run `node execution/check-apis.mjs --live --service <service>` only for the service being integrated when a targeted readiness probe is needed.

## Required Tools & MCPs

- **Primary:** Workspace editor, local terminal, and the configured API client/SDK.
- **Preferred MCPs:** Use the matching MCP only when it materially helps the selected task.
- **Fallback:** Native `fetch`, local fixtures, or a local implementation appropriate to the feature.

## Ordered Execution Steps

1. Define and validate the request and response contract at the boundary.
2. Implement a client wrapper with operation-appropriate timeout, cancellation, and sanitized errors.
3. Use one bounded retry only for an idempotent transient failure; never retry authentication, permission, validation, quota, or non-idempotent writes.
4. Validate provider output before rendering, persisting, or passing it to another tool.
5. Use deterministic fallback data only in explicit demo/test mode. Never use it to claim that an API, authentication flow, write, payment, or transaction succeeded.

## Validation Steps

1. Test the intended request, failure response, and timeout path.
2. Confirm quota, rate-limit, billing-required, and authentication errors stop use of that service.
3. Confirm no credential or raw provider error reaches logs or the client bundle.

## Failure Handling

- **429 / quota exhausted / billing required:** stop calling the provider and select the documented fallback.
- **401 / 403:** do not retry; report a safe configuration error to the developer and a generic recovery state to users.
- **Timeout / unavailable:** use one retry only if safe, then surface recovery or an explicit demo/test fallback.

## Security & Cost Constraints

- Existing configured APIs may be used when relevant to the task.
- Never enable billing, upgrades, auto-recharge, or a paid trial on the user's behalf.
- Never send keys in URLs, logs, browser bundles, or command-line arguments.

## Outputs

- A validated client wrapper, documented fallback behavior, and verification evidence.

## Definition of Done

- The API path works when available and fails safely, truthfully, and visibly when it is not.
