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

## Conventions

- Keep RAG pipeline logic separate from UI code
- All AI responses must include citations referencing the source note(s)
- Notes are the source of truth — never mutate them silently
- Use `@/` import alias for all `src/` imports

## Notes / Gotchas

- Tailwind v4 uses `@tailwindcss/vite` plugin (not PostCSS) — do not add `tailwind.config.ts`
- shadcn/ui uses `@base-ui/react` for some primitives (e.g. Tooltip) — no `asChild` prop on Tooltip triggers
- Rust must be sourced before running Tauri: `source ~/.cargo/env`
