#!/usr/bin/env node

/** Backward-compatible entry point for the canonical targeted API checker. */
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const canonicalChecker = path.resolve(path.dirname(__filename), '..', 'execution', 'check-apis.mjs');
const result = spawnSync(process.execPath, [canonicalChecker, ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);
