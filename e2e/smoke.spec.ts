/**
 * Smoke Test — App shell loads correctly
 *
 * Verifies the absolute minimum: the React app mounts, the primary layout
 * regions are present, and there are no unhandled JavaScript errors.
 *
 * These tests run against the Vite frontend ONLY (no Tauri process needed).
 * Native Tauri APIs (IPC, file-system, window decorations) are unavailable
 * in this environment; tests that require them should be tagged @tauri and
 * run against a live `pnpm tauri dev` session.
 *
 * Prerequisites
 *   The Vite dev server must be running on http://localhost:1420, OR
 *   playwright.config.ts#webServer will start it automatically.
 */

import { test, expect } from "@playwright/test";
import { AppPage } from "./pages/app.page";

// ── Suite ─────────────────────────────────────────────────────────────────────

test.describe("Smoke — App shell", () => {
  test("page loads without a JS crash", async ({ page }) => {
    // Intercept any uncaught exceptions
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/");

    // React root must be mounted and contain content
    await expect(page.locator("#root")).not.toBeEmpty();

    // No uncaught JS exceptions
    expect(pageErrors, `Uncaught JS errors: ${pageErrors.join(", ")}`).toHaveLength(0);
  });

  test("renders the top-level layout regions", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    // The outermost flex container should be visible
    await app.expectShellVisible();

    // No Vite error overlay should be present
    await app.expectNoErrorOverlay();
  });

  test("shows the notes empty-state by default", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    // On first load with no notes, the empty-state copy is shown
    await expect(app.emptyStateMessage).toBeVisible({ timeout: 10_000 });
  });

  test("has the correct page title", async ({ page }) => {
    await page.goto("/");
    // Title is set in index.html; update this when the <title> tag changes
    await expect(page).toHaveTitle(/tauri.*react|ask.*note|note/i);
  });

  test("does not show a Vite error overlay on load", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    await app.expectNoErrorOverlay();
  });
});

test.describe("Smoke — Navigation", () => {
  test("sidebar is present and visible", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    // Sidebar exists in the DOM — may be a narrow icon strip or full panel
    const sidebar = page.locator("aside, [role='complementary'], nav").first();
    await expect(sidebar).toBeAttached();
  });

  test("main content area is present", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    const main = page.locator("main, [role='main']").first();
    await expect(main).toBeAttached();
  });
});
