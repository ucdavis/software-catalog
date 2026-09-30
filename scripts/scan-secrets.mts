import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Scan current contents, including unstaged edits and new non-ignored files.
// A snapshot avoids scanning local .env files, dependencies, or build output.
export function createScanSnapshot(repoRoot: string): string {
  const files = execFileSync('git', [
    'ls-files', '--cached', '--others', '--exclude-standard', '--deduplicate', '-z',
  ], { cwd: repoRoot, encoding: 'utf8' }).split('\0').filter(Boolean);
  const snapshot = mkdtempSync(join(tmpdir(), 'software-catalog-secrets-'));
  try {
    for (const file of files) {
      const source = join(repoRoot, file);
      const stat = lstatSync(source, { throwIfNoEntry: false });
      if (!stat) continue; // Deleted tracked files have no current contents.
      if (!stat.isFile()) {
        throw new Error(`Secret scan cannot inspect non-regular file: ${file}`);
      }
      const destination = join(snapshot, file);
      mkdirSync(dirname(destination), { recursive: true });
      copyFileSync(source, destination);
    }
    return snapshot;
  } catch (error) {
    rmSync(snapshot, { recursive: true, force: true });
    throw error;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const snapshot = createScanSnapshot(repoRoot);
  try {
    const result = spawnSync('gitleaks', ['dir', '--redact', '--no-banner', snapshot], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
    if (result.error) {
      console.error('Cannot run gitleaks. See docs/DEPENDENCY_UPDATES.md for installation.', result.error.message);
    }
    process.exitCode = result.status ?? 1;
  } finally {
    rmSync(snapshot, { recursive: true, force: true });
  }
}
