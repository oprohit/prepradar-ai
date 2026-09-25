# Directive: MCP Integration

## Objective

Design, test, and register a custom MCP server only when its capability is necessary and not already available through local tools or an existing MCP.

## When to Use

- Creating, modifying, or debugging a local MCP server for a selected service or device.

## Inputs

- Service contract, intended tools, parameter schemas, authentication boundaries, and local configuration location.

## Preconditions

- Confirm the capability is not redundant and that its provider/package is suitable for the user’s account and task.
- Read the `mcp-builder` skill and inspect existing MCP configuration without printing credential values.

## Required Tools & MCPs

- **Primary:** Workspace editor, Node.js or Python, and a local stdio test client.
- **Preferred MCPs:** None are required to build an MCP server.
- **Fallback:** A direct CLI or local REST adapter when MCP adds no material value.

## Ordered Execution Steps

1. Define strict input and output schemas, permissions, timeouts, and errors before implementation.
2. Implement local stdio transport with validation at every tool boundary.
3. Test `tools/list`, valid calls, invalid input, timeout, and permission failure locally.
4. Register the server only in the user-approved configuration location, with credentials supplied through protected environment configuration rather than command-line arguments.
5. Document the intended task trigger, fallback, and verification command.

## Validation Steps

1. Start the server and verify `tools/list` succeeds.
2. Verify valid, boundary, invalid, and unavailable-service responses are structured and safe.
3. Confirm no secrets appear in source, stdout, command arguments, or Git.

## Failure Handling

- **Startup failure:** inspect local stderr; do not claim the MCP is configured or available.
- **Invalid input:** return a structured validation error without calling the backing service.
- **Auth, quota, or billing failure:** stop calls to that provider and use the documented CLI/local fallback.
- **Registration uncertainty:** leave existing configuration unchanged and report the blocker.

## Security & Cost Constraints

- Never hardcode keys or pass them by CLI argument.
- Do not enable billing, upgrades, auto-recharge, or paid hosting on the user’s behalf.
- A configured MCP is not permission to invoke it; use the smallest relevant capability.

## Outputs

- Tested local MCP server, registration instructions, and an explicit fallback path.

## Definition of Done

- The server is locally testable, validates every tool input, and fails truthfully without exposing credentials.
