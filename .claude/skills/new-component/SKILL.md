---
name: new-component
description: Scaffold a new React component with TypeScript and Tailwind CSS. Invoke with /new-component <name>.
disable-model-invocation: true
argument-hint: <ComponentName>
allowed-tools: Read, Write, Glob
---

Scaffold a new React component named `$ARGUMENTS`.

1. Determine which folder it belongs in based on the name or ask the user:
   - `notes/` — note list, editor, search UI
   - `chat/` — chat interface, message bubbles, citations
   - `layout/` — sidebar, navigation, app shell

2. Create `src/components/{folder}/$ARGUMENTS.tsx` with:
   - A typed `type Props = { ... }` at the top
   - Tailwind CSS for styling
   - shadcn/ui components where appropriate
   - Named export (not default export)

3. Do not create a barrel `index.ts` unless one already exists in that folder.
