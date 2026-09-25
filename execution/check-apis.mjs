#!/usr/bin/env node

/**
 * Targeted API readiness checker.
 *
 * Default mode is offline and never contacts a provider. Use --live together
 * with one or more --service values immediately before integrating that service.
 * It never retries, prints credentials, or claims that a successful response
 * proves a plan, quota, or cost status.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');
const envPath = path.join(projectRoot, '.env');
const defaultMcpConfigPath = path.join(
  process.env.USERPROFILE || process.env.HOME || '',
  '.gemini',
  'config',
  'mcp_config.json',
);
const mcpConfigPath = process.env.MCP_CONFIG_PATH || defaultMcpConfigPath;
const timeoutMs = 5_000;

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function loadMcpServers() {
  if (!fs.existsSync(mcpConfigPath)) return { servers: {}, state: 'not found' };
  try {
    const parsed = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    return { servers: parsed.mcpServers || {}, state: 'loaded' };
  } catch {
    return { servers: {}, state: 'invalid JSON' };
  }
}

function configuredValue(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
}

function parseOptions(argv) {
  const services = new Set();
  let live = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--live') {
      live = true;
      continue;
    }
    if (arg === '--service') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--service requires a service name');
      value.split(',').filter(Boolean).forEach((name) => services.add(name.trim().toLowerCase()));
      index += 1;
      continue;
    }
    if (arg.startsWith('--service=')) {
      arg.slice('--service='.length).split(',').filter(Boolean).forEach((name) => services.add(name.trim().toLowerCase()));
      continue;
    }
    if (arg === '--help' || arg === '-h') return { help: true, live, services };
    throw new Error(`Unknown option: ${arg}`);
  }

  return { help: false, live, services };
}

function statusFromResponse(response) {
  if (response.ok) return 'AVAILABLE';
  if (response.status === 402) return 'BILLING_OR_PLAN_LIMIT';
  if (response.status === 429) return 'RATE_LIMIT';
  if (response.status === 401 || response.status === 403) return 'AUTH_OR_PERMISSION_FAILURE';
  return `HTTP_${response.status}`;
}

async function request(url, options = {}) {
  try {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
    return statusFromResponse(response);
  } catch (error) {
    return error.name === 'TimeoutError' ? 'TIMEOUT' : 'UNREACHABLE';
  }
}

const fileEnv = parseEnv(envPath);
const env = { ...fileEnv, ...process.env };
const mcp = loadMcpServers();
const mcpEnv = (name, ...keys) => configuredValue(...keys.map((key) => mcp.servers[name]?.env?.[key]));

const services = {
  gemini: {
    label: 'Gemini API',
    configured: () => configuredValue(env.GEMINI_API_KEY),
    probe: (key) => request('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: { 'x-goog-api-key': key, Accept: 'application/json' },
    }),
  },
  supabase: {
    label: 'Supabase API',
    configured: () => configuredValue(env.SUPABASE_URL) && configuredValue(env.SUPABASE_PUBLISHABLE_KEY, env.SUPABASE_ANON_KEY),
    probe: () => {
      try {
        const origin = new URL(configuredValue(env.SUPABASE_URL)).origin;
        const key = configuredValue(env.SUPABASE_PUBLISHABLE_KEY, env.SUPABASE_ANON_KEY);
        return request(`${origin}/auth/v1/settings`, { headers: { apikey: key, Accept: 'application/json' } });
      } catch {
        return Promise.resolve('INVALID_CONFIGURATION');
      }
    },
  },
  figma: {
    label: 'Figma API',
    configured: () => configuredValue(mcpEnv('figma', 'FIGMA_API_KEY', 'FIGMA_PERSONAL_ACCESS_TOKEN'), env.FIGMA_API_KEY),
    probe: (key) => request('https://api.figma.com/v1/me', { headers: { 'X-Figma-Token': key } }),
  },
  postman: {
    label: 'Postman API',
    configured: () => configuredValue(mcpEnv('postman', 'POSTMAN_API_KEY'), env.POSTMAN_API_KEY),
    probe: (key) => request('https://api.getpostman.com/me', { headers: { 'X-Api-Key': key } }),
  },
  linear: {
    label: 'Linear API',
    configured: () => configuredValue(mcpEnv('linear', 'LINEAR_API_TOKEN', 'LINEAR_API_KEY'), env.LINEAR_API_KEY),
    probe: (key) => request('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: key },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
    }),
  },
  vercel: {
    label: 'Vercel API',
    configured: () => configuredValue(mcpEnv('vercel', 'VERCEL_API_TOKEN', 'VERCEL_TOKEN'), env.VERCEL_API_TOKEN),
    probe: (key) => request('https://api.vercel.com/v2/user', { headers: { Authorization: `Bearer ${key}` } }),
  },
  netlify: {
    label: 'Netlify API',
    configured: () => configuredValue(mcpEnv('netlify', 'NETLIFY_AUTH_TOKEN', 'NETLIFY_PERSONAL_ACCESS_TOKEN'), env.NETLIFY_AUTH_TOKEN),
    probe: (key) => request('https://api.netlify.com/api/v1/user', { headers: { Authorization: `Bearer ${key}` } }),
  },
};

function printUsage() {
  console.log('Usage: node execution/check-apis.mjs [--live --service <name[,name]>]');
  console.log(`Services: ${Object.keys(services).join(', ')}`);
  console.log('Without --live, this only reports whether credentials/configuration are present.');
}

async function main() {
  let options;
  try {
    options = parseOptions(process.argv.slice(2));
  } catch (error) {
    console.error(`Invalid options: ${error.message}`);
    printUsage();
    process.exit(2);
  }

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  if (options.live && options.services.size === 0) {
    console.error('Live mode requires --service so unrelated configured APIs are never probed.');
    process.exit(2);
  }

  const selected = options.services.size ? [...options.services] : Object.keys(services);
  const invalid = selected.filter((name) => !services[name]);
  if (invalid.length) {
    console.error(`Unknown service: ${invalid.join(', ')}`);
    printUsage();
    process.exit(2);
  }

  console.log('API READINESS CHECK');
  console.log(`Mode: ${options.live ? 'LIVE, targeted probe' : 'OFFLINE, no provider calls'}`);
  console.log(`Environment file: ${fs.existsSync(envPath) ? 'present' : 'not found'}`);
  console.log(`MCP configuration: ${mcp.state}`);

  let failed = false;
  for (const name of selected) {
    const service = services[name];
    const credential = service.configured();
    if (!credential) {
      console.log(`${service.label}: NOT_CONFIGURED`);
      continue;
    }
    if (!options.live) {
      console.log(`${service.label}: CONFIGURED (not probed)`);
      continue;
    }
    const status = await service.probe(credential);
    console.log(`${service.label}: ${status}`);
    if (status !== 'AVAILABLE') failed = true;
  }

  if (failed) {
    console.error('One or more requested services are unavailable. Stop using that service and select its documented fallback.');
    process.exit(1);
  }
}

main();
