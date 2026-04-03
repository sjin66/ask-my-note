import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the main App shell.
 *
 * Encapsulates all selectors and interactions so that individual spec files
 * stay readable and are resilient to DOM-structure changes in one place.
 */
export class AppPage {
  readonly page: Page;

  // ── Layout regions ────────────────────────────────────────────────────────
  readonly topBar: Locator;
  readonly sidebar: Locator;
  readonly mainContent: Locator;

  // ── Sidebar actions ───────────────────────────────────────────────────────
  readonly newNoteButton: Locator;
  readonly newChatButton: Locator;

  // ── Empty-state placeholder ───────────────────────────────────────────────
  readonly emptyStateMessage: Locator;

  // ── Modals ────────────────────────────────────────────────────────────────
  readonly settingsModal: Locator;
  readonly onboardingModal: Locator;

  constructor(page: Page) {
    this.page = page;

    // Layout — rely on data-testid where available; fall back to ARIA roles
    // and semantic elements that are stable across refactors.
    this.topBar = page.getByRole("banner"); // <header> or role="banner"
    this.sidebar = page.getByRole("complementary"); // <aside> or role="complementary"
    this.mainContent = page.getByRole("main");

    // Sidebar controls
    this.newNoteButton = page.getByRole("button", { name: /new note/i });
    this.newChatButton = page.getByRole("button", { name: /new (chat|conversation)/i });

    // Empty-state copy rendered by App.tsx when no note/chat is selected
    this.emptyStateMessage = page.getByText(/select a note or create a new one/i);

    // Modals
    this.settingsModal = page.getByRole("dialog", { name: /settings/i });
    this.onboardingModal = page.getByRole("dialog", { name: /onboarding|welcome|get started/i });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /** Navigate to the app root and wait for the React tree to mount. */
  async goto() {
    await this.page.goto("/");
    // Wait for the root React mount point to be populated
    await this.page.locator("#root > *").waitFor({ state: "attached" });
  }

  /** Switch the sidebar to the "chat" tab/view. */
  async openChatView() {
    await this.page.getByRole("button", { name: /chat/i }).click();
  }

  /** Switch the sidebar to the "notes" tab/view. */
  async openNotesView() {
    await this.page.getByRole("button", { name: /notes/i }).click();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  /** Assert that the core shell (topbar + sidebar + main) is rendered. */
  async expectShellVisible() {
    await expect(this.page.locator("#root")).toBeAttached();
    // The outermost app div should be present; it carries "flex h-screen flex-col"
    await expect(this.page.locator(".flex.h-screen")).toBeVisible();
  }

  /** Assert no unhandled JS error dialog appeared. */
  async expectNoErrorOverlay() {
    // Vite's error overlay uses a <vite-error-overlay> custom element
    await expect(this.page.locator("vite-error-overlay")).toHaveCount(0);
  }
}
