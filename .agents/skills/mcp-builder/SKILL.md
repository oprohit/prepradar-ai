---
name: mcp-builder
description: Use when creating, modifying, testing, or debugging Model Context Protocol (MCP) servers in TypeScript or Python. Guides tool definitions, schemas, error handling, local stdio transport, and safe provider fallback.
---

# MCP Server Development Guide

The Model Context Protocol (MCP) connects LLMs to external tools, databases, and services via standardized RPC interfaces. Build robust, safe MCP servers that provide focused capabilities without security leaks or unnecessary complexity.

---

## 1. Pre-Development Verification Checklist

Before writing any code for a new MCP server, verify:
1. **Existing Solution Audit**: Verify whether an existing official or open-source MCP server already solves the problem (e.g., official GitHub, Supabase, Postgres, or filesystem MCPs).
2. **Minimal Surface Area**: Expose only the specific tools required for the task. Avoid dumping 50 raw API endpoints when 3 focused workflow tools solve the problem.
3. **Provider Boundary**: Use a configured provider only when it serves the selected task. On quota, billing-required, auth/permission failure, or repeated timeout, stop it and return an actionable failure or local fallback.
4. **Credential Isolation**: Never hardcode API keys or tokens in MCP source code. Pass credentials through protected environment configuration, never command-line arguments.

---

## 2. Recommended Tech Stacks & Transport

- **TypeScript / Node.js (Preferred)**:
  - SDK: `@modelcontextprotocol/sdk`
  - Transport: `StdioServerTransport` for local CLI execution.
  - Schema Validation: `zod` for strict runtime parameter parsing.
- **Python (Alternative)**:
  - SDK: `mcp` (or FastMCP)
  - Transport: stdio transport.
  - Schema Validation: `pydantic` models.

---

## 3. High-Quality Tool Design Principles

### A. Descriptive Tool Names & Descriptions
- Prefix tools with a domain namespace: `incident_get_active`, `incident_create_alert`, `telemetry_query_metrics`.
- Descriptions must explain **what** the tool does and **when** an agent should invoke it.

### B. Strict Input Schemas
- Define all parameters with types, descriptions, and required constraints.
- Avoid loose `Record<string, any>` types; specify concrete properties.

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "custom-sensor-hub",
  version: "1.0.0"
});

server.tool(
  "sensor_read_telemetry",
  "Fetch realtime telemetry metrics from campus sensors within a time window",
  {
    sensorId: z.string().describe("Unique identifier of the sensor"),
    windowMinutes: z.number().int().min(1).max(60).default(5).describe("Time window in minutes")
  },
  async ({ sensorId, windowMinutes }) => {
    try {
      // Safe, local, read-only data fetch
      const readings = await fetchLocalSensorData(sensorId, windowMinutes);
      return {
        content: [{ type: "text", text: JSON.stringify(readings, null, 2) }]
      };
    } catch (error: any) {
      // Safe error formatting without exposing stack traces or tokens
      return {
        isError: true,
        content: [{ type: "text", text: `Error reading sensor ${sensorId}: ${error.message}` }]
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

### C. Safe Actionable Error Handling
- Return `isError: true` in the tool result instead of crashing the server process.
- Error messages should provide actionable recovery steps (e.g., *"Device ID 'dev-99' not found. Available devices: dev-1, dev-2"*).
- Never leak connection strings, auth tokens, or internal IP addresses in error responses.

---

## 4. Testing & Verification

1. **Local Test Script**: Create a minimal runner (e.g., `scripts/test-mcp.mjs`) that spawns the server via stdio, sends `tools/list` and a sample `tools/call`, and asserts the response format.
2. **Registration in Antigravity**:
   - Register the server in `~/.gemini/config/mcp_config.json`:
   ```json
   {
     "mcpServers": {
       "custom-sensor-hub": {
         "command": "node",
         "args": ["c:/AGTest/mcp-servers/custom-sensor-hub/dist/index.js"],
         "env": {
           "API_KEY": "${SENSOR_API_KEY}"
         }
       }
     }
   }
   ```
3. **Verify locally**: Start the newly registered process and test `tools/list`, valid calls, invalid input, timeout, and provider failure. `check-apis.mjs` verifies targeted provider readiness, not MCP process startup.
