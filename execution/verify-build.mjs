#!/usr/bin/env node

/**
 * Build gate. A missing application manifest is a skipped check, never a pass.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');
const packagePath = path.join(projectRoot, 'package.json');

function run(command, args, useShell = false) {
  execFileSync(command, args, { cwd: projectRoot, stdio: 'inherit', shell: useShell });
}

function scriptFiles(directory) {
  const absolute = path.join(projectRoot, directory);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute)
    .filter((name) => name.endsWith('.mjs'))
    .map((name) => path.join(directory, name));
}

console.log('BUILD VERIFICATION');

let syntaxFailure = false;
for (const file of [...scriptFiles('execution'), ...scriptFiles('scripts')]) {
  try {
    run(process.execPath, ['--check', file], false);
    console.log(`PASS: ${file} syntax`);
  } catch {
    console.error(`FAIL: ${file} syntax`);
    syntaxFailure = true;
  }
}

if (syntaxFailure) process.exit(1);

if (!fs.existsSync(packagePath)) {
  console.log('SKIPPED: package.json is absent; no application build was run.');
  process.exit(2);
}

let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
} catch (error) {
  console.error(`FAIL: package.json is invalid (${error.message})`);
  process.exit(1);
}

if (!pkg.scripts?.build) {
  console.log('SKIPPED: package.json has no build script; no application build was run.');
  process.exit(2);
}

try {
  run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], process.platform === 'win32');
  console.log('PASS: production build completed.');
} catch {
  console.error('FAIL: production build failed.');
  process.exit(1);
}
