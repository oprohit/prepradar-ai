# MCP Server Policy

This policy governs the installation and use of Model Context Protocol (MCP) servers in this workspace.

---

## Baseline Servers (Pre-Installed)

1. **`chrome-devtools`**: Runtime browser automation, DOM inspection, console/network error capture, and accessibility checks (`chrome-devtools-mcp@latest --isolated`).
2. **`context7`**: Direct retrieval of current library and framework documentation without training data hallucinations (`@upstash/context7-mcp`).

---

## Addition Policy for Specialist Servers

Additional MCP servers may **only** be added after the hackathon problem statement is known and the technical architecture is finalized.

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
