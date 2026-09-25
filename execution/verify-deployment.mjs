#!/usr/bin/env node

/** Verify an explicitly supplied public HTTPS deployment endpoint. */

import { performance } from 'node:perf_hooks';

const targetUrl = process.argv[2] || process.env.DEPLOYED_URL;

function isPrivateHost(hostname) {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host === '::1') return true;
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true;
  const match = host.match(/^172\.(\d+)\./);
  return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
}

if (!targetUrl) {
  console.error('SKIPPED: provide a public HTTPS URL as an argument or DEPLOYED_URL.');
  process.exit(2);
}

let parsed;
try {
  parsed = new URL(targetUrl);
} catch {
  console.error('FAIL: deployment URL is invalid.');
  process.exit(2);
}

if (parsed.protocol !== 'https:' || parsed.username || parsed.password || isPrivateHost(parsed.hostname)) {
  console.error('FAIL: deployment verification accepts only public HTTPS URLs without embedded credentials.');
  process.exit(2);
}

try {
  const startedAt = performance.now();
  const response = await fetch(parsed, {
    method: 'GET',
    headers: { Accept: 'text/html,application/json' },
    redirect: 'error',
    signal: AbortSignal.timeout(8_000),
  });
  const duration = Math.round(performance.now() - startedAt);
  console.log(`Target: ${parsed.origin}${parsed.pathname}`);
  console.log(`HTTP: ${response.status}`);
  console.log(`Latency: ${duration}ms`);

  if (!response.ok) {
    console.error('FAIL: deployment returned a non-2xx response.');
    process.exit(1);
  }

  console.log('PASS: endpoint is publicly reachable. Verify the critical user journey separately in a browser.');
} catch (error) {
  console.error(`FAIL: deployment request failed (${error.name}).`);
  process.exit(1);
}
