# PrepRadar AI — Autonomous Placement Readiness Engine

> **GDGoC-CIT Hackathon Submission**  
> **Challenge**: *Reimagine Placement Preparation*  
> **Host**: Google Developer Groups on Campus — Coimbatore Institute of Technology (CIT)

PrepRadar AI eliminates student guesswork in campus placements through a mathematical 4-pillar diagnostic assessment, concept-tagged weakness vector synthesis, and an adaptive 7-day sprint plan.

---

## 🚀 Key Features

1. **4-Pillar Mathematical Diagnostic**:
   - Evaluates students across all four placement pillars: **DSA & Algorithms**, **Core CS (OS/DBMS)**, **Quantitative Aptitude**, and **Technical Communication**.
   - Unlike standard tier quizzes, every diagnostic question is tagged with a discrete concept (e.g., `#dp-knapsack`, `#hash-indexing`, `#speed-work-rates`, `#star-method-behavioral`).

2. **Weakness Vector & Gap Synthesis**:
   - Computes raw competency scores (0–100) per pillar from actual answers given.
   - Automatically isolates the student's lowest two pillars and surfaces the exact missed concept tags.

3. **Adaptive 7-Day Sprint Generator**:
   - Dynamically constructs a 7-day personalized curriculum where Days 1 & 2 directly target the diagnosed weak concepts.
   - Target Company Tier (Product Tier 1 vs. Service Core Tier 2 vs. High-Growth Startup) tunes the drill difficulty and architectural depth without overriding diagnosed weaknesses.

4. **Interactive Practice Sandbox & Live Gemini Evaluation**:
   - In-browser code and response practice console.
   - Evaluated in real-time by Google Gemini with a 4-second circuit breaker.
   - Analyzes time complexity, space complexity, and provides actionable remediation tips.

5. **Measurable Readiness Reassessment**:
   - Submitting an improved practice solution dynamically recalculates the **Placement Readiness Index (PRI)** on screen (e.g., `52/100 → 66/100`), proving measurable progress.

6. **Judge Evaluation Presets**:
   - **Preset A**: Product Tier 1 profile (diagnoses DSA DP & Core CS DBMS gaps).
   - **Preset B**: Service Tier 2 profile (diagnoses Quantitative & Communication gaps).
   - **Improvised Live Mode**: Evaluates any arbitrary combination of answers on the fly.

---

## 🛠 Tech Stack & Architecture

- **Frontend & Full-Stack**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
- **AI Engine**: Google Gemini 1.5 Flash via structured JSON generation (`lib/gemini-evaluator.ts`).
- **Resilience**: 4-second `AbortSignal` timeout circuit breaker with deterministic local fallback.
- **Icons & Styling**: Lucide React, SVG Radar Visualization, Cyber-tactical dark mode design system.
- **Operating System Harness**: Antigravity Agent OS (3-layer architecture: Directives, Orchestration, Execution).

---

## 📋 Environment Variables

Create a `.env` file in the root directory (do not commit secrets):

```env
# Gemini API (Required for live AI evaluations)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Database Conduits
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

---

## 💻 Local Development & Build

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Gate Verification
```bash
npm run build
node execution/verify-build.mjs
```

---

## 🧪 Verification & Testing

Run the automated Agent OS integrity and build gates:
```bash
# Verify API readiness ($0 cost offline probe)
node execution/check-apis.mjs

# Verify build syntax and bundle health
node execution/verify-build.mjs

# Audit project integrity, secrets, and skill frontmatter
node execution/verify-project.mjs
```

---

## 🌐 Deployment Information

- **Hosting Platform**: Vercel Production
- **Live Production URL**: *Configured during hackathon release*
- **Repository**: [https://github.com/oprohit/prepradar-ai](https://github.com/oprohit/prepradar-ai)

---

## ⚖️ Zero-Cost & Anti-Stall Invariants

- Strictly $0 cost: runs entirely within free-tier quotas.
- Never fakes authentication, database writes, or live deployments.
- High-speed circuit breakers prevent demo hangs during poor Wi-Fi or API limits.
