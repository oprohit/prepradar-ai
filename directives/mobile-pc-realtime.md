# Directive: Mobile + PC Realtime

## Objective

Deliver authorized, bidirectional synchronization between a mobile client and a PC/web client through one shared backend and contract.

## When to Use

- A feature includes mobile reporting, desktop monitoring, device pairing, live location, dispatching, or cross-device updates.

## Inputs

- Event schema, user roles, authorization model, client behaviors, and reconnect requirements.

## Preconditions

- One backend, shared types/contracts, authenticated users, and a selected realtime mechanism exist.

## Required Tools & MCPs

- **Primary:** Workspace editor, selected backend/realtime implementation, mobile emulator/device, and web browser.
- **Preferred MCPs:** Context7 for current WebSocket/realtime documentation; browser tooling for web verification.
- **Fallback:** Snapshot read plus bounded polling for noncritical synchronization.

## Ordered Execution Steps

1. Define shared event types, validation schemas, roles, and channel authorization.
2. Implement the backend channel/event flow before clients diverge.
3. Implement mobile publish/action behavior and PC subscription/render behavior.
4. Implement PC-to-mobile action/status flow.
5. Reconcile a full snapshot after reconnect and bound reconnection attempts.

## Validation Steps

1. Verify mobile → backend → PC updates with an authenticated test user.
2. Verify PC → backend → mobile updates with authorization enforced.
3. Verify disconnect, reconnect, missed-event reconciliation, and no duplicate/message storm.

## Failure Handling

- **Realtime connection failure:** use one controlled reconnect, then bounded polling/snapshot behavior where safe.
- **Authorization failure:** do not subscribe or retry blindly; show the appropriate access/recovery state.
- **State desync:** fetch and validate a full snapshot before resuming live events.

## Security & Cost Constraints

- Enforce channel authorization and tenant isolation; do not expose privileged events to clients.
- Stop the selected provider on quota, billing, auth, or repeated-timeout signals; do not alter billing settings.

## Outputs

- Shared contract, authorized event flow, two client integrations, recovery behavior, and bidirectional evidence.

## Definition of Done

- Both directions are verified on the real selected clients, authorization is enforced, and reconnect behavior is bounded and correct.
