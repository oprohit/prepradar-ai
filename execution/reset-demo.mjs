#!/usr/bin/env node

/** Remove only an explicit, marked local demo-state file. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');
const activePath = path.join(projectRoot, 'demo-data', 'scenario.json');

if (!process.argv.includes('--demo')) {
  console.error('Refusing to reset demo state without --demo.');
  process.exit(2);
}

if (!fs.existsSync(activePath)) {
  console.log('PASS: no active demo state exists.');
  process.exit(0);
}

try {
  const state = JSON.parse(fs.readFileSync(activePath, 'utf8'));
  if (state.environment !== 'DEMO_MODE') {
    console.error('Refusing to delete a file that is not marked DEMO_MODE.');
    process.exit(1);
  }
} catch {
  console.error('Refusing to delete unreadable or invalid demo state.');
  process.exit(1);
}

fs.unlinkSync(activePath);
console.log('PASS: active demo state reset.');
