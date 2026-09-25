import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const node = process.execPath;

function run(relativePath, args = []) {
  return spawnSync(node, [path.join(root, relativePath), ...args], {
    cwd: root,
    encoding: 'utf8',
  });
}

test('API checker is offline by default and rejects broad live probes', () => {
  const offline = run('execution/check-apis.mjs');
  assert.equal(offline.status, 0);
  assert.match(offline.stdout, /OFFLINE, no provider calls/);

  const broadLive = run('execution/check-apis.mjs', ['--live']);
  assert.equal(broadLive.status, 2);
  assert.match(broadLive.stderr, /requires --service/);
});

test('API checker reports invalid provider configuration without throwing', () => {
  const result = spawnSync(node, [path.join(root, 'execution', 'check-apis.mjs'), '--live', '--service', 'supabase'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, SUPABASE_URL: 'not-a-url' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Supabase API: INVALID_CONFIGURATION/);
  assert.doesNotMatch(result.stderr, /TypeError|ERR_INVALID_URL/);
});

test('build and deployment gates do not turn missing inputs into passes', () => {
  const build = run('execution/verify-build.mjs');
  assert.equal(build.status, 2);
  assert.match(build.stdout, /SKIPPED: package\.json is absent/);

  const deployment = run('execution/verify-deployment.mjs');
  assert.equal(deployment.status, 2);
  assert.match(deployment.stderr, /SKIPPED: provide a public HTTPS URL/);
});

test('demo scripts require explicit mode and only manage marked local state', () => {
  const activeState = path.join(root, 'demo-data', 'scenario.json');
  fs.rmSync(activeState, { force: true });

  const deniedSeed = run('execution/seed-demo.mjs');
  assert.equal(deniedSeed.status, 2);
  assert.equal(fs.existsSync(activeState), false);

  const seed = run('execution/seed-demo.mjs', ['--demo']);
  assert.equal(seed.status, 0);
  assert.equal(JSON.parse(fs.readFileSync(activeState, 'utf8')).environment, 'DEMO_MODE');

  const reset = run('execution/reset-demo.mjs', ['--demo']);
  assert.equal(reset.status, 0);
  assert.equal(fs.existsSync(activeState), false);
});

test('integrity gate supports a deliberate dirty-worktree infrastructure check', () => {
  const verification = run('execution/verify-project.mjs', ['--allow-dirty']);
  assert.equal(verification.status, 0, verification.stderr);
  assert.match(verification.stdout, /baseline-before-test resolves/);
});
