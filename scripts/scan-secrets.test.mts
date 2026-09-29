import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createScanSnapshot } from './scan-secrets.mts';

test('secret scan includes current tracked and new files, excluding ignored and deleted files', (t) => {
  const repo = mkdtempSync(join(tmpdir(), 'software-catalog-scan-test-'));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet', repo]);
  writeFileSync(join(repo, '.gitignore'), '.env\n');
  writeFileSync(join(repo, 'tracked file.txt'), 'staged contents');
  writeFileSync(join(repo, 'deleted.txt'), 'deleted contents');
  execFileSync('git', ['add', '.'], { cwd: repo });
  writeFileSync(join(repo, 'tracked file.txt'), 'unstaged contents');
  writeFileSync(join(repo, 'new file.txt'), 'new contents');
  writeFileSync(join(repo, '.env'), 'ignored local configuration');
  unlinkSync(join(repo, 'deleted.txt'));

  const snapshot = createScanSnapshot(repo);
  t.after(() => rmSync(snapshot, { recursive: true, force: true }));
  assert.equal(readFileSync(join(snapshot, 'tracked file.txt'), 'utf8'), 'unstaged contents');
  assert.equal(readFileSync(join(snapshot, 'new file.txt'), 'utf8'), 'new contents');
  assert.equal(existsSync(join(snapshot, '.env')), false);
  assert.equal(existsSync(join(snapshot, '.git')), false);
  assert.equal(existsSync(join(snapshot, 'deleted.txt')), false);
});

test('secret scan rejects symlinks instead of following them outside the checkout', (t) => {
  const repo = mkdtempSync(join(tmpdir(), 'software-catalog-scan-test-'));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet', repo]);
  symlinkSync(tmpdir(), join(repo, 'outside'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => createScanSnapshot(repo), /non-regular file/);
});
