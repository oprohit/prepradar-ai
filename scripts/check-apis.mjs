#!/usr/bin/env node

/**
 * scripts/check-apis.mjs
 * Safe pre-flight diagnostic script for application runtime APIs.
 *
 * Requirements:
 * - Node 18+
 * - Zero external dependencies
 * - Never prints or leaks secrets or authorization headers
 * - Never puts API keys in URLs
 * - Safe timeouts and harmless read-only checks
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < 18) {
  console.error(`FAIL: Node.js 18+ is required. Current version is ${process.version}`);
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const envVars = {
  ...parseEnv(envPath),
  ...process.env,
};

let hasDefinitiveFailure = false;

console.log('='.repeat(60));
console.log('API Pre-Flight Diagnostic Report');
console.log(`Time: ${new Date().toISOString()}`);
console.log(`Environment file: ${fs.existsSync(envPath) ? '.env present' : '.env not found (checking process env)'}`);
console.log('='.repeat(60));

async function checkGemini() {
  const apiKey = envVars.GEMINI_API_KEY?.trim();
  const configuredModel = envVars.GEMINI_MODEL?.trim();

  if (!apiKey) {
    console.log('\n[Gemini API]');
    console.log('  Status: SKIPPED');
    console.log('  Reason: GEMINI_API_KEY is not set in environment or .env');
    return;
  }

  console.log('\n[Gemini API]');
  console.log('  Configuration: PRESENT (Value hidden)');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`  Status: FAIL (HTTP ${response.status} ${response.statusText})`);
      hasDefinitiveFailure = true;
      return;
    }

    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models : [];
    console.log('  Status: OK (Authenticated)');
    console.log(`  Discovered Models: ${models.length} total models`);

    const contentModels = models.filter(m => 
      Array.isArray(m.supportedGenerationMethods) && 
      m.supportedGenerationMethods.includes('generateContent')
    );

    console.log(`  Models supporting generateContent: ${contentModels.length}`);

    const flashModels = contentModels.filter(m => 
      m.name.toLowerCase().includes('flash')
    ).map(m => m.name.replace(/^models\//, ''));

    console.log(`  Flash / Low-Latency candidates: ${flashModels.slice(0, 5).join(', ')}${flashModels.length > 5 ? '...' : ''}`);

    if (configuredModel) {
      const match = contentModels.find(m => 
        m.name === configuredModel || m.name === `models/${configuredModel}`
      );
      if (match) {
        console.log(`  Configured GEMINI_MODEL (${configuredModel}): OK (Verified generateContent support)`);
      } else {
        console.log(`  Configured GEMINI_MODEL (${configuredModel}): WARN (Not found among generateContent models)`);
      }
    } else {
      console.log('  Configured GEMINI_MODEL: SKIPPED/UNSET (Choose model once project requirements are known)');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('  Status: FAIL (Request timed out after 6000ms)');
    } else {
      console.log(`  Status: FAIL (${err.message})`);
    }
    hasDefinitiveFailure = true;
  }
}

async function checkSupabase() {
  const url = envVars.SUPABASE_URL?.trim();
  const publishableKey = envVars.SUPABASE_PUBLISHABLE_KEY?.trim() || envVars.SUPABASE_ANON_KEY?.trim();
  const secretKey = envVars.SUPABASE_SECRET_KEY?.trim() || envVars.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url && !publishableKey && !secretKey) {
    console.log('\n[Supabase API]');
    console.log('  Status: SKIPPED');
    console.log('  Reason: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY are not configured');
    return;
  }

  console.log('\n[Supabase API]');

  if (!url) {
    console.log('  Status: FAIL');
    console.log('  Reason: SUPABASE_URL is missing while keys are provided');
    hasDefinitiveFailure = true;
    return;
  }

  let cleanUrl;
  try {
    cleanUrl = new URL(url).origin;
    console.log(`  Project Host: ${cleanUrl}`);
  } catch {
    console.log(`  Status: FAIL (Invalid SUPABASE_URL format)`);
    hasDefinitiveFailure = true;
    return;
  }

  // 1. Harmless read-only check for Publishable Key (Client Auth settings endpoint)
  if (publishableKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${cleanUrl}/auth/v1/settings`, {
        method: 'GET',
        headers: {
          'apikey': publishableKey,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        console.log('  Publishable Key: OK (Client / Auth endpoint authenticated)');
      } else {
        console.log(`  Publishable Key: FAIL (HTTP ${response.status} ${response.statusText})`);
        hasDefinitiveFailure = true;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('  Publishable Key: FAIL (Request timed out after 6000ms)');
      } else {
        console.log(`  Publishable Key: FAIL (${err.message})`);
      }
      hasDefinitiveFailure = true;
    }
  } else {
    console.log('  Publishable Key: SKIPPED (Unset)');
  }

  // 2. Harmless read-only check for Secret Key (PostgREST OpenAPI schema root)
  if (secretKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${cleanUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': secretKey,
          'Authorization': `Bearer ${secretKey}`,
          'Accept': 'application/openapi+json, application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        console.log('  Secret Key: OK (Admin / PostgREST endpoint authenticated)');
      } else {
        console.log(`  Secret Key: FAIL (HTTP ${response.status} ${response.statusText})`);
        hasDefinitiveFailure = true;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('  Secret Key: FAIL (Request timed out after 6000ms)');
      } else {
        console.log(`  Secret Key: FAIL (${err.message})`);
      }
      hasDefinitiveFailure = true;
    }
  } else {
    console.log('  Secret Key: SKIPPED (Unset)');
  }
}

function checkOptionalApis() {
  const optionalKeys = [
    'FIREBASE_API_KEY',
    'GOOGLE_MAPS_API_KEY',
    'ELEVENLABS_API_KEY'
  ];

  console.log('\n[Other Optional Services]');
  let anyConfigured = false;
  for (const key of optionalKeys) {
    const val = envVars[key]?.trim();
    if (val) {
      anyConfigured = true;
      console.log(`  ${key}: CONFIGURED (Value hidden) — UNTESTED`);
    } else {
      console.log(`  ${key}: SKIPPED (Unset)`);
    }
  }

  if (!anyConfigured) {
    console.log('  Summary: No other optional specialist APIs configured.');
  }
}

async function run() {
  await checkGemini();
  await checkSupabase();
  checkOptionalApis();

  console.log('\n' + '='.repeat(60));
  if (hasDefinitiveFailure) {
    console.log('Diagnostic finished with FAILURES.');
    process.exit(1);
  } else {
    console.log('Diagnostic finished: ALL CHECKS PASSED OR CLEANLY SKIPPED.');
    process.exit(0);
  }
}

run();
