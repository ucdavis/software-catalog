# Software Catalog

The UC Davis Software Catalog starter, based on [ucdavis/web-app-template](https://github.com/ucdavis/web-app-template), with a .NET 10 backend, React/TypeScript frontend, and Microsoft Entra ID authentication. It currently provides template examples; catalog-specific data and authorization remain application work.

See the [Software Catalog project page in Notion](https://app.notion.com/p/3ebe70f6741181059d45e5c19aa90783) for project status, architecture, and related notes and tasks.

## Quick start

Start from a checkout of this repository:

```bash
git clone https://github.com/ucdavis/software-catalog.git
cd software-catalog
```

Choose the workflow that fits your task:

- **Try the app:** use the [Docker sandbox](#run-the-docker-sandbox). Docker supplies the app, database, fictional users, and mail inbox.
- **Edit with hot reload:** follow [development setup](#set-up-for-development) for your host or VS Code DevContainer.
- **Run checks:** see [Testing](#testing). Fast tests need no running services; SQL Server and browser checks have separate setup.

For a new deployment, follow the [customization guide](README.customization.md) and [Azure deployment setup](#azure-deployment). See the [template baseline](#template-baseline) for the upstream revision and runtime requirements.

## Run the Docker sandbox

With Docker running and Compose available, run these commands from the repository root:

```bash
export SANDBOX_PROJECT=software-catalog-local
export SANDBOX_PORT=5280
export SANDBOX_MAIL_PORT=8025
docker compose -p "$SANDBOX_PROJECT" -f .devcontainer/docker-compose.sandbox.yml up --build --wait
```

Use a unique `SANDBOX_PROJECT` for every checkout and different app and inbox ports for sandboxes running concurrently. Keep these values for subsequent commands, including in a new terminal. Compose rejects an unset or empty `SANDBOX_PROJECT`. See [multiple sandboxes](docs/SANDBOX.md#ports-and-multiple-sandboxes) for an example.

Open [the sandbox](http://localhost:5280) and choose **Sign in as Sample User**. The image builds this checkout's frontend and backend. SQL Server starts first, then the app applies migrations and seeds ten weather records dated January 1–10, 2025. No host Node.js, .NET, `.env`, Entra registration, or SMTP account is needed. The first build needs internet access for images and dependencies.

The [Mailpit inbox](http://localhost:8025) captures mail sent from the Notification page. Choose **Basic User** at [local sign-in](http://localhost:5280/login) to exercise the weather API's `403` response, or sign out there. These fictional users have fixed identities and claims; there is no user table.

Stop the sandbox while preserving its database and sign-in keys:

```bash
docker compose -p "$SANDBOX_PROJECT" -f .devcontainer/docker-compose.sandbox.yml down
```

Run `up --build --wait` again to start it or rebuild after source changes. The sandbox serves a published build and has no hot reload. Mailpit messages are not persisted when its container is removed.

To reset the database to the original fixtures, remove this sandbox's volumes and start again:

```bash
docker compose -p "$SANDBOX_PROJECT" -f .devcontainer/docker-compose.sandbox.yml down --volumes
docker compose -p "$SANDBOX_PROJECT" -f .devcontainer/docker-compose.sandbox.yml up --build --wait
```

This deletes the sandbox database and local sign-in keys. The regular development database uses separate volumes. See [the sandbox guide](docs/SANDBOX.md) for logs, ports, and investigation steps.

## Set up for development

All commands below run from the repository root. Choose either host development or the DevContainer after configuring authentication.

### Local configuration

For a new checkout, copy the example. Keep an existing `server/.env` if you already have one:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` before starting the backend or opening the DevContainer:

- **Fictional local users:** change `Auth__UseLocal="false"` to `Auth__UseLocal="true"`. This works only in `Development`, which the local launch profiles enable.
- **Entra sign-in:** keep local auth disabled and replace `Auth__ClientId="<client-guid>"` with your app registration's client ID. Follow [Auth Configuration](#auth-configuration) for registration and redirect URIs.

Leave `Smtp__Host` empty until you configure email. External telemetry is optional. To populate an empty weather table, set `DevelopmentData__SeedOnStartup="true"`. Local configuration files contain secrets and are ignored by Git.

### Host development

Prerequisites:

- A .NET 10 SDK selected by [global.json](global.json), with .NET and ASP.NET Core runtime 10.0.12 or later in the 10.0 line.
- Node.js 22.18+ and npm. With nvm, `nvm install` and `nvm use` select the Node 22 line from [.nvmrc](.nvmrc).
- Docker with Compose for the local SQL Server container.

Restore dependencies and start the database:

```bash
npm ci
npm --prefix client ci
dotnet restore app.sln
dotnet tool restore
npm run db:up
```

The database may take a little time on first startup. Use `npm run db:logs` to wait for SQL Server to report that it is ready for client connections, then press Ctrl+C to stop following logs. Start the application:

```bash
npm start
```

This runs `dotnet watch` on port `5165`, waits for `/health` to succeed, then starts Vite on port `5173` and opens the browser. Ctrl+C stops the app processes; `npm run db:down` separately stops SQL Server and preserves its data.

For editor debugging, use the same dependency and database setup, then choose one launcher:

- **VS Code:** install the recommended C# extensions, select **Full Stack: VS Code** in Run and Debug, and press F5. Select **Backend: ASP.NET Core + Swagger** for backend-only debugging.
- **Visual Studio on Windows:** use Visual Studio 2026 version 18.0 or later, open `app.sln`, set `server` as the startup project, and press F5. Its `http` profile uses `SpaProxy` to launch Vite and redirect the browser.

Stop a running `npm start` session before launching the same app from an editor so the processes can use their configured ports.

### VS Code DevContainer

With Docker and the VS Code Dev Containers extension installed, configure `server/.env` as above, then run **Dev Containers: Reopen in Container**. The container provides .NET 10, Node 22, and SQL Server; its setup script installs dependencies, and its start hook runs `npm start` automatically.

The DevContainer overrides `DB_CONNECTION` to reach SQL Server at `sql:1433`. Use its terminal for development commands. If the application needs restarting after changing configuration, stop the existing app processes before running `npm start` again.

### Application URLs

| Service | Host or DevContainer development | Docker sandbox defaults |
| --- | --- | --- |
| Frontend | [localhost:5173](http://localhost:5173) | [localhost:5280](http://localhost:5280) |
| Backend health | [localhost:5165/health](http://localhost:5165/health) | [localhost:5280/health](http://localhost:5280/health) |
| Swagger | [localhost:5165/swagger](http://localhost:5165/swagger) | [localhost:5280/swagger](http://localhost:5280/swagger) |
| Mailpit inbox | Requires separate SMTP configuration | [localhost:8025](http://localhost:8025) |

Use the frontend origin in the browser; Vite proxies backend API and authentication requests during development. Swagger is enabled only in `Development`.

## Architecture

The application is a React single-page app with an ASP.NET Core host and a shared backend library. The .NET solution contains `server`, `server.core`, and `server.tests`. The frontend is built by Vite and included when the server is published.

| Component | Responsibility |
| --- | --- |
| `client/` | React 19 and TypeScript, built with Vite 7. TanStack Router provides file-based routes; Query handles server state; Form and Table support forms and data tables. Styling uses Tailwind CSS 4, DaisyUI 5, and UC Davis Gunrock. |
| `server/` | ASP.NET Core 10 host for `/api` controllers, authentication, health checks, and published frontend assets. It owns application services and the optional notification examples, including their request DTOs and Razor templates. |
| `server.core/` | Shared Razor class library containing domain models, the EF Core 10 SQL Server context, migrations and database initialization, plus reusable email composition types, Razor/MJML rendering, and MailKit SMTP delivery. |

Authentication uses Microsoft Identity Web with Entra ID/OIDC and a server-issued session cookie. Protected frontend routes load `/api/user/me`; the backend enforces authentication and role checks. Fictional local users are available only when explicitly enabled in `Development`. See [Auth Configuration](#auth-configuration).

SQL Server stores application data locally; cloud deployments use Azure SQL. The current schema contains sample weather data, and application roles are still supplied by the template's placeholder `UserService`. Catalog-specific data and authorization remain application work. Registered options are validated before startup migrations, and sample seeding is opt-in.

The request and build flows depend on how the app is run:

- **Local development:** the browser uses Vite on `:5173`, which proxies API, authentication, and health requests to ASP.NET Core on `:5165`. `npm start` coordinates Vite and `dotnet watch`; Visual Studio profiles use `SpaProxy` to launch Vite and redirect the browser to it.
- **Published application:** `dotnet publish` runs the frontend build and copies `client/dist` into the published `wwwroot`. ASP.NET Core serves static assets, the SPA fallback, and backend endpoints from one origin. Vite and Node.js are build-time dependencies in this mode.
- **Docker sandbox:** the published application runs in `Development` with local cookie authentication, SQL Server, and a Mailpit SMTP inbox. It serves the built frontend through the app port (default `:5280`); source changes require rebuilding the image.

OpenTelemetry provides server logs, traces, and metrics with OTLP exporters. The Azure deployment scaffold targets Linux App Service and Azure SQL and defines Application Insights and Log Analytics resources. GitHub Actions validates PRs and builds/publishes the application for deployment.

See [Development Architecture](docs/ARCHITECTURE.md) for request-flow diagrams and hosting details, and [optional email notifications](server.core/Notification/README.md) for the reusable email boundary and sample composition flow.

## Configuration

The backend loads `appsettings.json`, environment-specific JSON, `server/.env`, and an optional `server/.env.<environment>`. OS environment variables take precedence over these files; explicit command-line arguments have highest precedence. See [the example configuration](server/.env.example) for supported local settings.

### Database configuration

The backend requires SQL Server. Set `DB_CONNECTION` in `server/.env` or the environment to override `ConnectionStrings:DefaultConnection` from JSON configuration.

- Host development uses the SQL container on `localhost:14333` with database `AppDb`.
- The DevContainer sets `DB_CONNECTION` to use `sql:1433` with database `AppDb`.
- The standalone sandbox uses its own SQL container and `SandboxDb`.

Startup validates registered options, then applies EF Core migrations before serving requests. The database must be available and the configured account must have permission to apply those migrations. Sample weather data is inserted only when `DevelopmentData__SeedOnStartup=true` and the weather table is empty. The sandbox enables seeding; ordinary development opts in through `.env`.

Use `npm run db:up`, `npm run db:logs`, and `npm run db:down` to manage the regular development database. These commands use [.devcontainer/docker-compose.yml](.devcontainer/docker-compose.yml); use the separate sandbox commands for its database.

### Auth Configuration

The default mode uses OIDC with Microsoft Entra ID and a server-issued authentication cookie. Set `Auth__ClientId` to your own registration's client ID; startup rejects the template placeholder. Follow [Microsoft Entra setup](README.customization.md#3-microsoft-entra-id-azure-ad-app-sign-in-setup) for registration, redirect URIs, and app-specific settings.

`Auth__UseLocal=true` enables fictional local users and bypasses Entra configuration. It defaults to false, and startup rejects it outside `Development`. The Docker sandbox enables it automatically.

The backend supplies application roles through `UserService`; its current role assignment is template behavior that needs replacing for catalog-specific authorization. To include the `ucdPersonIAMID` claim displayed on the home page, see the team's [Authentication guide](https://app.notion.com/p/caes-cru/Authentication-2eae70f674118020ba74e953828d2591?source=copy_link).

### Google Analytics (GA4)

[client/index.html](client/index.html) contains the GA4 bootstrap, and [AnalyticsListener](client/src/shared/analytics/AnalyticsListener.tsx) sends page views on route changes. Replace the placeholder `G-XXXXXXXXXX` in both the script URL and `gtag('config', ...)` before using analytics for this application.

### Health check

`/health` checks database connectivity through `AppDbContext`. Development launchers and Azure deployment checks use it for readiness. It does not verify Entra sign-in or SMTP delivery; test those flows separately.

## Development

### Development Architecture

Vite serves the browser on `:5173` and proxies `/api`, `/login`, `/logout`, `/signin-oidc`, and `/health` to ASP.NET Core on `:5165`. Keep frontend requests relative to the current origin, such as `/api/weatherforecast`.

`npm start` coordinates both processes. To run them in separate terminals, use `npm run start:server` and `npm run start:client`. The backend command selects `http-cli`, which leaves frontend startup to npm or the editor. See [Development Architecture](docs/ARCHITECTURE.md) for diagrams and hosting details.

### Backend Development

Add API endpoints in `server/Controllers/`, application services in `server/Services/`, and shared domain/persistence code in `server.core/`. `dotnet watch` applies supported C# edits with hot reload and requests a restart when needed. Restart after changing startup configuration.

The EF Core context and migrations live in `server.core/`; `server` is the startup project. After changing the model, create a migration with a descriptive name:

```bash
dotnet ef migrations add DescribeSchemaChange --project server.core --startup-project server
```

Review the generated migration before running the app, because startup applies pending migrations. Backend tests live in `tests/server.tests/`.

### Frontend Development

Create route files in `client/src/routes/`, with protected pages under `(authenticated)/`. Vite's TanStack Router plugin generates `client/src/routeTree.gen.ts`; edit route files rather than the generated tree. Use the shared QueryClient and query definitions in `client/src/queries/` for server state, and the helpers in `client/src/lib/api.ts` for API calls.

Vite provides React hot reload. Shared components live in `client/src/shared/`; styles use Tailwind, DaisyUI, and UC Davis Gunrock. `npm --prefix client run build` checks TypeScript and produces `client/dist`; it builds only the frontend.

### VS Code Debugging

[.vscode/launch.json](.vscode/launch.json) defines **Full Stack: VS Code** and **Backend: ASP.NET Core + Swagger**. Both use the `http-cli` launch profile. Full Stack starts Vite after backend health succeeds; the backend-only configuration opens Swagger. See [host development](#host-development) for prerequisites.

### Authentication Flow

1. Protected routes load the current user through `/api/user/me`.
2. The API helper redirects a `401` response to `/login?returnUrl=...`.
3. The backend completes Entra sign-in or the enabled local-user flow and issues a cookie.
4. Same-origin API requests include that cookie; the backend enforces authentication and role checks. A `403` remains an authorization error.

After sign-in, `returnUrl` accepts local paths such as `/fetch?sort=date`. Missing or external destinations fall back to `/`.

### Optional email notifications

Leave `Smtp:Host` empty to run without SMTP. The sandbox configures Mailpit automatically; its Notification page sends examples to the local inbox. Sample notification endpoints are available only in Development and test.

Application code parses recipient strings with `EmailRecipients.Parse(to, cc, bcc)` before rendering, then constructs messages with `EmailMessage.Create(recipients, subject, textBody, htmlBody)`. These factories reject invalid input and produce immutable values. Table composition also snapshots rows before awaiting the renderer.

`Notification:BaseUrl` is optional. When set, it must be an absolute HTTP(S) URL without embedded credentials; invalid values fail startup validation. A blank value omits the email button. See [optional email notifications](server.core/Notification/README.md) for SMTP configuration, composition examples, and removal steps.

### Publishing

Build the complete application from the repository root:

```bash
dotnet publish server/server.csproj --configuration Release --output publish/web
```

The standalone publish target installs frontend dependencies with `npm ci`, runs the Vite build, and includes its output in `publish/web/wwwroot`. After building in the same validation run, `npm run publish:built` reuses the existing Release build and frontend assets; see [publishing without repeated builds](docs/TESTING.md#publishing-without-repeated-builds). Node.js is required on the build machine; the published application runs on ASP.NET Core with its database and authentication configuration. `npm --prefix client run preview` previews frontend assets only and is not the complete application host.

## Testing

After restoring dependencies, use the incremental development gate:

```bash
npm run check
```

Before opening a PR, run `just ci` (or `npm run ci`) for a clean analyzer build,
fast tests, and security audits. Install the scanners described in
[Development and validation](docs/TESTING.md#security-and-local-review) first.
Use focused tests while editing; these aggregates already include frontend,
backend, and tooling tests.

The [PR validation workflow](.github/workflows/ci-cd.yml) runs frontend ESLint,
TypeScript/deployment-settings checks, clean builds, fast tests, Bicep compilation,
SQL Server integration tests, and Chromium tests against the published app.
Security and CodeQL run in separate workflows. See [Development and validation](docs/TESTING.md)
for exact commands, focused formatting, and the distinction between each test layer.

### Client tests

Run `npm --prefix client test -- --run` once, or `npm --prefix client run test:watch` during development. Vitest uses jsdom, Testing Library, and MSW; the backend does not need to be running. See the [client testing guide](client/src/test/README.md) for fixtures and test conventions.

### Server tests

Run `dotnet test app.sln --configuration Release`, or target `tests/server.tests/server.tests.csproj` directly. The xUnit suite covers controllers, authentication helpers, notification parsing and composition, and Razor/MJML rendering. It requires no live Entra or SMTP service.

Database fixtures use SQLite, and `WebApplicationFactory<Program>` tests the real
startup and authentication pipeline with isolated infrastructure. These tests
need no SQL Server. The separate `npm run test:sql` suite verifies migrations and
provider-specific behavior against SQL Server; see [its setup](docs/TESTING.md#sql-server-integration).

### Sandbox checks

Use the [Docker sandbox](#run-the-docker-sandbox) to exercise real HTTP middleware, SQL Server migrations, and SMTP delivery. Check that Sample User can access weather data, Basic User receives `403`, and notification examples arrive in Mailpit. See [the sandbox guide](docs/SANDBOX.md) for investigation and cleanup commands. Run `npm run test:browser` for automated sign-in, navigation, and role checks against the sandbox. See [browser setup](docs/TESTING.md#browser-smoke-tests); SMTP delivery remains a separate manual check.

### Dependency automation and security

Dependabot groups weekly minor/patch npm, NuGet, and GitHub Actions updates; major
versions have separate PRs. Verified dependency-only updates can receive automated approval and
squash auto-merge after the required validation, security, CodeRabbit, and Codacy
checks pass. Code-owner approval is not required. The security workflow runs
dependency audits, actionlint, Zizmor, and Gitleaks; CodeQL analyzes C# and
JavaScript/TypeScript separately. See [dependency automation](docs/DEPENDENCY_UPDATES.md)
for local commands, policy safeguards, scanner scope, and rollout requirements.

## Azure Deployment

GitHub Actions is the primary deployment path. The checked-in workflows have these responsibilities:

| Workflow | Trigger and behavior |
| --- | --- |
| [CI/CD](.github/workflows/ci-cd.yml) | Validates PRs targeting `main`; pushes to `main` deploy to `test`; manual runs select `test` or `prod`. |
| [Configure Azure](.github/workflows/configure-azure.yml) | Manually provisions or updates infrastructure and application settings for `test` or `prod`. |
| [Deploy Azure App Service](.github/workflows/deploy-azure-appservice.yml) | Reusable build, test, publish, and package deployment workflow called by CI/CD. It deploys to an existing configured App Service and checks health. |

Before deploying, configure GitHub Environments, the Azure OIDC identity, application names, Entra settings, and SQL connectivity. A push to `main` attempts a test deployment, so these prerequisites must be in place for that job to succeed. Production deployment is manual. Start with the [Azure deployment guide](infrastructure/azure/README.md) and its links to [bootstrap instructions](README.customization.md#5-azure-deployment-setup).

Edit app-specific settings in [deployment-settings.json](infrastructure/azure/deployment-settings.json), then run:

```bash
npm run deployment-settings:sync
npm run deployment-settings:check
```

Review the generated workflow and deploy-script changes together with the settings file. The template defaults catalog and generated regions have separate ownership; do not hand-edit generated regions. Infrastructure/settings configuration is separate from package deployment. The Azure guide also covers local deployment scripts, production SQL networking, and first-deploy requirements.

## Updating Dependencies

Dependabot groups npm, NuGet, and GitHub Actions updates weekly. Verified updates
can be approved automatically and queued for merging after the required checks
and reviews. CodeRabbit reviews PRs, including drafts and dependency updates.
See [Dependency updates and review](docs/DEPENDENCY_UPDATES.md) for the approval
policy, GitHub activation requirements, and local review/security commands.

### Client

The repository has separate root and client npm manifests and lockfiles. Inspect both:

```bash
npm outdated
npm --prefix client outdated
```

Use `npm update` and `npm --prefix client update` for updates within the declared ranges. For a deliberate version change, use `npm install <package>@<version>` in the owning directory (or `npm --prefix client install <package>@<version>`). Review changes to each manifest and lockfile together, then run the [checks above](#testing).

### Server

Use the .NET 10 SDK to inspect outdated NuGet packages:

```bash
dotnet package list --project app.sln --outdated
```

Update package references in the owning `.csproj`, restore, and rerun the checks. Keep EF Core packages and the local `dotnet-ef` tool aligned; its version is recorded in [.config/dotnet-tools.json](.config/dotnet-tools.json). Use `dotnet tool update dotnet-ef --local --version <matching-version>` when changing that pin.

The SDK command needs no additional package-update tool. When changing the SDK/runtime baseline, review `global.json`, project targets, Dockerfiles, and workflow setup together.

## Project Structure

Key source directories and tooling:

```text
.
├── client/                          # React/TypeScript frontend
│   ├── src/
│   │   ├── routes/                  # TanStack Router routes and auth layout
│   │   ├── queries/                 # TanStack Query options and hooks
│   │   ├── examples/                # Optional notification UI
│   │   ├── lib/                     # API and CSV helpers
│   │   ├── shared/                  # Auth context, forms, tables, and analytics
│   │   └── test/                    # Vitest, Testing Library, and MSW fixtures
│   ├── package.json
│   └── vite.config.ts
├── server/                          # ASP.NET Core host
│   ├── Controllers/                 # Account, current-user, and weather endpoints
│   ├── Examples/Notifications/      # Sample endpoints, DTOs, composition, and views
│   ├── Helpers/                     # Authentication, telemetry, and startup logging
│   ├── Services/                    # Application services, including role lookup
│   ├── Views/Account/               # Development-only local sign-in page
│   ├── Properties/                  # Launch profiles
│   ├── Program.cs                   # DI, configuration, database startup, middleware
│   └── server.csproj                # Host dependencies and frontend publish target
├── server.core/                     # Shared backend/Razor class library
│   ├── Data/                        # EF Core context and database initialization
│   ├── Domain/                      # Data/domain models
│   ├── Migrations/                  # SQL Server schema migrations
│   ├── Notification/                # Immutable email values, rendering, and SMTP
│   ├── Views/Shared/                # Shared MJML layout and button templates
│   └── server.core.csproj
├── tests/server.tests/              # xUnit, SQLite fixtures, and real startup tests
├── tests/server.sqltests/           # SQL Server provider/migration integration tests
├── tests/browser/                   # Playwright sign-in and navigation smoke tests
├── infrastructure/azure/            # Bicep, deployment settings, and deploy scripts
├── scripts/                         # Deployment-settings synchronization/checks
├── docs/                            # Architecture and sandbox guides
├── .devcontainer/                   # DevContainer and standalone Docker sandbox
├── .github/workflows/               # PR validation, Azure setup, and deployment
├── global.json                      # .NET SDK selection
├── package.json                     # Root development and deployment-tool commands
└── app.sln                          # Server, shared library, and test projects
```

## Available Scripts

Commands below run from the repository root; `--prefix client` selects the frontend package. `package.json` owns the commands and `justfile` provides optional aliases. See [Development and validation](docs/TESTING.md) for the complete command cycle.

### Root Level

| Command | Purpose |
| --- | --- |
| `npm start` | Run the backend watcher, wait for health, and start Vite with a browser. |
| `npm run restore` | Restore npm packages and the main .NET solution. |
| `npm run check` | Incremental lint, build, and fast tests. |
| `npm run check:clean` | Clean backend compilation with the same checks and tests. |
| `npm run ci` / `just ci` | Clean checks and security audits, each run once. |
| `npm test` | Fast frontend, backend, and tooling tests. |
| `npm run test:sql` | SQL Server integration tests, with explicit test connection. |
| `npm run test:browser` | Chromium checks against a sandbox or the published smoke host. |
| `npm run security` | Dependency, workflow, and current-source secret checks. |
| `npm run start:server` | Run only the backend watcher with the `http-cli` profile. |
| `npm run start:client` | Run Vite and open the browser. |
| `npm run db:up` | Start the regular development SQL Server container. |
| `npm run db:logs` | Follow SQL Server logs. |
| `npm run db:down` | Stop SQL Server and retain its database volume. |
| `npm run deployment-settings:sync` | Regenerate deployment settings in owned workflow/script regions. |
| `npm run deployment-settings:check` | Type-check the settings tool and check generated output for drift. |

`start:client:when-server-ready` and `start:client:debug` are launch helpers used by npm orchestration and VS Code. `deployment-settings:typecheck` runs the settings tool's TypeScript check alone.

### Client Directory

| Command | Purpose |
| --- | --- |
| `npm --prefix client run dev` | Run Vite without opening a browser. |
| `npm --prefix client run dev:open` | Run Vite and open the browser. |
| `npm --prefix client run build` | Type-check and build frontend assets. |
| `npm --prefix client run lint` | Run ESLint. |
| `npm --prefix client test -- --run` | Run the frontend test suite once. |
| `npm --prefix client run test:watch` | Run frontend tests in watch mode. |
| `npm --prefix client run preview` | Preview the existing frontend build. |

### Server Directory

From the repository root, use `dotnet build app.sln` to build all .NET projects and `dotnet test app.sln` to run backend tests. Use `npm run start:server` for backend development and the [publish command](#publishing) for a deployable application. If working inside `server/`, `dotnet run --launch-profile http-cli` starts only the backend; the test project is outside that directory.

## Template baseline

Updated to [web-app-template `7510421`](https://github.com/ucdavis/web-app-template/commit/75104211c47df14a86ce6b1ab13e44955e487d60) (September 24, 2026). This update adopts .NET 10 and Node.js 22.18+ and removes the old JavaScript project (`client.esproj`). The backend now builds and publishes the frontend directly. Generated `obj` files from upstream are excluded.

Published applications require .NET and ASP.NET Core 10.0.12 or later within the .NET 10 line. The server sets a [minimum runtime version](https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props#runtimeframeworkversion) to preserve the template's XML security patch baseline when the SDK uses the shared-framework assembly instead of copying the NuGet assembly. Keep deployment hosts on current .NET 10 patches.

Existing development setups must configure their own Entra client ID or explicitly enable development-only local sign-in in `server/.env`; see [Auth Configuration](#auth-configuration). SMTP, telemetry, and cloud deployment settings remain optional and require app-specific configuration.
