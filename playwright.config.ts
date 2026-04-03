import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for ask-my-note (Tauri/Vite app).
 *
 * The tests drive the *web* layer of the app via Vite's dev server on
 * port 1420 — the same fixed port that Tauri expects (see vite.config.ts).
 * Native Tauri IPC calls are gracefully stubbed / skipped in the test
 * environment; see e2e/fixtures/tauri-mock.ts if you need deeper mocking.
 *
 * Running tests:
 *   pnpm test:e2e          → headless run (starts vite automatically)
 *   pnpm test:e2e --headed → see the browser
 *   pnpm test:e2e --debug  → Playwright Inspector
 *   pnpm test:e2e --ui     → Playwright UI mode (best for authoring)
 */
export default defineConfig({
  // ── Test discovery ────────────────────────────────────────────────────────
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",

  // ── Parallelism & retries ─────────────────────────────────────────────────
  // Run each spec file in its own worker; single retry catches transient flakes.
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  forbidOnly: !!process.env.CI, // Prevent accidental test.only commits

  // ── Reporter ──────────────────────────────────────────────────────────────
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["junit", { outputFile: "test-results/junit.xml" }]]
    : [["list"], ["html", { open: "on-failure" }]],

  // ── Shared per-test settings ──────────────────────────────────────────────
  use: {
    // Vite's fixed port for Tauri development
    baseURL: "http://localhost:1420",

    // Collect trace on the first retry of a failed test for easy debugging.
    // Open with: pnpm exec playwright show-trace <path-to-trace.zip>
    trace: "on-first-retry",

    // Screenshot only on failure; stored in test-results/
    screenshot: "only-on-failure",

    // Short action timeout — fail fast rather than hanging
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  // ── Browser projects ──────────────────────────────────────────────────────
  // Chromium only for now; add webkit / firefox when coverage warrants it.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // ── Dev server ────────────────────────────────────────────────────────────
  // `pnpm test:e2e` will automatically start the Vite frontend dev server
  // before running tests and stop it afterwards.
  //
  // NOTE: This starts *only* the Vite frontend — not the full Tauri process.
  // Tests that need native Tauri features (IPC, file-system, etc.) must be
  // run against a live `pnpm tauri dev` session with reuseExistingServer: true.
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:1420",
    // Reuse whatever is already running locally (e.g. pnpm tauri dev);
    // in CI always start a fresh server.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },

  // ── Artifacts output ──────────────────────────────────────────────────────
  outputDir: "test-results",
});
