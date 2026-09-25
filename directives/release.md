# Directive: Release

## Objective

Prepare a truthful, reproducible hackathon submission with a clean repository, verified runtime, and synchronized presentation.

## When to Use

- Preparing final submission or a formal demo handoff.

## Inputs

- Public deployment URL, final demo sequence, repository state, and presentation assets.

## Preconditions

- Primary user journey has runtime evidence.
- A deployment exists if a public URL is claimed.

## Required Tools & MCPs

- **Primary:** Git CLI and execution verification scripts.
- **Preferred MCPs:** Only the selected deployment/hosting provider or GitHub when the task requires it.
- **Fallback:** Local Git checks and verified local demo only when clearly presented as local.

## Ordered Execution Steps

1. Run `node execution/verify-project.mjs`; resolve every failure and leave the tree clean.
2. Run `node execution/verify-build.mjs`; skipped is not release-ready.
3. Verify a claimed public URL with `node execution/verify-deployment.mjs <public-https-url>`.
4. Run the critical journey in a clean browser session and inspect console/network.
5. Synchronize README, slides, demo script, and claims with the evidence actually collected.

## Validation Steps

1. Verify the protected baseline tag still resolves.
2. Verify no sensitive paths or high-confidence credential signatures are tracked/staged.
3. Verify the release/demo path twice from a clean state.

## Failure Handling

- **Verification failure:** do not release or claim readiness until it is resolved or explicitly scoped out.
- **Hosting failure/limit:** stop using that provider and present only a verified fallback environment.
- **Late defect:** fix only the highest-impact defect that can be verified; never hide it behind a false claim.

## Security & Cost Constraints

- Never commit credentials or activate billing/upgrades on the user’s behalf.
- Use only one selected deployment provider for a deployment attempt.

## Outputs

- Clean verified repository, confirmed runtime/deployment evidence, final demo script, and synchronized submission assets.

## Definition of Done

- The claimed environment is verified, the primary journey is rehearsed, and all published claims match working software.
