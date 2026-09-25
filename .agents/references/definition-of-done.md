# Definition of Done

A change is done when its acceptance criteria are met, relevant tests/build checks pass, runtime behavior is verified where applicable, error and recovery paths are truthful, no secret is exposed, and the scope has not broken the primary user journey.

For browser work, runtime evidence includes console and network inspection. For external services, a limit/auth failure must select a fallback rather than fabricate success. A skipped check is not a pass.
