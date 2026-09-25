# Directive: Deployment

## Objective

Deploy the verified application through one selected provider and prove that the public application, not merely its root endpoint, works.

## When to Use

- Deploying a preview, demo, or production release.

## Inputs

- Selected provider, public HTTPS URL, build command, and critical user journey.

## Preconditions

- `node execution/verify-project.mjs` passes with a clean worktree.
- `node execution/verify-build.mjs` passes after an application manifest and build script exist.
- The user has selected a provider already configured for their account.

## Required Tools & MCPs

- **Primary:** The selected provider’s official CLI or existing MCP.
- **Preferred MCP:** Only the selected provider’s MCP when it materially improves deployment or diagnostics.
- **Fallback:** Local preview; GitHub Pages only for a static application.

## Ordered Execution Steps

1. Run project and build verification; stop on failure or skipped checks.
2. Deploy through the one selected provider without enabling upgrades, paid add-ons, or auto-recharge.
3. Monitor real progress with bounded polling and activity evidence.
4. Run `node execution/verify-deployment.mjs <public-https-url>`.
5. Verify the critical user journey, console, and network in a browser on the public URL.

## Validation Steps

1. Confirm the URL returns 2xx over HTTPS.
2. Run the critical user journey in a clean browser session.
3. Inspect console errors, failed network requests, and user-visible recovery paths.

## Failure Handling

- **Build/deploy failure:** inspect provider logs and fix locally; never claim deployment succeeded.
- **Quota, billing, or plan limit:** stop using that provider and move to the documented local/static fallback.
- **Unavailable URL:** keep the release blocked until a real public URL or explicit local-demo plan is verified.

## Security & Cost Constraints

- Use existing account configuration only; never alter billing settings on the user’s behalf.
- Scope production secrets in the provider dashboard and do not place them in repository files or command arguments.

## Outputs

- Verified public HTTPS URL, selected-provider record, and browser evidence for the critical path.

## Definition of Done

- The public application and critical path are verified; skipped checks are not treated as success.
