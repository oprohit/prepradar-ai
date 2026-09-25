# Directive: Mobile Feature

## Objective

Implement touch-optimized mobile behavior and required device capabilities with explicit permission, offline, and recovery states.

## When to Use

- Building Android/iOS screens, device permission flows, or hardware integrations.

## Inputs

- Mobile journey, device capabilities, permission rationale, backend contract, and acceptance criteria.

## Preconditions

- The chosen mobile stack and target emulator/device path are known.
- Shared contracts/backend endpoints exist when the feature syncs data.

## Required Tools & MCPs

- **Primary:** Workspace editor, selected mobile toolchain, emulator/device.
- **Preferred MCPs:** Context7 only for current SDK guidance.
- **Fallback:** Local Expo/web preview for UI logic; simulator only when clearly identified.

## Ordered Execution Steps

1. Audit required permissions, privacy impact, and denied/offline behavior.
2. Implement native primitives, touch targets, safe-area handling, and accessible labels.
3. Add hardware integration with a clear rationale before each permission request.
4. Connect to the shared backend with validated responses and truthful errors.
5. Test on emulator/device and exercise denial/offline states.

## Validation Steps

1. Verify visual layout, navigation, and safe-area behavior.
2. Verify permission granted, denied, and unavailable paths.
3. Verify network loss and recovery without data-loss claims.

## Failure Handling

- **Permission denied:** explain the limitation and provide the next safe action.
- **Device service unavailable:** keep the rest of the experience usable where possible.
- **SDK/build failure:** inspect the exact error and use a supported alternative rather than a speculative polyfill.

## Security & Cost Constraints

- Use secure platform storage for session secrets; never hardcode credentials.
- Use configured services only when relevant; do not change billing/plan settings on the user’s behalf.

## Outputs

- Mobile screen, permission behavior, integration path, and device/emulator evidence.

## Definition of Done

- The screen works in the selected preview/device environment and handles denied, offline, and error states honestly.
