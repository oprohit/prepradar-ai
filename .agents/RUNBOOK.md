# Pre-Hackathon Runbook

A concise operational roadmap across the 8-hour hackathon timeline.

---

## Timeline Execution

### PRE-HACKATHON
- Verify workspace, CLI tools, and runtime environment.
- Verify active Antigravity model and quota status.
- Verify baseline MCP connections (`chrome-devtools`, `context7`).
- Verify installed core skills.
- Verify API environment placeholders (`.env.example`, `scripts/check-apis.mjs`).
- Verify git status and `.gitignore` hygiene.
- Fill `HACKATHON_BRIEF.md` once official rules are released.

### START OF EVENT (09:00 - 10:00)
- Populate official judging rubric and constraints into `HACKATHON_BRIEF.md`.
- Run `hackathon-architect` subagent to perform full requirement extraction, prior-art & founder research, gap analysis, 17-slide PPT outline, and 28-section proposal.
- Review Requirement Traceability Matrix and PPT outline.
- Explicit Approval Gate: User must explicitly choose `APPROVE`, `MODIFY`, `COMPARE`, `RESEARCH MORE`, or `REJECT`.
- (Only after APPROVE) Lock primary user journey in `SPEC.md` and generate `REQUIREMENT_TRACEABILITY_MATRIX.md`.
- Run `/plan` to outline architecture and execution milestones.
- Lock technology stack and install conditional MCP servers only if essential.

### EARLY BUILD (10:00 - 12:30)
- Implement the smallest end-to-end vertical slice (`incremental-implementation`).
- Wire real AI integration early; never build UI against fake data indefinitely.
- Verify end-to-end flow from input to model to rendered result.

### MIDDLE (12:30 - 14:30)
- Harden reliability: validate model outputs against strict schemas.
- Add timeouts, fallbacks, and user-friendly error recovery.
- Perform runtime browser testing with DevTools (`browser-testing-with-devtools`).
- Polish critical visual hierarchy and responsive states (`frontend-ui-engineering`).
- Maintain `DEMO_EVIDENCE.md` logging screenshots and runtime proofs.

### LATE (14:30 - 16:00)
- Invoke `demo-critic` subagent to audit the running application for flaws.
- Fix top 3-5 high-impact problems; reject trivial low-value distractions.
- Deploy to staging/production hosting (Vercel, Cloud Run, Firebase, etc.).
- Verify the deployed public URL against the critical path.

### FINAL (16:00 - 17:00)
- Polish `README.md` with problem statement, architecture, and live link.
- Synchronize PPT claims strictly with actual verified software (no phantom features).
- Capture final demo screenshots and flow assets.
- Prepare `DEMO.md` detailing the exact scripted 60–120 second presentation path.
- Run End-of-Hackathon Completion Protocol against the Traceability Matrix.
- Rehearse the happy path twice from a clean state.
- Submit the final package before deadline.

---

## Command Guidance

* `/grill-me`: Deep requirements interrogation and discovering non-obvious failure modes.
* `/plan`: Multi-step architectural breakdown before significant code changes.
* `/browser`: Interactive runtime UI and browser inspection.
* `/boost`: Complex reasoning or evasive algorithmic debugging only.
* `/goal`: Thorough, autonomous completion of well-specified tasks.
* `/agents`: Inspection and routing of subagents.
* `/usage`: Quota monitoring when provided by the environment.
* `/teamwork-preview`: Experimental multi-agent feature (optional only; do not rely on it for critical paths).

> [!IMPORTANT]
> Do not spend the first hour of the hackathon setting up infrastructure. The workspace is fully prepared now.
