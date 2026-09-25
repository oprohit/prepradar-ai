#!/usr/bin/env node

/**
 * Copies an explicit project demo template into the ignored active demo state.
 * This local helper never contacts a database or external service.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');
const demoDirectory = path.join(projectRoot, 'demo-data');
const templatePath = path.join(demoDirectory, 'scenario.template.json');
const activePath = path.join(demoDirectory, 'scenario.json');

if (!process.argv.includes('--demo')) {
  console.error('Refusing to seed demo state without --demo.');
  process.exit(2);
}

if (!fs.existsSync(templatePath)) {
  console.error('No demo template found at demo-data/scenario.template.json.');
  process.exit(2);
}

let scenario;
try {
  scenario = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
} catch {
  console.error('Demo template is not valid JSON.');
  process.exit(1);
}

if (scenario.environment !== 'DEMO_MODE') {
  console.error('Demo template must declare environment: "DEMO_MODE".');
  process.exit(1);
}

fs.writeFileSync(activePath, `${JSON.stringify(scenario, null, 2)}\n`, 'utf8');
console.log(`PASS: seeded explicit demo state at ${activePath}`);
