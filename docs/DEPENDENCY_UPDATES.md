# Dependency updates and security checks

This repository follows Mailbroker's dependency automation policy. Dependabot
opens weekly updates for npm (root and client), NuGet, and GitHub Actions.
Each ecosystem has a seven-day release cooldown and at most one open version-update
PR. Minor and patch updates are grouped; major upgrades have separate PRs for deliberate review. Separate security-update groups are not subject
to the version-update cooldown or one-PR limit.

## Local checks and CI

Install Node.js and .NET as described in the README. The security commands also
need actionlint 1.7.12, zizmor 1.30.1, and Gitleaks 8.30.1. On macOS these tools are
available through Homebrew (`brew install actionlint zizmor gitleaks`); check the
installed versions when comparing local and CI results. CI installs pinned Linux
binaries and verifies the release asset SHA-256 values in
[security.yml](../.github/workflows/security.yml). Update binary versions and
checksums together; Dependabot updates Action references, not these release URLs.

| Command | Checks |
| --- | --- |
| `npm run test:tooling` | Dependency approval policy and secret-scan file selection |
| `npm run deployment-settings:typecheck` | TypeScript support scripts, including tooling tests |
| `npm run security:npm` | Root and client npm advisories |
| `npm run security:nuget` | All NuGet dependencies; advisories and unavailable audit sources fail |
| `npm run security:workflows` | actionlint and offline Zizmor on all workflow configuration |
| `npm run security:workflows:all` | Alias for the same complete workflow audit |
| `npm run security:secrets` | Gitleaks on current tracked and new non-ignored files, excluding deleted files and rejecting symlinks |
| `npm run security:history` | Gitleaks on all locally available Git history |
| `npm run security` | Dependency, workflow, and current-file secret checks |

The `Software catalog security` check runs dependency audits, workflow
checks, and both secret scans on PRs, pushes to `main`, weekly, and manual runs.
It fails when a scanner fails; it does not upload SARIF. CodeQL runs separately
and uploads C# and JavaScript/TypeScript results to GitHub code scanning.
`Validate` also runs the tooling tests and script type-checking.

The complete workflow audit includes deployment workflows as well as security
and dependency automation. Two narrow `self-repository` exceptions cover the
existing `./.github/workflows/...` calls: GitHub resolves those reusable workflows
from the caller's commit, as documented under
[`jobs.<job_id>.uses`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_iduses).
Actionlint continues to validate them. No tool or required check is disabled.

## Approval and auto-merge

The trusted `pull_request_target` workflow uses the policy from `main`. It never
checks out or executes PR code. It verifies Dependabot's immutable author ID,
metadata and commit signatures, the current head, the target repository and
branch, the full commit chain, and an explicit per-ecosystem file allowlist.
Additional commits must be signed base merges that preserve the original update.
Unknown files, source changes, additions, deletions, renames, or unverifiable
metadata require manual review.

Eligible updates receive a GitHub Actions approval for the verified head and are
queued for native squash auto-merge with `--match-head-commit`. Major updates are
eligible under the same verified-head approval policy; separate PRs keep their
migration requirements reviewable. Tests cover rejection paths,
stale-head races, changed merge contents, missing checks, and GitHub API failures.

The policy checks the active `main` rules before approving. It requires:

- At least one approval, dismissal of stale approvals, and resolved review threads.
- An up-to-date branch and `Validate` plus `Software catalog security` from GitHub
  Actions, `CodeRabbit` from the CodeRabbit app, and `Codacy Static Code Analysis`
  from the Codacy app.

Repository auto-merge and squash merging must be enabled, and Actions must be
allowed to approve PRs. Code-owner approval is not required; `CODEOWNERS` still
identifies the maintainer and requests reviews. No administrator bypass or
personal access token is used. GitHub waits for all required checks and review
requirements before merging; policy approval alone does not authorize an
immediate merge.

## Rollout

Policy changes must be committed, pushed, and merged to `main` through the normal
review process. The security check can first run on the
setup PR, while the trusted auto-merge workflow takes effect only after it reaches
`main`. Existing dependency PRs need a new eligible event (for example a Dependabot
update or rebase) after rollout. Old PRs may require recreation if their changes
do not match the current dependency manifests or policy.

Require `Software catalog security` as an app-bound GitHub Actions status check
when deploying this policy. Its absence intentionally prevents automated approval.
Only require CodeQL scanning results after successful baseline and PR analyses.
Enabling auto-merge policy does not bypass CodeQL if that requirement is later added.
Security updates are a separate repository setting; verify that they are enabled
and not paused. GitHub may pause Dependabot in inactive repositories. An enable
request can leave the API reporting the inactivity pause; updating Dependabot
configuration on `main` is a documented reactivation event. Verify the pause
state again after rollout instead of treating an accepted enable request as proof.

Local tests do not prove that GitHub can approve and merge a real Dependabot PR.
The first eligible event after merge provides that integration evidence.

## CodeRabbit


`.coderabbit.yaml` adapts Mailbroker's chill profile, required-review workflow,
single `CodeRabbit` commit status, failing status on review issues, automatic
incremental reviews (including drafts and bot-authored updates), and disabled
docstring percentage gate. Path guidance points to the repository's architecture
and policy documents instead of duplicating application contracts. ESLint,
actionlint, ShellCheck, Gitleaks, and GitHub check integration are enabled.
Semgrep is deferred until repository-owned rules and fixtures exist.

Treat the commit status, latest review decision, and unresolved threads as three
separate signals. A completed review is not necessarily an approval. Check every
finding against current source; fix genuine defects, and explain false positives
with evidence. Do not weaken checks, dismiss reviews, or resolve genuine findings
to get a green PR. See [local commands](TESTING.md#security-and-local-review).
