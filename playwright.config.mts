import { defineConfig, devices } from '@playwright/test';

const startServer = process.env.SMOKE_START_SERVER === 'true';
const baseURL =
  process.env.E2E_BASE_URL ??
  (startServer ? 'http://127.0.0.1:5166' : 'http://127.0.0.1:5280');
if (startServer && !process.env.SMOKE_SQL_CONNECTION) {
  throw new Error(
    'SMOKE_SQL_CONNECTION must identify a disposable smoke-test database. See docs/TESTING.md.'
  );
}

export default defineConfig({
  testDir: './tests/browser',
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Local runs can target an already-running Docker sandbox. CI starts the
  // published package, exercising its static assets and SPA fallback too.
  webServer: startServer
    ? {
        command: 'dotnet server.dll',
        cwd: './artifacts/smoke',
        url: `${baseURL}/health`,
        timeout: 90_000,
        reuseExistingServer: false,
        env: {
          ASPNETCORE_ENVIRONMENT: 'Development',
          ASPNETCORE_URLS: baseURL,
          Auth__UseLocal: 'true',
          Auth__LocalCookieSuffix: 'browser-smoke',
          DB_CONNECTION: process.env.SMOKE_SQL_CONNECTION!,
          DevelopmentData__SeedOnStartup: 'true',
          OTEL_SDK_DISABLED: 'true',
          Smtp__Host: '',
          Notification__BaseUrl: '',
        },
      }
    : undefined,
});
