---
paths:
  - "src-tauri/**/*.rs"
  - "src-tauri/Cargo.toml"
---

# Rust Conventions

## Error Handling
- Use `?` to propagate errors — never `.unwrap()` or `.expect()` in production paths
- Define a shared error type in `src/models/error.rs`
- Tauri commands return `Result<T, String>` — Tauri serializes the error to the frontend

## Tauri Commands
- Commands are thin wrappers — delegate to `services/` immediately
- Commands live in `src/commands/`, business logic in `src/services/`
- Register all commands in `main.rs` via `tauri::generate_handler!`

## Database
- All queries use parameterized statements — no string interpolation in SQL
- Database connection passed as `tauri::State<DbConnection>`
- Migrations run on startup from `src/db/migrations/`

## Async
- Use `tokio::spawn` for background work (e.g. background indexing)
- Never block the async runtime with heavy synchronous computation
- Use `async-openai` for all OpenAI API calls
