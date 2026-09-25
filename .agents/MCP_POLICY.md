# MCP Server Policy

This policy governs the installation and use of Model Context Protocol (MCP) servers in this workspace.

> **Current operating rule:** MCP servers already configured in a user-level configuration are optional capabilities, not automatic dependencies. Use one only when it directly helps the active task and no equivalent local path is better. A successful call does not prove a provider plan, quota, cost, or suitability. On `429`, quota exhaustion, `402`, billing-required, auth/permission failure, or repeated timeout, stop that provider and use the fallback in `TOOL_ROUTING.md`. Never enable billing, upgrades, trials, auto-recharge, or paid add-ons on the user's behalf.

---

## Historical Minimal Baseline

1. **`chrome-devtools`**: Runtime browser automation, DOM inspection, console/network error capture, and accessibility checks (`chrome-devtools-mcp@latest --isolated`).
2. **`context7`**: Direct retrieval of current library and framework documentation without training data hallucinations (`@upstash/context7-mcp`).

---

## Addition Policy for Specialist Servers

Additional MCP servers should be added only after the hackathon problem statement and technical architecture justify them. Existing user-configured servers remain optional and are not automatically invoked.

Every candidate server must satisfy five mandatory criteria before installation:
1. **Directly Relevant**: Solves a concrete problem required by the project brief.
2. **Material Improvement**: Substantially accelerates implementation or verification compared to standard CLI/code alternatives.
3. **No Redundancy**: The capability is not already handled adequately by local tools, scripts, or existing MCP servers.
4. **Verified Configuration**: Official package, flags, and stdio/SSE configuration are confirmed against current documentation.
5. **Justified Overhead**: Process startup latency, memory footprint, and token context costs are justified by the benefit.

---

## Domain-Specific Examples

* **Firebase MCP**: Add only if Firebase / Firestore / Firebase Auth is selected as the primary backend.
* **Supabase MCP**: Add only if Supabase Postgres / Auth is actively integrated.
* **Figma MCP**: Add only if actual design mockups or asset specifications are provided in Figma.
* **Stripe MCP**: Add only if payment processing is core to the demonstrated user journey.
* **Google Maps MCP**: Add only if geolocation or mapping is central to the project.
* **Postman MCP**: Add only if complex REST collections require interactive execution beyond simple test scripts.
* **GitHub MCP**: Add only if remote PR/issue automation exceeds standard git CLI functionality.

**Never install an MCP server merely because it exists or sounds interesting.**
