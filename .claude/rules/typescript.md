---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# TypeScript & React Conventions

## TypeScript
- No `any` types — use `unknown` and narrow, or define proper types
- Prefer `type` over `interface` for props and data shapes
- Always type Tauri `invoke` responses explicitly

## React
- One component per file
- Keep components under 150 lines — extract if larger
- Use custom hooks to encapsulate logic
- No prop drilling beyond 2 levels — use Zustand stores
- Never use `React.memo` without profiling evidence

## shadcn/ui
- Never edit files in `src/components/ui/` — they are auto-generated
- Add new components via: `npx shadcn@latest add <name>`
- Use `cn()` from `@/lib/utils` to merge Tailwind classes

## Zustand
- One store per domain: `notesStore`, `chatStore`, `uiStore`
- Keep actions co-located with the state they modify
- Never mutate state directly — always return new state

## File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Stores: `camelCaseStore.ts`
- Utilities: `camelCase.ts`
