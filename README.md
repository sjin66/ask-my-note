# ask-my-note

Tauri v2 + React + TypeScript desktop app for note-taking and AI chat with citations.

## E2E tests (Playwright)

- Run smoke tests: `pnpm test:e2e`
- Open UI mode: `pnpm test:e2e:ui`
- Debug mode: `pnpm test:e2e:debug`
- Install Playwright-managed Chromium (forces Chromium mode): `pnpm test:e2e:install`

### Browser behavior

- On macOS, Playwright tests default to your locally installed Google Chrome.
- This avoids flaky CDN download failures during `playwright install` on constrained networks.
- `pnpm test:e2e:install` sets `PW_USE_SYSTEM_CHROME=0` and installs Chromium for that mode.
- To force Playwright-managed Chromium at runtime, set `PW_USE_SYSTEM_CHROME=0`.

Example:

```bash
PW_USE_SYSTEM_CHROME=0 pnpm test:e2e
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
