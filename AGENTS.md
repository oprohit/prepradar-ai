# Hackathon Engineering Operating System

Read HACKATHON_BRIEF.md before making hackathon-specific product decisions once it is filled in.

## Mission

Build a polished, reliable product around one clear end-to-end user journey.

Optimize for:
1. User value
2. Functional depth
3. Meaningful AI usage
4. UX quality
5. Reliability
6. Demo clarity
7. Fast iteration

Feature count is not the goal.

## Requirements

- Define the primary user journey before implementation.
- Define acceptance criteria before major implementation.
- Prefer one excellent vertical slice over many incomplete features.
- AI must perform meaningful work rather than act only as a chatbot wrapper.
- Prefer structured outputs when machine-readable AI results are required.
- Validate AI outputs before using them.
- Critical AI/API paths should have timeout/error handling and safe fallback behavior where practical.
- Never expose raw provider/API errors to end users.
- Never commit secrets.
- Do not add dependencies without a concrete reason.

## Working Style

- Inspect before changing.
- Read relevant source before editing.
- Follow existing project conventions.
- Verify unfamiliar APIs against current official documentation.
- Make small reversible changes.
- Preserve working behavior.
- Avoid unrelated refactors.
- Prefer simple solutions over clever abstractions.

## Debugging

When something fails:

1. reproduce
2. localize
3. fix the root cause
4. verify
5. add the smallest useful regression protection

After repeated failed approaches:
- stop guessing
- summarize evidence
- identify uncertainty
- continue using an evidence-driven approach

## Browser Verification

For web applications:
- run the actual app
- verify the primary journey in a browser
- inspect console errors
- inspect failed network requests
- verify loading/empty/error/success states
- verify responsive layout
- verify intended presentation resolution

## Demo Reliability

Maintain a predictable critical demo path.

When appropriate:
- demo/sample data
- reset capability
- deterministic behavior
- API timeout handling
- fallback behavior
- clear recovery states

## Definition of Done

A feature is complete only when:
- code exists
- relevant verification passes
- runtime behavior is verified
- critical failures are handled
- the main journey still works
- no secrets are exposed
- the result is demo-ready
