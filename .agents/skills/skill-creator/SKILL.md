---
name: skill-creator
description: Use when creating new agent skills, refining existing skill instructions, optimizing trigger descriptions, and evaluating skill performance. Enforces Antigravity progressive-disclosure skill format.
---

# Skill Creator

A skill for creating, testing, and maintaining reusable agent skills within the Antigravity operating system. Create skills to capture repeatable, high-leverage workflows rather than one-off operations.

---

## 1. Skill Creation Criteria

Do **NOT** create a skill merely because an action occurred once. Create a skill only when:
1. **Repeated Workflow**: The task recurs across multiple sessions or features.
2. **Specialized Domain Knowledge**: The task requires specific sequence, gotchas, or conventions that generic prompting misses.
3. **No Overlap**: An existing skill does not already cover this domain (inspect `.agents/skills/` first).

---

## 2. Progressive Disclosure Architecture

Every skill lives in `.agents/skills/<skill-name>/` following Antigravity's progressive-disclosure standard:

```
.agents/skills/<skill-name>/
├── SKILL.md           (Required: YAML frontmatter + operational instructions)
├── scripts/           (Optional: Executable scripts for repetitive actions)
├── references/        (Optional: Detailed docs loaded only when needed)
└── examples/          (Optional: Input/output examples, templates)
```

### The Three Loading Levels:
1. **Level 1 — Discovery (Frontmatter Metadata)**: Always in context (~50–100 words). Must have a clear name and a trigger-oriented description explaining **what** the skill does and **when** to activate it.
2. **Level 2 — Activation (SKILL.md Body)**: Loaded into context only when triggered. Keep concise (<500 lines). Focus on workflows, decision trees, and checklists.
3. **Level 3 — Execution (Resources & Scripts)**: Loaded or executed on demand without polluting the main context window.

---

## 3. Standard SKILL.md Template

```markdown
---
name: <kebab-case-skill-name>
description: Use when <specific trigger phrases, conditions, or user tasks>. Provides <concise summary of capability and value>.
---

# <Title>

<1-2 paragraph overview of the capability and mindset.>

---

## 1. When to Use & When NOT to Use
- **Use when**: <Scenario A>, <Scenario B>
- **Do NOT use when**: <Alternative scenario covered by existing tool or skill>

---

## 2. Tool & MCP Routing
<Which MCPs or CLI tools to use and the execution sequence.>

---

## 3. Operational Workflow
<Step-by-step instructions with code snippets or gotchas.>

---

## 4. Verification & Definition of Done
<Concrete verification checklist to confirm the skill succeeded.>
```

---

## 4. Iteration & Optimization Loop

1. **Draft**: Create the initial `SKILL.md` in `.agents/skills/<name>/SKILL.md`.
2. **Dry-Run Test**: Prompt the agent with realistic tasks and verify that:
   - The skill triggers when relevant.
   - The skill stays idle when irrelevant.
   - The instructions produce deterministic, high-quality code.
3. **Refine Description**: If the skill fails to trigger, sharpen the description with concrete task triggers and user keywords.
4. **Prune**: Remove fluff, tutorial-style padding, and excessive prose. Keep only actionable guidance.
5. **Verify Provider Safety**: Document any required provider, its fallback, and the rule to stop on quota, billing-required, auth, or repeated-timeout signals. Never instruct agents to enable billing or upgrades.
