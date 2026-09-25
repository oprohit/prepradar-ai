# Performance Checklist

- Measure a user-visible bottleneck before optimizing.
- Avoid unbounded queries, unnecessary client work, and repeated network calls.
- Bound external operations with an appropriate timeout and cancellation.
- Inspect real browser/device performance before making claims.
- Do not turn a provider timeout into a false successful response.
