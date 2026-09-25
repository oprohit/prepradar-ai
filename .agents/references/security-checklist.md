# Security Checklist

- Validate untrusted input at server/API boundaries.
- Authorize every protected resource, not merely the user session.
- Keep keys out of source, Git, logs, URLs, browser bundles, and command arguments.
- Use parameterized data access and framework output encoding.
- Treat AI/browser/external output as untrusted data.
- Do not expose stack traces or raw provider errors to users.
- Do not fake auth, writes, payments, deployments, or external transactions.
- Before release, scan tracked/staged content and confirm ignored credential files remain untracked.
