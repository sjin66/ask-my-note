# ask-my-note

A macOS app that lets users store notes and chat with their own knowledge using AI.
The system uses embeddings and retrieval (RAG) to find relevant notes and generate answers with citations.
Goal: turn scattered thoughts into structured insights and actionable outputs.

## Tech Stack

- **App shell**: Tauri v2 (Rust backend + WebView frontend)
- **Frontend**: React + TypeScript + Tailwind CSS v4 + Vite
- **UI components**: shadcn/ui (`pnpm dlx shadcn@latest add <component>`)
- **Icons**: lucide-react
- **State**: Zustand
- **Note editor**: Tiptap
- **Storage**: SQLite (single file) + sqlite-vec extension for vectors
- **Embeddings**: OpenAI `text-embedding-3-small` or BigModel `embedding-2` (1024 dims, configurable)
- **AI chat**: OpenAI GPT-4o or BigModel GLM-4 (configurable)
- **RAG pipeline**: Custom Rust modules in `src-tauri/src/`
- **Package manager**: pnpm (not npm)

## Project Structure

```
ask-my-note/
  src/                          # React frontend
    components/
      ui/                       # shadcn/ui components (auto-generated, do not edit)
      notes/                    # Note list, editor, search
      chat/                     # Chat interface, citations
      layout/                   # Sidebar, app shell
      settings/                 # Settings, onboarding modals
    hooks/                      # Custom React hooks
    stores/                     # Zustand stores
    lib/                        # Frontend utilities (includes shadcn cn() helper)
  src-tauri/
    src/
      main.rs
      commands/                 # Tauri IPC command handlers
      services/                 # Business logic (notes, rag, embeddings, chat)
      db/                       # SQLite access + migrations
      models/                   # Data structs (note, chunk, provider, conversation, citation)
    Cargo.toml
    tauri.conf.json
  .github/workflows/ci.yml     # GitHub Actions CI pipeline
```

## Common Commands

```bash
# dev server (frontend + backend with hot reload)
pnpm tauri dev

# build distributable .app / .dmg
pnpm tauri build

# add a shadcn/ui component
pnpm dlx shadcn@latest add <component>

# run all frontend checks (tsc + eslint + prettier + cspell)
pnpm check

# individual checks
pnpm lint            # ESLint
pnpm lint:fix        # ESLint with auto-fix
pnpm format          # Prettier write
pnpm format:check    # Prettier check (CI mode)
pnpm spell           # cspell spell check

# run Rust checks
cd src-tauri && cargo clippy -- -D warnings
cd src-tauri && cargo test
```

## Code Quality Tools

### ESLint
- Config: `eslint.config.js` (ESLint 10 flat config)
- Plugins: `typescript-eslint`, `react-hooks`, `react-refresh`, `eslint-config-prettier`
- Ignores: `dist/`, `src-tauri/`, `src/components/ui/` (auto-generated)
- React Compiler rules are disabled (not using React Compiler)

### Prettier
- Config: `.prettierrc`
- `printWidth: 100`, double quotes, trailing commas, Tailwind class sorting
- Ignores: `dist/`, `src-tauri/`, `src/components/ui/`, `pnpm-lock.yaml`

### cspell (Spell Check)
- Config: `cspell.json`
- Checks: `src/**/*.{ts,tsx}` and `src-tauri/src/**/*.rs`
- Add project-specific words to the `words` array in `cspell.json`

### Commitlint
- Config: `commitlint.config.js`
- Enforces [Conventional Commits](https://www.conventionalcommits.org/) format
- Valid prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `style:`, `perf:`, `ci:`

### Pre-commit Hooks (husky + lint-staged)
- **pre-commit**: Runs ESLint fix + Prettier on staged `.ts/.tsx/.css` files
- **commit-msg**: Validates commit message format via commitlint

### CI Pipeline (GitHub Actions)
Runs on push/PR to `main`:
1. TypeScript type check (`tsc --noEmit`)
2. ESLint
3. Prettier format check
4. cspell spell check
5. Cargo clippy (`-D warnings`)
6. Cargo test
7. Full Tauri app build (separate job)

## shadcn/ui Usage

- Components live in `src/components/ui/` — never edit them manually
- Always add new components via CLI: `pnpm dlx shadcn@latest add <name>`
- Use `cn()` from `@/lib/utils` to merge Tailwind classes
- Import paths use the `@/` alias (e.g. `@/components/ui/button`)
- `TooltipProvider` is mounted in `src/main.tsx` — wrap app once at root

## Design System

### Style
Clean productivity aesthetic — minimal, functional, content-first. Think Notion/Obsidian, not flashy SaaS landing page. Prioritize readability and focus over visual impact.

### Color Palette (Notes & Writing App)
Uses shadcn/ui CSS variables. Override in `src/App.css` `:root` block.

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Background | `--background` | `#FAFAF9` | App background (warm off-white) |
| Foreground | `--foreground` | `#1C1917` | Primary text (stone-900) |
| Card | `--card` | `#FFFFFF` | Note cards, chat bubbles |
| Primary | `--primary` | `#44403C` | Buttons, active states (stone-700) |
| Secondary | `--secondary` | `#F5F5F4` | Sidebar bg, muted surfaces (stone-100) |
| Accent | `--accent` | `#2563EB` | Links, citations, interactive highlights (blue-600) |
| Muted | `--muted-foreground` | `#78716C` | Secondary text, timestamps (stone-500) |
| Border | `--border` | `#E7E5E4` | Dividers, card borders (stone-200) |
| Destructive | `--destructive` | `#DC2626` | Delete actions |

### Typography
- **Font**: Geist Variable (already installed by shadcn/ui)
- **Base size**: 16px body, 14px sidebar/labels
- **Heading scale**: 24px (h1), 20px (h2), 16px (h3) — compact for a desktop app
- **Line height**: 1.6 for body text (notes/chat), 1.4 for UI labels
- **Weight**: 400 body, 500 labels, 600 headings

### Layout
- **Two-column**: 240px sidebar + flexible main pane
- **Spacing**: 4px/8px grid (Tailwind: `p-1`, `p-2`, `gap-2`, `gap-3`)
- **Border radius**: `rounded-lg` (8px) for cards, `rounded-md` (6px) for buttons/inputs
- **Shadows**: Minimal — only on elevated elements (modals, dropdowns)

### Icons
- **Library**: lucide-react
- **Size**: 16px in buttons/nav, 20px standalone
- **Stroke**: 1.5px (default lucide weight)
- **Never use emojis as functional icons**

### Interaction
- Transitions: 150ms for hover/press, 200ms for panel transitions
- Hover: subtle bg change (`hover:bg-muted`)
- Active/selected: bg fill + font weight change
- Focus: visible ring (`ring-2 ring-ring`)
- Loading: skeleton shimmer for content, spinner for actions

### Dark Mode
Defer to v2. Build light mode first with semantic color tokens so dark mode is a variable swap later.

## Conventions

- Keep RAG pipeline logic separate from UI code
- All AI responses must include citations referencing the source note(s)
- Notes are the source of truth — never mutate them silently
- Use `@/` import alias for all `src/` imports

## Notes / Gotchas

- Tailwind v4 uses `@tailwindcss/vite` plugin (not PostCSS) — do not add `tailwind.config.ts`
- shadcn/ui uses `@base-ui/react` for some primitives (e.g. Tooltip) — no `asChild` prop on Tooltip triggers
- Rust must be sourced before running Tauri: `source ~/.cargo/env`
- Use `pnpm` everywhere — not `npm`. The project uses pnpm for dependency management.
- Tauri dev command: `pnpm tauri dev` (not `cargo tauri dev`)

## Feature Development Workflow

For any feature work, always follow this order:

1. Create a feature branch (`feat/description` or `fix/description`)
2. Understand the requirement
3. Inspect relevant files and existing patterns
4. Propose a short implementation plan
5. Wait for approval before making large code changes
6. Implement in small, reviewable steps, use checkbox to indicate the status of each step
7. Run checks: `pnpm check` and `cd src-tauri && cargo clippy -- -D warnings && cargo test`
8. Perform self-review:
   - security
   - coding standards
   - type safety
   - edge cases
9. Commit with conventional commit messages (`feat:`, `fix:`, `chore:`, etc.)
10. Push and create a PR against `main`
11. Summarize changes and remaining risks in the PR description
