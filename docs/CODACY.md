# Codacy analysis policy and PR 125 triage

Codacy's quality gate remains at zero new issues of minor severity or higher.
Keep CodeQL, compiler nullable analysis, frontend ESLint, and the security workflow
in place. Do not exclude entire source languages or test directories to silence
individual rules.

The API returned all 139 new findings for PR 125 at commit
`e53b9646bd9de72405205173b3bf8bc91ce9fdcd`; the dashboard displayed only 100.
The counts below describe that snapshot, not a prediction of the next scan.

## Proposed Codacy settings changes (not yet applied)

These five changes need to be made in Codacy's Code patterns settings. They are
not switches supported by `.codacy.yml`. Keep the tools and their other rules
enabled.

On 2026-09-29, an attempt to apply these settings through a duplicate of the
organization default was rolled back at the repository-assignment level. Saving
the duplicate changed Codacy's displayed totals from 32 tools / 2,825 patterns to
33 tools / 2,876 patterns, rather than the expected five-pattern reduction. The
editor showed the same enabled-tool list for both standards, so the additional
changes could not be verified. The repository continues to follow only
`Default coding standard`; the unassigned `Copy of Default coding standard`
contains the five deselected rules for inspection. Do not apply that copy until
the unexplained differences are resolved.

| Rule | Findings | Proposed change and reason |
| --- | ---: | --- |
| Opengrep `Semgrep_codacy.csharp.security.null-dereference` | 96 | Disable this low-confidence syntactic rule. It matches parameter uses, including static null guards, nullable-aware parsing helpers, and value-type parameters. It does not model `ThrowIfNull`, nullable flow, or ASP.NET dependency injection. Retain C# nullable analysis and CodeQL. |
| SonarC# `SonarCSharp_S2360` | 5 | Disable the preference for overloads over optional parameters. Optional cancellation tokens and optional recipient lists are intentional API contracts. |
| SonarC# `SonarCSharp_S2339` | 3 | Disable the preference for static properties over constants. Configuration section and authentication scheme names are intentional constants. |
| Lizard `Lizard_nloc-medium` | 7 | Disable the method line-count gate. It misparses the TypeScript CSV and notification helpers and counts JSX layout and test setup as oversized methods. Keep cyclomatic-complexity checks; the two actual complexity findings were refactored. |
| ESLint `ESLint8_no-unused-vars` | 2 | Disable the core JavaScript rule that flags TypeScript function-type parameter names. Keep the repository's TypeScript-aware unused-variable rule in CI; do not disable `@typescript-eslint/no-unused-vars`. |

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
to find a Bicep metrics tool. It does not exclude Bicep from security scanning.

## Verification

Local verification covers the backend test suite, frontend ESLint, YAML syntax,
and Lizard cyclomatic complexity. Hosted Codacy must rerun after the repository
changes are pushed and the proposed settings are applied to verify its own
handling of suppressions and the final finding count.

References:

- [Codacy configuration and default-branch precedence](https://docs.codacy.com/repositories-configure/codacy-configuration-file/)
- [Codacy's null-dereference rule source](https://github.com/codacy/codacy-opengrep/blob/master/docs/codacy-rules.yaml)
- [Codacy code-pattern settings](https://docs.codacy.com/repositories-configure/configuring-code-patterns/)
