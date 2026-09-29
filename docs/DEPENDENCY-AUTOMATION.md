# Dependency updates and security checks

This repository follows Mailbroker's dependency automation policy. Dependabot
opens weekly grouped updates for npm (root and client), NuGet, and GitHub Actions.
Each ecosystem has a seven-day release cooldown and at most one open version-update
PR. Groups include major upgrades. Separate security-update groups are not subject
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
| `npm run security:workflows` | actionlint on every workflow; offline Zizmor on CodeQL, security, auto-merge, and Dependabot configuration |
| `npm run security:workflows:all` | actionlint and offline Zizmor on all workflow configuration |
| `npm run security:secrets` | Gitleaks on current tracked and new non-ignored files, excluding deleted files and rejecting symlinks |
| `npm run security:history` | Gitleaks on all locally available Git history |
| `npm run security` | Dependency, scoped workflow, and current-file secret checks |

The `Software catalog security` check runs dependency audits, scoped workflow
checks, and both secret scans on PRs, pushes to `main`, weekly, and manual runs.
It fails when a scanner fails; it does not upload SARIF. CodeQL runs separately
and uploads C# and JavaScript/TypeScript results to GitHub code scanning.
`Validate` also runs the tooling tests and script type-checking.

The full Zizmor audit is available separately because the inherited CI/CD workflow
uses two `./.github/workflows/...` reusable-workflow references that Zizmor 1.30.1
flags with its low-severity `self-repository` rule. These are not suppressed in the
full audit. The scoped gate follows Mailbroker's rollout pattern and does not
claim full Zizmor coverage of the deployment workflows.

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
eligible, matching the Dependabot grouping policy. Tests cover rejection paths,
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

The new workflows and configuration must be committed, pushed, and merged to
`main` through the normal review process. The security check can first run on the
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
