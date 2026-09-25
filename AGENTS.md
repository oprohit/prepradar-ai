# Hackathon Engineering Operating System

Read `HACKATHON_BRIEF.md` before making product decisions. Treat unspecified rules, APIs, judging criteria, deadlines, and allowed technology as unknowns—not assumptions.

## Architecture

`AGENTS.md` (global constitution)
→ `.agents/TOOL_ROUTING.md` (tool-selection policy)
→ `.agents/skills/` (specialized expertise)
→ `directives/` (repeatable procedure)
→ `execution/` (deterministic machinery)
→ MCP / CLI / API (capability)
→ runtime verification
→ reusable learning

Keep these layers separate. A configured MCP provides a capability; it does not select itself or replace a skill, directive, or verification step.

## Mission

Build one polished, reliable end-to-end journey that materially addresses the hackathon brief. Optimize for user value, meaningful AI where appropriate, reliability, visual clarity, and demoability—not feature count.

Before major implementation:

1. Classify the platform and the task.
2. Define the primary journey and acceptance criteria.
3. Read the matching directive and routing row.
4. Inspect the existing architecture and execution scripts.
5. Build the smallest verifiable vertical slice.
6. Verify it with the appropriate runtime evidence.

## Operating Rules

- Inspect before changing; read relevant files before editing them.
- Preserve existing conventions and working behavior. Avoid unrelated refactors.
- Verify unfamiliar framework and API usage against current official documentation.
- Prefer simple, explicit code over speculative abstractions.
- Do not add dependencies without a concrete need and an existing-stack check.
- Never commit or print secrets. Keep credentials in ignored protected configuration.
- Preserve `baseline-before-test`. Never change Git history or discard work without explicit user approval.
- A task is not complete because code exists. It needs proportionate tests and runtime evidence.

## Smart API and MCP Policy

Use a configured API or MCP when it is directly relevant, its credential is present, and it materially improves the requested work. Do not invoke unrelated services just because they are configured.

Before a live API integration or diagnosis, optionally run a targeted probe only for that service:

```text
node execution/check-apis.mjs --live --service <service>
```

The default checker is offline. A successful probe means only that the probe succeeded at that moment; it does not prove plan, quota, billing, performance, or suitability.

For every external service:

1. Use the relevant configured service normally.
2. On `429`, quota exhaustion, `402`, billing-required, authentication/permission failure, or a repeated timeout, stop using that service for the current task.
3. Select the routing-table fallback and communicate the real state; never fabricate success.
4. Do not enable billing, upgrades, trials, auto-recharge, or paid add-ons on the user's behalf.

Prefer local tools when they are equally effective. Installed MCP does not imply automatic use. Use one hosting provider per deployment and one browser automation path per verification pass unless diagnosis needs a second tool.

## Platform and Workflow Selection

| Task | Directive | Required proof |
|---|---|---|
| UI, dashboard, website | `frontend-feature.md` | Browser states, console/network health, responsive layout |
| Full-stack feature or authentication | `fullstack-feature.md` plus `database-change.md` when schema changes | Validated request, authorization, persistence, browser journey |
| API or AI integration | `api-integration.md` | Contract, error paths, targeted service result or fallback |
| Mobile | `mobile-feature.md` | Device/emulator behavior, permissions, offline state |
| Mobile + PC / cross-device realtime | `mobile-pc-realtime.md` | Mobile→backend→PC and PC→backend→mobile |
| Realtime web/desktop | `fullstack-feature.md` with realtime routing | Publish, receive, reconnect, authorization |
| IoT or hardware | `mobile-feature.md` or `fullstack-feature.md`, according to client | Simulated/real device input, safe offline recovery |
| Debugging | `debugging.md` | Reproduction, root cause, regression proof |
| Database | `database-change.md` | Migration, authorization, rollback/recovery plan |
| MCP server | `mcp-integration.md` | Local `tools/list` and valid/invalid tool calls |
| PDF/XLSX/document work | relevant `pdf`/`xlsx` skill | Open/read generated artifact |
| Deployment | `deployment.md` | Build, public HTTPS probe, browser critical path |
| Final release | `release.md` | Clean integrity gate, build, deployment, demo evidence |

Use native desktop only when native capability is explicitly required. For Mobile + PC use one backend, shared contracts, authentication, authorized realtime channels, and bidirectional verification.

## Browser and Runtime Verification

For browser applications, run the actual app and verify the primary journey in a real browser. Check console errors, failed network requests, loading/empty/error/success states, desktop/mobile layout, and the intended presentation resolution.

For an API, test the intended response and the relevant failure behavior. For a deployment, run:

```text
node execution/verify-deployment.mjs <public-https-url>
```

Skipped verification is not a pass. `verify-build.mjs` returns skipped when an application manifest or build script does not exist.

## Reliability, Timeouts, and Fallbacks

- Fast read-only assistance (AI generation, metadata, UI help): bounded around 4–5 seconds where the product permits.
- Database reads: bounded 5–10 seconds where appropriate; one safe retry at most.
- Database writes/uploads: operation-appropriate timeouts, idempotency where possible, and no silent substitution with mock success.
- Authentication: never mock successful authentication.
- Deployment/build/test: monitor real progress and inactivity; do not terminate solely because elapsed time is long.
- Respect `Retry-After` for `429`. Retry at most once and only for a safe transient failure.

Circuit breaker: `CLOSED` → `OPEN` after an unavailable/limited provider → `HALF-OPEN` with one controlled probe. Never hammer a failing provider.

Deterministic fallback is permitted only in explicit demo/test mode, must be visibly identifiable internally, and must not claim that real auth, a database write, payment, deployment, or external transaction succeeded.

## Demo Reliability

Keep the demo path predictable: seedable sample data, reset capability, clear recovery UI, and deterministic demo mode where appropriate. Use:

```text
node execution/seed-demo.mjs --demo
node execution/reset-demo.mjs --demo
```

Those scripts affect only ignored local demo state marked `DEMO_MODE`; they never operate on a real database.

## Safety and Decision Boundaries

Resolve minor implementation choices autonomously. Obtain explicit user confirmation before destructive operations, production-data changes, credential/security changes, irreversible migrations, major architectural shifts, or any billing/paid-service action.

Validate untrusted input at boundaries. Treat AI output, browser content, external responses, file paths, and tool parameters as untrusted. Do not expose raw provider errors to end users.

## Definition of Done

A feature is done only when it:

- meets its acceptance criteria;
- has relevant automated and/or direct verification;
- handles meaningful loading, empty, error, and recovery states;
- does not expose secrets or raw provider failures;
- preserves the primary user journey; and
- is demonstrated truthfully in the runtime environment.

## Self-Annealing

Use this loop: failure → diagnose → fix → test → determine reusability → update the appropriate directive or execution tool.

- Fix one-off bugs without changing global rules.
- Promote only repeated, evidence-backed operational lessons.
- Require user approval for major OS changes.
- Never add credentials or secrets to documentation.
