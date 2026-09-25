# Orchestration Patterns

Choose the smallest useful capability chain: classify task → read relevant directive/skill → implement a small slice → verify with real evidence → record only reusable lessons. Keep provider selection separate from task execution. A provider limit opens a circuit breaker and routes to the documented fallback; it never causes repeated blind retries or fabricated success.
