# Directive: Debugging & Diagnostics (`directives/debugging.md`)

## Objective
Systematically identify root causes, eliminate regressions, and restore system health without guesswork.

## When to Use
- Build errors, runtime uncaught exceptions, broken UI components, network 4xx/5xx responses, or failing tests.

## Inputs
- Error stack trace, failing test assertion, or unexpected behavior description.

## Preconditions
- Ability to reproduce the failure consistently.

## Required Tools & MCPs
- **Relevant Skills**: [webapp-testing](file:///c:/AGTest/.agents/skills/webapp-testing/SKILL.md), [debugging-and-error-recovery](file:///c:/AGTest/.agents/skills/debugging-and-error-recovery/SKILL.md).
- **Primary Tool**: Workspace file inspection and command execution tools.
- **Preferred MCPs**: `chrome-devtools` (DOM, console, network inspection), `playwright` (reproduction script).
- **Fallback Tools**: Local application logs, node debug flags.

## Ordered Execution Steps
1. **Reproduce**: Capture exact reproduction steps and error stack trace.
2. **Localize**: Trace stack trace to the exact file and line number.
3. **Hypothesize & Verify**: Formulate a hypothesis, inspect state variables, and confirm the root cause before editing.
4. **Surgical Fix**: Apply the smallest necessary fix that eliminates the failure.
5. **Regression Verification**: Re-test the exact reproduction path; verify adjacent features still pass.

## Validation Steps
1. Verify the error condition no longer occurs.
2. Verify browser console is clear of secondary warnings.
3. Run project build check (`execution/verify-build.mjs`).

## Failure Handling
- **Non-Reproducible Flake**: Check for race conditions, unhandled async promises, or network timeouts.
- **Cascading Errors**: Stop at the first root failure, preserve the working tree, and re-diagnose. Revert or discard changes only with explicit user approval.

## Security & Cost Constraints
- Never print decrypted secrets, session tokens, or API keys in debug logs.
- Do not make paid API calls during automated debug loops.

## Outputs
- Surgical code edit and verified resolution log.

## Definition of Done
- Original bug is fully resolved.
- Zero new console errors or test regressions introduced.
