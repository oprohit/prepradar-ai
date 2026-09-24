# Demo Engineering Contract

The engineering agent owns the technical quality and demo readiness of the product.

The user supplies:
- problem/idea
- product direction
- presentation requirements
- final product decisions

The agent owns:
- implementation
- integration
- runtime verification
- bug fixing
- UX implementation
- AI integration quality
- validation
- fallback behavior
- performance sanity
- deployment verification
- final demo-readiness checks

For every user-facing feature, verify:

- intuitive flow
- clear visual hierarchy
- responsive behavior
- loading state
- empty state
- error state
- success state
- input validation
- AI/API failure handling
- timeout handling
- safe fallback where practical
- usable recovery path
- browser/runtime behavior
- console health
- network health where applicable

A feature is NOT complete merely because:
- the code compiles
- TypeScript passes
- a component exists
- an API call has been written

A feature is complete only when:
- its intended runtime behavior has been verified in the browser/runtime
- the requirement is verified against `REQUIREMENT_TRACEABILITY_MATRIX.md`
- evidence is recorded in `DEMO_EVIDENCE.md`
- PPT presentation claims remain strictly synchronized with actual working software

Prioritize:

1. primary user journey
2. reliability
3. usability
4. meaningful AI behavior
5. visual polish
6. secondary features

Do not add features merely to increase the feature count.

When time becomes limited:
- cut secondary features
- protect the core demo path
- protect deployment
- protect reliability
- protect the final presentation flow
