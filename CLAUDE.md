# ask-my-note

A macOS app that lets users store notes and chat with their own knowledge using AI.
The system uses embeddings and retrieval (RAG) to find relevant notes and generate answers with citations.
Goal: turn scattered thoughts into structured insights and actionable outputs.

## Tech Stack

- **App shell**: Tauri v2 (Rust backend + WebView frontend)
- **Frontend**: React + TypeScript + Tailwind CSS v4 + Vite
- **UI components**: shadcn/ui (`npx shadcn@latest add <component>`)
- **Icons**: lucide-react
- **State**: Zustand
- **Note editor**: Tiptap
- **Storage**: SQLite (single file) + sqlite-vec extension for vectors
- **Embeddings**: OpenAI `text-embedding-3-small`
- **AI chat**: OpenAI GPT-4o
- **RAG pipeline**: Custom Rust modules in `src-tauri/src/`

## Project Structure

```
ask-my-note/
  src/                          # React frontend
    components/
      ui/                       # shadcn/ui components (auto-generated, do not edit)
      notes/                    # Note list, editor, search
      chat/                     # Chat interface, citations
      layout/                   # Sidebar, app shell
    hooks/                      # Custom React hooks
    stores/                     # Zustand stores
    lib/                        # Frontend utilities (includes shadcn cn() helper)
  src-tauri/
    src/
      main.rs
      commands/                 # Tauri IPC command handlers
      services/                 # Business logic (notes, rag, embeddings, chat)
      db/                       # SQLite access + migrations
      models/                   # Data structs (note, chunk, conversation, citation)
    Cargo.toml
    tauri.conf.json
```

## Common Commands

```bash
# dev server (frontend + backend with hot reload)
cargo tauri dev

# build distributable .app / .dmg
cargo tauri build

# add a shadcn/ui component
npx shadcn@latest add <component>

# run Rust tests
cd src-tauri && cargo test

# run frontend tests
npm test

# lint
npm run lint && cd src-tauri && cargo clippy
```

## shadcn/ui Usage

- Components live in `src/components/ui/` — never edit them manually
- Always add new components via CLI: `npx shadcn@latest add <name>`
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
