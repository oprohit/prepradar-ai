---
name: web-artifacts-builder
description: Use when building standalone frontend prototypes, interactive demos, visual proofs-of-concept, or browser-based artifacts for hackathons. Guides rapid component assembly with React, Tailwind CSS, and instant preview.
---

# Web Artifacts Builder

Build high-fidelity, interactive browser artifacts, visual proofs of concept, and standalone frontend prototypes tailored for hackathon demos and user validation.

---

## 1. When to Use

- **Use when**:
  - Creating a standalone demo prototype or interactive sandbox.
  - Building a rapid hackathon proof-of-concept before integrating into full-stack backend.
  - Generating visual artifacts for presentation to judges or end-users.
- **Do NOT use when**:
  - Implementing production fullstack features that require database migrations, complex server-side sessions, or background queues (use `/fullstack-feature` instead).

---

## 2. Architecture & Execution Strategy

1. **Leverage Existing Project Stack**:
   - If the workspace already has a Next.js / Vite / React setup, build the prototype as a dedicated route (e.g., `/demo`, `/prototype`) rather than creating a disconnected, orphaned project.
2. **Standalone HTML/React Artifact Fallback**:
   - If a self-contained, single-file artifact is desired, build an HTML document using Tailwind CDN, modern React 18, and Lucide icons that runs instantly in any browser with zero build steps.
   - Save standalone demo artifacts in the conversation artifact directory or `public/demo/`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive Prototype</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <div id="root"></div>
  <script type="text/babel">
    function App() {
      return (
        <main className="p-8 max-w-4xl mx-auto space-y-6">
          <header className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold tracking-tight">Interactive Prototype</h1>
            <p className="text-slate-400 text-sm">Rapid validation sandbox</p>
          </header>
          {/* Interactive UI components */}
        </main>
      );
    }
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
```

---

## 3. Workflow & Verification Loop

```
[Define Prototype Scope] (Identify key interaction to showcase)
        │
        ▼
[Scaffold Component Structure]
 ├── Use configured `v0` only if it materially helps component scaffolding
 └── Otherwise construct directly with React + Tailwind tokens
        │
        ▼
[Wire Mock Telemetry / State]
 ├── Include interactive controls (filters, switches, tabs)
 ├── Seed realistic mock data (never empty cards)
 └── Provide a "Reset Demo" button for repeatable presentations
        │
        ▼
[Runtime Browser Verification]
 ├── Open in browser via Playwright or Chrome DevTools MCP
 ├── Verify all buttons trigger visual responses
 └── Confirm zero console errors
```

---

## 4. Demo Polish Guidelines

- **Instant Comprehension**: A viewer should understand the core value proposition in 5 seconds.
- **Pre-populated Scenarios**: Always start with populated, realistic data. Empty states must be intentionally toggled.
- **Deterministic Paths**: The primary demo journey must be bulletproof against network delays or unexpected inputs.
- **Zero Paid Cost**: Utilize free CDNs and local tools only; no external paid APIs.
