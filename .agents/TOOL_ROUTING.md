# Tool Routing & Reliability Policy

This document defines deterministic tool selection and recovery across MCP servers, CLI utilities, APIs, and skills. A configured service is available capability, not an automatic instruction to call it.

---

## 1. Anti-Stall Protocol — Safety Revision

### Core Principle
**NEVER STALL without becoming NEVER FAIL.**
A transparent failure with a safe recovery path is preferable to fabricated success.

---

### Timeout Classes

#### Fast External Operations
- **Examples**: AI generation, read-only metadata, UI assistance.
- **Timeout**: 4–5 seconds.
- **Action**: Safe deterministic fallback is allowed only in explicit demo/test mode.

#### Database Reads
- **Timeout**: 5–10 seconds.
- **Action**: Retry where safe.

#### Database Writes
- **Timeout**: Use operation-appropriate timeout.
- **Action**: Never silently replace a failed real write with mock data. Use idempotency/retry where possible.

#### Authentication
- **Policy**: Never mock successful authentication.

#### Deployment
- **Policy**: Treat deployment as a long-running operation. Use bounded polling with progress/activity detection. Never fake deployment success.

#### File Uploads
- **Policy**: Use appropriate longer timeout and retry behavior.

---

### Command Execution & Inactivity Thresholds

Do **NOT** terminate commands solely because they have exceeded 15 seconds.

#### Command Classes:
* **Short** (`git status`, `git diff`, small scripts): Use short timeout.
* **Long-Running** (`npm install`, builds, tests, Playwright, migrations, deployment): Allow extended execution.
* **Stall Detection Criteria**: Detect actual stalls by:
  1. No stdout/stderr progress.
  2. No file or build progress.
  3. No process activity.
  4. Repeated identical output loops.
* **Action**: Terminate only after a configurable inactivity threshold (e.g., 20–30s with zero I/O or state change).

---

### Demo Fallback Invariants

Deterministic fallback is allowed **ONLY** when:
- The application is explicitly in demo/test mode.
- The fallback is clearly identifiable internally.
- Real-world state is not falsely persisted.

**Prohibited Fakes:**
Never use mock fallback to pretend that:
- Authentication succeeded
- Payment succeeded
- Database write succeeded
- Deployment succeeded
- External transaction succeeded

---

### Autonomous Decision Boundaries

- **Resolve autonomously**: Minor implementation ambiguity, CSS styling, non-breaking refactors, component scaffolding.
- **Ask for confirmation before**:
  - Destructive operations
  - Production data changes
  - Security / credential changes
  - Paid-service activation
  - Destructive Git operations (e.g., `git reset --hard`, force push)
  - Irreversible migrations
  - Major architecture changes

---

### Retry Policy & Circuit Breaker

#### Retry Policy:
- **Maximum retry**: 1 retry for ordinary transient failures.
- **Do NOT retry**:
  - Authentication failures
  - Permission failures
  - Validation errors
  - Destructive operations unless idempotent
- **Rate Limits**: Respect HTTP 429 `Retry-After` headers when provided.

#### Circuit Breaker States:
- **CLOSED**: Normal operation.
- **OPEN**: Service temporarily unavailable; requests fail fast to fallback.
- **HALF-OPEN**: Perform one controlled recovery request before resetting state.
- **Rule**: Do not repeatedly hammer an unavailable service.

---

## 2. Tool Routing Table

| Task Trigger | Primary Engine | Autonomous Fallback | Quota / Stall Action |
|---|---|---|---|
| **Design & Token Extraction** | Figma MCP only when a Figma source is supplied | Existing tokens / direct CSS | Rate-limit/auth → stop Figma and implement locally. |
| **Asset Download** | Supplied source / Figma only when relevant | Existing assets or local SVG/CSS | Download failure → do not retry indefinitely. |
| **Component Scaffolding** | Existing components; v0 only when it materially helps | Direct UI implementation | 402/429/auth → stop v0 and implement directly. |
| **Framework Docs & Syntax** | Context7 only for current docs | Official docs or project precedent | Docs unavailable → avoid speculative APIs. |
| **Browser Inspection & DOM** | DevTools for a running app | Playwright or local logs | Inspect real inactivity before stopping. |
| **E2E Demo Flow Verification** | Playwright for repeatable user journeys | Manual browser run | Tool failure → use the other path; record actual evidence. |
| **API Contract & Testing** | Native test/client; Postman for complex collections | `fetch`, `curl.exe`, targeted checker | 429/402/auth → stop that service and use fallback. |
| **Issue & Task Tracking** | Local checklist unless remote tracking is requested | `TODO.md` / task plan | Linear unavailable/unneeded → do not call it. |
| **Deployment & Hosting** | One user-selected provider | Local preview/static hosting where applicable | Plan/quota failure → stop provider; never claim deploy success. |
| **Production Error Triaging** | Selected provider logs when deployed there | Local stdout/stderr and browser logs | Provider unavailable → inspect local evidence. |

---

## 3. Safe Mock Degradation Pattern

All runtime AI and read-only assistance handlers must implement operation-scoped timeout and fallback bounds:

```typescript
export async function executeSafeDemoFallback<T>(
  operationFn: () => Promise<T>,
  fallbackData: T,
  isDemoMode: boolean = false,
  timeoutMs: number = 4500
): Promise<T> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('OPERATION_TIMEOUT')), timeoutMs)
    );
    return await Promise.race([operationFn(), timeoutPromise]);
  } catch (error: any) {
    if (isDemoMode) {
      console.warn(`[CIRCUIT-BREAKER] ${error.message}. Serving demo fallback.`);
      return fallbackData;
    }
    throw error;
  }
}
```

---

## 4. PLATFORM DETECTION

Before implementation, classify the requested application:

### Web
**Default**: React / Next.js / existing web stack
**Flow**: `context7` → implementation → Playwright → Chrome DevTools

### Mobile
**Default**: Expo + React Native + TypeScript, unless the problem explicitly requires another stack.
**Flow**: `context7` → mobile implementation → backend integration → device/emulator verification

### Mobile + PC/Web
**Use**:
- **Mobile**: Expo / React Native
- **PC**: Next.js / React
- **Shared**: backend + database + authentication + realtime + shared types/contracts

**Flow**:
`context7`
→ architecture
→ shared contracts
→ mobile
→ PC
→ backend/realtime
→ mobile verification
→ PC verification
→ cross-device verification

**Required cross-device tests**:
- Mobile → backend → PC
- PC → backend → mobile

### Native desktop
Only choose Electron/Tauri/native desktop when the problem statement specifically requires native desktop functionality.
Do not introduce native desktop complexity when a browser dashboard satisfies the requirement.

### IoT / hardware
Detect:
- device communication
- serial/Bluetooth
- sensor data
- realtime telemetry
- offline behavior

Prefer a shared backend/event layer between devices and dashboards.

### Platform rule

**Never assume every hackathon problem is a web application.**
Choose architecture from the problem statement before implementation.

---

### Cross-Device Implementation Checklist (When Mobile + PC is detected):

1. **Identify mobile capabilities required**:
   - camera
   - GPS / geolocation
   - notifications
   - Bluetooth
   - files
   - sensors
2. **Identify PC capabilities required**:
   - dashboard
   - administration
   - monitoring
   - analytics
3. **Identify synchronization requirements**:
   - realtime (WebSockets / Supabase Realtime)
   - request / response
   - offline queue
   - device pairing (QR code / short session code)
4. **Shared contracts**:
   - Create shared TypeScript types, API contracts, and validation schemas (Zod).
   - Single unified backend instance; never spin up two separate backends.
5. **Cross-device completion criterion**:
   - Never mark the feature complete until both clients are verified communicating bi-directionally.

---

## 5. Core Tool Routing Principles & Execution Flows

### 11 Core Principles
1. **Installed MCP ≠ automatically invoked MCP**: Only invoke an MCP server if the task explicitly requires its capability.
2. **Use the smallest useful tool set**: Do not open unnecessary browser sessions or spawn unneeded subprocesses.
3. **Prefer local tools when equally effective**: Local git CLI, node scripts, and local logs beat remote API calls every time.
4. **Reuse information already obtained**: Never re-query docs or re-fetch schemas that are already loaded in context.
5. **Never call unrelated MCP servers**: Keep operations isolated to the domain at hand.
6. **Use relevant configured services intelligently**: provider when applicable → local CLI/scripts → explicit demo/test fallback where safe.
7. **Stop using a service at quota/credit/payment limits**: Immediate hard stop on HTTP 402/429/quota exhaustion.
8. **Never retry indefinitely**: Max 1 retry for transient errors; fail fast to local fallback.
9. **Respect `Retry-After` when provided**: Never spam backoff loops.
10. **Never fabricate success**: Transparent failures with graceful recovery beat fake green lights.
11. **Demo fallbacks may only be used in explicit demo/test mode**: Never pretend production auth, payment, database writes, or deployments succeeded.

### Platform-Aware Routing Flows

- **WEB**:
  `context7` → implementation → Playwright → DevTools
- **FRONTEND DESIGN**:
  supplied design source / `v0` when useful → implementation → Playwright → DevTools
- **FULL STACK**:
  `context7` → frontend → backend → database → Playwright → DevTools → Git
- **MOBILE**:
  `context7` → Expo / React Native → backend → device/emulator verification
- **MOBILE + PC**:
  architecture → shared contracts → mobile → PC → backend/realtime → cross-device verification
- **API**:
  `postman` or `curl`/`fetch`/Node scripts → implementation → tests
- **DEBUG**:
  reproduce → logs / DevTools → Playwright → surgical fix → regression test
- **DEPLOY**:
  test → build → active free provider (Vercel Hobby / Netlify Free) → verify public URL

---

## 6. SKILL ROUTING

### Frontend
`frontend-design`
→ `context7` when current library docs are required
→ `v0` when useful / free
→ implementation
→ `webapp-testing`
→ Chrome DevTools

### Browser testing
`webapp-testing`
→ Playwright
→ Chrome DevTools for deeper diagnosis

### Figma-driven UI
Figma MCP
→ `frontend-design`
→ implementation
→ `webapp-testing`

### MCP development
`mcp-builder`
→ inspect existing MCPs
→ implement
→ test
→ document

### Skill development
`skill-creator`
→ only when a repeatable capability justifies a new skill

### Hackathon artifact / demo
`web-artifacts-builder`
→ implementation
→ browser verification

### Documents
`pdf` / `xlsx`
→ only when task requires that output (local Python utilities, zero external cost)

---

**IMPORTANT**:
A skill does NOT replace an MCP.
A skill describes how to perform a type of task.
The MCP provides external capability.
Use both in concert when appropriate.

### Smart-Service Clarification

The phrase "zero-cost fallback hierarchy" above is superseded by `AGENTS.md`: use a relevant configured service when it helps the task; stop only when it returns a quota, rate-limit, billing-required, authentication/permission, or unrecoverable timeout signal. Never enable billing, upgrades, trials, or auto-recharge on the user's behalf.

---

## 7. Complete Platform Routes

| Category | Primary → Fallback | Limit condition | Verification path |
|---|---|---|---|
| **WEB** | Existing web stack → direct components | UI service unavailable | Browser critical path, console/network, responsive viewports |
| **MOBILE** | Expo/React Native → local preview | Device capability denied/unavailable | Emulator/device, permissions, offline state |
| **MOBILE + PC** | One backend + shared contracts + authorized realtime → bounded polling | Realtime unavailable | Mobile→backend→PC and PC→backend→mobile |
| **NATIVE DESKTOP** | Native stack only if explicitly required → browser dashboard | Native capability not required | Required OS integration test |
| **AI/LLM** | Selected configured provider → explicit demo/test fixture or non-AI recovery UI | 429/quota/402/auth/timeout | Schema-valid output, timeout, recovery |
| **REALTIME** | Authorized WebSocket/realtime channel → snapshot + polling | Disconnect/reconnect failure | Publish, receive, reconnect, authorization |
| **API/BACKEND** | Application route/client → native fetch/curl/local fixture | Provider unavailable | Contract, errors, authorization |
| **DATABASE** | Selected DB → local development DB | Quota/connection failure | Migration, constraints, authorization, rollback plan |
| **DEBUGGING** | Reproduce + logs + DevTools → focused test | Browser unavailable | Original reproduction and regression proof |
| **DEPLOYMENT** | One selected provider → local/static fallback | Provider plan/quota/billing limit | Build, HTTPS endpoint, public browser path |
| **MCP DEVELOPMENT** | Local stdio server → CLI/REST adapter | Startup/auth failure | `tools/list`, valid/invalid calls |
| **DOCUMENT GENERATION** | Local PDF/XLSX tooling → CSV/Markdown | Library unavailable | Reopen/read artifact |
| **IoT/HARDWARE** | Required device interface → clearly marked simulator | Device unavailable | Device/simulator → backend → UI |
