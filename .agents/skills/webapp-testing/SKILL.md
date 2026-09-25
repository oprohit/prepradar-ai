---
name: webapp-testing
description: Use when verifying real browser behavior, testing web applications, validating forms, auth flows, navigation, responsive layouts, DOM states, console errors, and network requests using Playwright and Chrome DevTools.
---

# Web Application Testing

Real browser verification separates functional code from paper designs. Never mark a web feature complete simply because it compiles or builds without errors. Always execute runtime verification against the running application.

---

## 1. Engine & Tool Selection Matrix

Antigravity provides two complementary browser testing engines:

| Engine | Primary Tools | Best Used For |
|---|---|---|
| **Playwright MCP** | `browser_navigate`, `browser_click`, `browser_type`, `browser_snapshot`, `browser_resize` | Automated interaction flows, user journey regression, form submissions, multi-step actions. |
| **Chrome DevTools MCP** | `navigate_page`, `click`, `take_screenshot`, `list_console_messages`, `list_network_requests`, `lighthouse_audit` | Deep runtime inspection, DOM computed styling, uncaught JavaScript exceptions, failed HTTP requests, network waterfall analysis. |
| **Local Headless CLI** | `npx playwright test` / Node test scripts | Automated batch test suites and CI regression before deployment. |

---

## 2. Standard Testing Workflow

```
[Start Local Dev Server] (e.g., `npm run dev` at localhost:3000)
        │
        ▼
[Initial Navigation & Page Load]
 ├── Navigate to target URL (`browser_navigate` or `navigate_page`)
 ├── Wait for DOM content loaded and network idle
 └── Capture screenshot / initial snapshot to verify rendering
        │
        ▼
[Runtime Console & Network Audit]
 ├── Check `list_console_messages` for 404s, CORS, unhandled promise rejections, React hydration mismatches
 └── Check `list_network_requests` for failed API calls (500, 401, 403)
        │
        ▼
[User Journey & Interaction Flow]
 ├── Test primary user actions (clicking buttons, typing into forms, toggles)
 ├── Validate boundary inputs (empty, invalid email, extreme lengths)
 └── Verify state updates (optimistic UI, toast notifications, URL parameter updates)
        │
        ▼
[Boundary State Verification]
 ├── Loading states (skeleton loaders, spinners)
 ├── Empty states (no data illustration, clear call-to-action)
 └── Error states (graceful user-facing alerts, retry buttons, no raw stack traces)
        │
        ▼
[Responsive Viewport Verification]
 ├── Desktop: 1440 × 900
 ├── Tablet: 768 × 1024
 └── Mobile: 375 × 667 (test navigation drawer, touch targets, horizontal overflow)
```

---

## 3. Comprehensive Verification Checklist

### A. Authentication & Navigation
- [ ] Direct URL access without auth redirects to login or public fallback.
- [ ] Submitting valid credentials updates session state and redirects to dashboard.
- [ ] Logout invalidates session and clears protected client state.
- [ ] Back/forward browser buttons preserve correct view state.

### B. Forms & Inputs
- [ ] Required field validation triggers before network submission.
- [ ] Invalid inputs display inline, human-friendly error messages.
- [ ] Submit button disables during request flight to prevent duplicate submissions.
- [ ] Form resets or clears correctly upon successful submission.

### C. CRUD & State Synchronization
- [ ] Created items immediately render in UI lists (optimistic or confirmed).
- [ ] Updated items reflect changes across all dependent dashboard widgets.
- [ ] Deleted items are removed without requiring a full page refresh.
- [ ] Re-fetching or browser reload retains persisted state.

### D. Console & Network Hygiene
- [ ] Zero unhandled JavaScript errors in console.
- [ ] Zero failed network requests for critical assets (CSS, JS, fonts, images).
- [ ] 4xx / 5xx API responses surface graceful UI recovery options instead of blank screens.

---

## 4. Anti-Stall & Cost Invariants

1. **Inactivity Detection**: If a Playwright or browser session produces no output for >15s, inspect server logs, check port binding, and kill hanging processes.
2. **$0 Policy**: Run all tests against local servers (`localhost:3000` / `localhost:5173`) or free preview deployments. Never trigger paid cloud testing grids.
3. **No Fake Passes**: If a form fails or an error appears in console, document the exact stack trace, fix the underlying code, and re-test.
