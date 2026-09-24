# Performance & Context Notes

This document tracks workspace configuration overhead, token context boundaries, and operational guidelines for the 8-hour hackathon.

---

## Workspace Customization Summary

* **Installed Core Skills**: 16 (`interview-me`, `idea-refine`, `spec-driven-development`, `planning-and-task-breakdown`, `context-engineering`, `source-driven-development`, `incremental-implementation`, `frontend-ui-engineering`, `doubt-driven-development`, `test-driven-development`, `browser-testing-with-devtools`, `debugging-and-error-recovery`, `code-review-and-quality`, `code-simplification`, `security-and-hardening`, `shipping-and-launch`).
* **Optional Skills Deferred**: 7 (`api-and-interface-design`, `performance-optimization`, `observability-and-instrumentation`, `documentation-and-adrs`, `git-workflow-and-versioning`, `ci-cd-and-automation`, `deprecation-and-migration`).
* **Active Baseline MCP Servers**: 2 (`chrome-devtools`, `context7`).
* **Custom Subagents**: 2 (`demo-critic`, `hackathon-architect`).
* **Hooks Status**: `NOT ENABLED` (Eliminates synchronous subprocess blocking latency on Windows).
* **Always-On Workspace Files**: `AGENTS.md` (Kept compact: ~70 lines, <500 tokens).
* **On-Demand Reference Files**:
  * `.agents/SKILL_POLICY.md`
  * `.agents/MCP_POLICY.md`
  * `.agents/DEMO_ENGINEERING_CONTRACT.md`
  * `.agents/RUNBOOK.md`
  * `.agents/HACKATHON_START.md`
  * `.agents/FINAL_DEMO_CHECKLIST.md`

---

## Quota & Usage Observations

* **Antigravity IDE Quota Facility**: The current IDE interface exposes model selection (`Gemini 3.8 Flash High`). Programmatic `/usage` slash command or direct quota inspection API is UNVERIFIED/unavailable in the current execution interface.
* **Application API Quota**: Managed independently via application `.env` (`GEMINI_API_KEY`). Validated via `scripts/check-apis.mjs` without burning build tokens.

---

## Context Management & High-Cost Operations

### High Token/Latency Operations
1. **Full Skill Ingestion**: Skills are progressively discovered by Antigravity via description headers. Never inject multiple complete skill files into a prompt.
2. **Excessive Multi-Agent Swarming**: Spawning multiple autonomous agents in parallel without strict boundaries quickly exhausts quota and risks conflicting edits.
3. **Overusing Complex Reasoning Commands**: Reserve `/boost` solely for deep architectural blockers or evasive algorithmic bugs.
4. **Experimental Multi-Agent Preview (`/teamwork-preview`)**: Treat as strictly optional; avoid making hackathon critical-path dependent on experimental orchestration.

### Deliberately Omitted / Pruned Customizations
* Pruned redundant meta-routing skills (`using-agent-skills`).
* Omitted heavy specialist MCP servers (Firebase, Supabase, Figma, GitHub, Stripe, Maps) until justified by problem statement.
* Avoided synchronous lifecycle hooks to prevent per-step latency penalties.
