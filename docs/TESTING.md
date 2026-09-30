# Development and validation

Use Node from `.nvmrc` and the .NET 10 SDK selected by `global.json`. The server
requires the ASP.NET Core 10.0.12 runtime or newer. From the repository root:

```sh
npm run restore
npm run check
```

`package.json` owns the commands; `just` is an optional shortcut layer.
`check` runs ESLint, script/browser-test type checking, deployment configuration
validation, frontend and backend builds, and the fast test suites. It uses
incremental builds. `check:clean` forces a complete backend compilation so all
configured .NET analyzers run, and is the PR validation gate. Analyzer selection
lives in `Directory.Build.props`, with editor severity and indentation in
`.editorconfig`; build commands reject warnings.

Use `just ci` (or `npm run ci`) for the complete local gate: `check:clean` followed
by dependency audits, workflow scans, and the current-source secret scan. It
requires the security tools below and network access for advisory sources. SQL
Server, browser tests, and Bicep compilation are separate infrastructure checks
in the PR workflow. CodeQL and hosted CodeRabbit/Codacy results also remain
separate from local evidence.

During an edit, run the relevant focused test instead of repeating `check`,
`test`, and `ci` in sequence. After a passing aggregate, add only checks that were
not covered or whose inputs changed. For example, filter backend tests with
`npm run test:server -- --filter FullyQualifiedName~AuthenticationPipelineTests`.

## Focused tests

| Command | Evidence |
| --- | --- |
| `npm test` | All fast frontend, backend, and tooling tests |
| `npm run test:client` | Vitest/Testing Library tests, one run |
| `npm test --prefix client` | Vitest watch mode |
| `npm run test:server` | xUnit tests, with incremental compilation |
| `npm run test:server:built` | xUnit against the existing Release build; use only after building |
| `npm run test:tooling` | Secret-snapshot scope and actual Dependabot policy behavior with synthetic GitHub responses |
| `npm run test:sql` | SQL Server migrations, seeding, query translation, identity generation, and column constraints |
| `npm run test:browser` | Chromium sign-in, protected navigation, forecast rendering, and basic-user authorization |

Backend tests use SQLite for portable relational queries. `WebApplicationFactory`
starts the real `Program` and tests routing, authentication cookies, antiforgery,
redirect safety, authorization, and health checks. Its only infrastructure
substitutions are SQLite/`EnsureCreated` and ephemeral data-protection keys.
SMTP delivery is disabled in the test host. These tests do not prove Entra sign-in, SMTP
delivery, or SQL Server migrations.

Tooling tests never approve real PRs. The secret-scanner tests create and stage
files only in disposable temporary Git repositories, never in this checkout.

## Focused formatting

Format or check explicit paths so an edit does not reformat unrelated template
code. C# whitespace uses the .NET SDK without loading the solution; TypeScript
uses the already-installed client Prettier and its configuration:

```sh
npm run format:server:check -- server/Program.cs tests/server.sqltests/DatabaseTests.cs
npm run format:typescript:check -- playwright.config.mts tests/browser/smoke.spec.mts
```

The matching `format:server` and `format:typescript` commands apply changes to
the supplied paths. Review the resulting diff. Formatting is separate from the
non-mutating lint and validation commands.

## SQL Server integration

Start Docker and the development SQL service with `npm run db:up`, then:

```sh
TEST_SQL_CONNECTION='Server=localhost,14333;User ID=sa;Password=LocalDev123!;Encrypt=False;TrustServerCertificate=True' npm run test:sql
```

Use a disposable instance with permission to create/drop databases. The suite
always creates a unique `SoftwareCatalogTests_*` database and deletes it after
the test; it never migrates or deletes the database named in the connection
string. The separate `tests/server.sqltests` project is deliberately outside
`app.sln`, so normal tests need no SQL Server. Missing configuration fails with
an explanation instead of silently skipping. The security audit covers both
projects. CI provisions an ephemeral SQL Server service for this suite.

## Browser smoke tests

Install Chromium once with `npx --no-install playwright install chromium`.
Start the [Docker sandbox](SANDBOX.md), then run `npm run test:browser`.
The default target is `http://127.0.0.1:5280`; set `E2E_BASE_URL` for another
sandbox port. Tests use fictional local users and seeded forecasts. Do not point
them at production or an Entra-only environment.

CI builds once, publishes with `npm run publish:smoke`, then sets
`SMOKE_START_SERVER=true` and `SMOKE_SQL_CONNECTION` for a dedicated disposable
database. Playwright starts the published app from `artifacts/smoke`, waits for
`/health`, and shuts down the process afterwards. This verifies the packaged
static assets and SPA fallback as well as HTTP behavior. Failed traces are in
`test-results/`. These smoke tests do not test production Entra or Azure hosting.

## Security and local review

See [Dependency updates and review](DEPENDENCY_UPDATES.md#local-checks-and-ci) for
scanner installation, versions, audit scope, and the authoritative approval policy.

```sh
npm run security
npm run security:history
npm run review:uncommitted
```

`security` audits both npm lockfiles and all NuGet projects, checks all workflow configuration
with actionlint/zizmor, and scans current source with Gitleaks. It does not read
ignored `.env` files, dependencies, or build output. `security:history` separately
scans all locally available Git history with redacted output. Audits require
network access and fail if advisory sources cannot be checked.

CodeRabbit CLI requires a separate installation and authenticated account.
`review:uncommitted` includes new files; `review` compares with the already-local
`origin/main` reference and does not fetch it. Both supply `AGENTS.md` and
`.coderabbit.yaml` as review context. Verify findings against current code and
run the relevant checks after fixes. The user owns all staging, commits, pushes,
PR actions, and repository settings; see [AGENTS.md](../AGENTS.md).

## Publishing without repeated builds

`npm run publish` restores/builds frontend assets as part of a standalone .NET
publish. After `npm run build`, `npm run publish:built` reuses the current Release
build and `client/dist` using `BuildClientAssets=false`. Missing `dist/index.html`
fails explicitly. This optimized command assumes the builds match current source;
use it only in the same uninterrupted validation/deployment run. CI follows that
order, and the deployment workflow no longer reinstalls/rebuilds the client at
publish time.
