# Codacy analysis policy

Codacy's quality gate remains at zero new issues of minor severity or higher.
Keep CodeQL, compiler nullable analysis, frontend ESLint, and the security workflow
in place. Do not exclude entire source languages or test directories to silence
individual rules.

## Active toolset

On 2026-09-29, this repository was assigned only to
`Copy of Default coding standard`, with four enabled tools and 206 patterns.
The organization's `Default coding standard` is no longer assigned here.
Configure tools through Codacy's coding standards UI; `.codacy.yml` cannot
enable or disable tools. Multiple assigned standards combine their enabled
rules, so assigning the default again would restore the unwanted scanners.

| Surface | Checks |
| --- | --- |
| C# | Codacy SonarC# (163 rules), .NET build and tests, CodeQL |
| TypeScript/React | Repository ESLint 9 configuration in CI, TypeScript build, Vitest, CodeQL |
| Bicep/Azure | CI builds `main.bicep` and `github-oidc.bicep`, including their modules, with the Bicep compiler and native linter |
| Markdown | Codacy markdownlint: MD011, MD018, MD019, MD042, MD045 (link syntax, heading spacing, empty links, image alt text) |
| Dockerfiles | Codacy Hadolint (23 rules) |
| Shell | Codacy ShellCheck (15 rules) |
| Dependencies, secrets, workflows | npm/NuGet audits, Dependabot, Gitleaks, actionlint, zizmor |

All other Codacy tools are disabled, including Opengrep, Lizard, hosted ESLint,
Agentlinter, PMD, Stylelint, and Trivy. This avoids duplicate TypeScript,
dependency, security, and formatting checks. SonarC# retains its existing rules
except S2360 (optional parameters) and S2339 (public constants), which conflict
with intentional API and configuration contracts. Markdown does not enforce
line length or broad formatting preferences.

## PR 125 triage

At commit `7ede633166e0ee41c36efca02cae6fc71c43f113`, the PR had 116 new
findings: 100 from the null-dereference rule, five from function length, five
from optional parameters, three from public constants, two from core ESLint
unused variables, and one from an interface-mandated test-double parameter.
The counts describe that scan, before the reduced toolset was applied. The
existing `S1172` suppression now includes `FakeNotificationService` as well as
`ThrowingNotificationService`; these methods must retain their interface's
parameter list.

| Rule | Findings | Disposition and reason |
| --- | ---: | --- |
| Opengrep `Semgrep_codacy.csharp.security.null-dereference` | 100 | Skip: the syntactic rule does not model `ThrowIfNull`, nullable flow, value types, or ASP.NET dependency injection. Retain C# nullable analysis and CodeQL; Opengrep is disabled. |
| SonarC# `SonarCSharp_S2360` | 5 | Skip: optional cancellation tokens and recipient lists are intentional API contracts. Rule disabled. |
| SonarC# `SonarCSharp_S2339` | 3 | Skip: configuration section and authentication scheme names are intentional constants. Rule disabled. |
| Lizard `Lizard_nloc-medium` | 5 | Skip: it misparses the CSV helper and counts JSX layout and test setup as oversized methods. Lizard is disabled. Earlier actual complexity findings were refactored. |
| ESLint `ESLint8_no-unused-vars` | 2 | Skip: these are TypeScript function-type parameter names. Hosted ESLint is disabled; the repository's TypeScript-aware unused-variable rule remains enabled. |
| SonarC# `SonarCSharp_S1172` | 1 | Extend the existing narrow test-double suppression to the remaining interface implementation. |

## Repository changes

| Rule | Findings | Disposition |
| --- | ---: | --- |
| SonarC# `S1172` | 15 | Remove the unused argument from the placeholder role helper. Suppress only this rule around the three affected groups of test doubles, whose method signatures must implement their interfaces. |
| SonarC# `S2068` | 3 | Remove sample passwords from startup diagnostics. Suppress the single synthetic credential URL that tests rejection of credential-bearing links. |
| Hadolint `DL3008` | 2 | Document per-instruction exceptions for packages in rolling development/sandbox images; keep package patch updates available. |
| Hadolint `DL4001` | 1 | Use curl consistently in the development Dockerfile. |
| Lizard `file-nloc-medium` | 1 | Exclude generated npm lockfiles from Lizard only. Dependency and security scans still include them. |
| Lizard `ccn-medium` | 2 | Extract local authentication registration, table-row parsing, and plain-text table composition. Preserve validation order, row snapshots, and authentication behavior. |
| Opengrep mass-assignment audit | 1 | Suppress only the fixed-name login view return. Its scalar URL is validated with `IsLocalUrl`; no entity is bound or persisted. |
| SonarC# `S2737` | 1 | Replace cancellation rethrow catches with exception filters in both notification actions so cancellation propagates without becoming a delivery failure. |

The existing Bicep exclusion applies only to Codacy metrics because Codacy failed
to find a Bicep metrics tool. It does not affect native Bicep validation in CI.

## Verification

The reduced standard was saved and the repository's active tool toggles were
verified. A fresh Codacy analysis of PR 125 at commit `7ede633` reduced the
new-finding count from 116 to one: S1172 on the test-double cancellation token.
Local verification passed frontend ESLint, the ten notification controller
tests, actionlint, and `npm run security:workflows`. Hosted analysis must rerun
after the local test-double suppression is pushed to verify its handling of
that suppression.

References:

- [Codacy configuration and default-branch precedence](https://docs.codacy.com/repositories-configure/codacy-configuration-file/)
- [Codacy coding standards](https://docs.codacy.com/organizations/using-coding-standards/)
- [Codacy's null-dereference rule source](https://github.com/codacy/codacy-opengrep/blob/master/docs/codacy-rules.yaml)
- [Codacy code-pattern settings](https://docs.codacy.com/repositories-configure/configuring-code-patterns/)
