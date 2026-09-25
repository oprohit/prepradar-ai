# Testing Patterns

Test observable outcomes. Prefer focused unit tests for pure logic, integration tests for API/database boundaries, and a small number of browser/device tests for critical journeys. Test valid input, invalid input, unavailable dependencies, and recovery behavior. Run the repository’s real commands; do not report a skipped or absent test suite as passing.
