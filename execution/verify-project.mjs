#!/usr/bin/env node

/**
 * Project integrity gate for release and handoff.
 *
 * Fails on a dirty worktree unless --allow-dirty is supplied for a local
 * infrastructure check. It never prints secret values.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');
const allowDirty = process.argv.includes('--allow-dirty');
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function gitGrepPaths(pattern, cached = false) {
  const args = ['grep', '-I', '-l', '-E'];
  if (cached) args.push('--cached');
  args.push('-e', pattern);
  if (!cached) args.push('HEAD');
  args.push('--');
  try {
    return git(args).split(/\r?\n/).filter(Boolean);
  } catch (error) {
    if (error.status === 1) return [];
    throw error;
  }
}

function verifyGitState() {
  try {
    const tagCommit = git(['rev-parse', '--verify', 'baseline-before-test^{commit}']);
    pass(`baseline-before-test resolves to ${tagCommit.slice(0, 12)}`);
  } catch {
    fail('baseline-before-test is missing or does not resolve to a commit');
  }

  try {
    const status = git(['status', '--porcelain']);
    if (status) {
      const count = status.split(/\r?\n/).length;
      const message = `working tree has ${count} modified or untracked path(s)`;
      if (allowDirty) console.warn(`WARN: ${message} (--allow-dirty)`);
      else fail(message);
    } else {
      pass('working tree is clean');
    }
  } catch (error) {
    fail(`cannot read Git status (${error.message})`);
  }
}

function verifySecretProtection() {
  const sensitivePath = /(^|\/)(\.env(?:\..*)?|credentials\.json|token\.json)$|\.(?:pem|key)$/i;
  const requiredIgnoreRules = ['.env', '.env.*', '!.env.example', 'credentials.json', 'token.json', '*.pem', '*.key'];

  try {
    const tracked = git(['ls-files']).split(/\r?\n/).filter(Boolean);
    const riskyFiles = tracked.filter((file) => sensitivePath.test(file) && !file.endsWith('.env.example'));
    if (riskyFiles.length) fail(`sensitive paths are tracked: ${riskyFiles.join(', ')}`);
    else pass('no sensitive credential paths are tracked');

    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      fail('.gitignore is missing');
    } else {
      const ignoreRules = fs.readFileSync(gitignorePath, 'utf8');
      const missing = requiredIgnoreRules.filter((rule) => !ignoreRules.includes(rule));
      if (missing.length) fail(`.gitignore lacks required secret rules: ${missing.join(', ')}`);
      else pass('.gitignore covers environment files and key material');
    }

    const signatures = [
      '-----BEGIN [A-Z ]*PRIVATE KEY-----',
      '\\bAKIA[0-9A-Z]{16}\\b',
      '\\bgh[pousr]_[A-Za-z0-9_]{20,}\\b',
      '\\bAIza[0-9A-Za-z_-]{20,}\\b',
    ];
    const leaked = new Set();
    for (const signature of signatures) {
      gitGrepPaths(signature).forEach((file) => leaked.add(file));
      gitGrepPaths(signature, true).forEach((file) => leaked.add(file));
    }
    if (leaked.size) fail(`credential-like signatures found in tracked or staged content: ${[...leaked].join(', ')}`);
    else pass('no high-confidence credential signatures found in tracked or staged content');
  } catch (error) {
    fail(`secret scan could not complete (${error.message})`);
  }
}

function verifyDirectives() {
  const expected = [
    'frontend-feature.md', 'fullstack-feature.md', 'mobile-feature.md',
    'mobile-pc-realtime.md', 'api-integration.md', 'database-change.md',
    'debugging.md', 'deployment.md', 'hackathon-feature.md', 'release.md',
    'mcp-integration.md',
  ];
  const sections = [
    'Objective', 'When to Use', 'Inputs', 'Preconditions', 'Required Tools',
    'Ordered Execution Steps', 'Validation Steps', 'Failure Handling',
    'Security & Cost Constraints', 'Outputs', 'Definition of Done',
  ];

  for (const name of expected) {
    const file = path.join(projectRoot, 'directives', name);
    if (!fs.existsSync(file)) {
      fail(`missing directives/${name}`);
      continue;
    }
    const content = fs.readFileSync(file, 'utf8');
    const missing = sections.filter((section) => !content.includes(section));
    if (missing.length) fail(`directives/${name} lacks: ${missing.join(', ')}`);
  }
  if (failures === 0) pass('required directives have complete standard sections');
}

function verifySkills() {
  const skillRoot = path.join(projectRoot, '.agents', 'skills');
  if (!fs.existsSync(skillRoot)) {
    fail('.agents/skills is missing');
    return;
  }

  const names = new Set();
  let count = 0;
  for (const entry of fs.readdirSync(skillRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(skillRoot, entry.name, 'SKILL.md');
    if (!fs.existsSync(file)) {
      fail(`skills/${entry.name}/SKILL.md is missing`);
      continue;
    }
    count += 1;
    const content = fs.readFileSync(file, 'utf8');
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const name = frontmatter?.[1].match(/^name:\s*([^\r\n]+)$/m)?.[1]?.trim();
    const description = frontmatter?.[1].match(/^description:\s*([^\r\n]+)$/m)?.[1]?.trim();
    if (!name || !description) {
      fail(`skills/${entry.name} has invalid or incomplete frontmatter`);
      continue;
    }
    if (name !== entry.name) fail(`skills/${entry.name} frontmatter name does not match directory (${name})`);
    if (names.has(name)) fail(`duplicate skill name: ${name}`);
    names.add(name);

    const referencePattern = /(?:\.\.?[\\/]+|references[\\/])[\w.\\/-]+\.md/g;
    for (const match of content.matchAll(referencePattern)) {
      const target = path.resolve(path.dirname(file), match[0].replaceAll('/', path.sep));
      if (!fs.existsSync(target)) {
        fail(`skills/${entry.name} has unresolved reference: ${match[0]}`);
      }
    }
  }
  if (count && names.size === count) pass(`${count} skills have unique, directory-matched frontmatter`);
}

console.log('PROJECT INTEGRITY GATE');
verifyGitState();
verifySecretProtection();
verifyDirectives();
verifySkills();

if (failures) {
  console.error(`Project verification failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log('Project verification passed.');
