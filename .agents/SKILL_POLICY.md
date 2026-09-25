# Skill Policy & Development Lifecycle

This document serves as an on-demand reference for how skills are used across the hackathon engineering lifecycle. Antigravity discovers skills progressively via frontmatter descriptions; do not load full skill contents into context prematurely.

---

## Lifecycle Phases & Skill Mapping

### 1. IDEA
* **`interview-me`**: Rapidly clarify project intent, requirements, and edge cases before drafting code.
* **`idea-refine`**: Sharpen the core value proposition, differentiate the product, and eliminate low-value complexity.
* **`spec-driven-development`**: Produce unambiguous specifications (`SPEC.md`) before any implementation starts.
* **`planning-and-task-breakdown`**: Decompose the spec into small, verifiable slices.

### 2. CONTEXT / RESEARCH
* **`context-engineering`**: Curate targeted context files and instructions rather than dumping raw tokens.
* **`source-driven-development`**: Ground API and library choices in current official documentation.
* **`doubt-driven-development`**: Systematically challenge architectural assumptions and identify failure modes early.

### 3. BUILD
* **`incremental-implementation`**: Build one verifiable, working slice at a time to keep the project continuously shippable.
* **`frontend-ui-engineering`**: Craft intentional, polished, accessible UI and prevent generic "AI-generated" aesthetics (active when UI exists).

### 4. API / BACKEND (Conditional)
* **`source-driven-development`** and **`security-and-hardening`**: Activate when the selected project includes custom APIs, authentication, storage, or third-party services.

### 5. VERIFY
* **`test-driven-development`**: Protect critical application and AI pipelines with automated validation.
* **`webapp-testing`**: Validate runtime browser behavior; use **`browser-testing-with-devtools`** for deeper DOM, console, network, or performance diagnosis.
* **`debugging-and-error-recovery`**: Break out of "try this fix" loops with systematic root-cause diagnosis.

### 6. REVIEW
* **`code-review-and-quality`**: Audit code health, dead code, maintainability, and clarity before deployment.
* **`code-simplification`**: Prune unnecessary abstractions and keep code concise and readable.
* **`security-and-hardening`**: Audit secrets, environment handling, input validation, permissions, and OWASP fundamentals.

### 7. SHIP
* **`shipping-and-launch`**: Guide deployment verification, build sanity, asset checklists, and pre-demo dry runs.

---

## Conditional Skills

Use `mcp-builder`, `pdf`, `xlsx`, `web-artifacts-builder`, or `skill-creator` only when the selected architecture or requested output requires their specialized capability. Do not refer to absent skills as active workflow dependencies.

---

## Operating Principles

1. **Activate on demand**: Skills are modular runbooks. Never inject all skills at once.
2. **Smallest relevant set**: Select only the 1-2 skills relevant to the current task.
3. **Preserve context budget**: Reading large skill files unnecessarily burns context window tokens.
4. **Context refresh**: Start a fresh conversation turn or clean context when previous threads become bloated or stale.
5. **Service selection**: A skill does not force a provider. Use relevant configured APIs/MCPs under `AGENTS.md` and stop on provider-limit/auth failures.
