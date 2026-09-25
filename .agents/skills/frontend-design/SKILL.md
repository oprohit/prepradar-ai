---
name: frontend-design
description: Use when designing distinctive, production-grade frontend interfaces, web components, landing pages, dashboards, or design systems. Guides aesthetic direction, typography, motion, and layout to avoid generic AI slop.
---

# Frontend Design

Approach every interface as an elite design studio lead giving the product a distinct, memorable visual identity. Reject generic templates, cliché purple gradients, uniform rounded cards, and uninspired default styles. Deliver deliberate, opinionated choices tailored to the project's exact domain and users.

---

## 1. Tool & MCP Routing Workflow

When executing frontend design tasks, follow this deterministic pipeline:

```
[Design Task Received]
        │
        ▼
Is Figma URL/Tokens provided?
 ├── YES ──► Figma MCP (`get_figma_data`, `download_figma_images`)
 └── NO  ──► Establish custom aesthetic direction (palette, typography, layout)
        │
        ▼
Evaluate `v0` MCP (`generate_prototype`) only when it materially helps
 ├── Available → Scaffold initial component structure
 └── Quota / billing / auth error → Direct custom Tailwind/React implementation
        │
        ▼
Assemble into project codebase
 ├── Clean React / Next.js components
 ├── Semantic HTML & Accessible ARIA attributes
 └── Tailwind CSS styling with cohesive design tokens
        │
        ▼
Runtime Browser Verification
 ├── `playwright` MCP (E2E flows, interaction, visual regression)
 └── `chrome-devtools` MCP (DOM inspection, responsive layout, console & network)
```

---

## 2. Core Aesthetic Principles (Avoiding AI Slop)

1. **Grounding in Subject Matter**:
   - Understand the user and domain before choosing aesthetics. A cyber security monitoring dashboard demands dense, high-contrast, data-rich telemetry; a consumer wellness app demands calm, spacious, organic tones.
   - Use authentic copy and domain-specific data — never generic "Lorem Ipsum" or fake "Card Title 1".

2. **Typography with Character**:
   - Never rely on system defaults or plain unstyled fonts. Pair modern Google Fonts (e.g., *Outfit*, *Space Grotesk*, *Cabinet Grotesk*, *Inter*, *JetBrains Mono* for telemetry).
   - Set deliberate typographic hierarchy: distinct display headline, purposeful tracking, legible line heights (<80 characters per line).
   - Avoid AI tells: do not italicize/color just a single word in every headline, and avoid all-caps labels without tracking.

3. **Curated Color Palettes**:
   - Avoid default primaries (basic `#0000FF`, `#FF0000`). Use curated HSL tokens with subtle contrast steps.
   - Establish:
     - Neutral base (dark mode: rich slate/zinc `#0B0F17`, not muddy gray `#222222`).
     - Primary brand accent (e.g., emerald `#10B981`, electric indigo `#6366F1`, or cyber amber `#F59E0B`).
     - Semantic status tokens (muted emerald, amber, rose) with subtle border glow/translucency.

4. **Surface Treatment & Depth**:
   - Use glassmorphism and multi-layer depth with purpose: subtle backdrop blur (`backdrop-blur-md`), 1px translucent borders (`border border-white/10`), and deep ambient drop shadows.
   - Ensure high contrast: text must remain crisp and readable over blurred or layered backgrounds (WCAG AA compliant).

5. **Motion Discipline**:
   - Motion must answer user actions (hover states, modal openings, tab transitions).
   - Use snappy, spring-based easing curves (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - Avoid continuous or gratuitous animations that distract from data comprehension.

---

## 3. Implementation Checklist

- [ ] Clear aesthetic identity defined and matched to user persona.
- [ ] Figma tokens extracted or custom CSS variables created in `globals.css`.
- [ ] Responsive breakpoints tested: Desktop (1440px), Laptop (1024px), Tablet (768px), Mobile (375px).
- [ ] Interactive states implemented: `:hover`, `:focus-visible`, `:active`, `:disabled`.
- [ ] Loading skeletons and empty states styled with same visual care as main UI.
- [ ] Any configured design provider used has a documented local fallback; no billing or upgrades were enabled by the agent.
- [ ] Visual output confirmed in browser using Chrome DevTools or Playwright.
