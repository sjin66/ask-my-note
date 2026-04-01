---
name: tauri-ipc
description: Tauri v2 IPC patterns for this project — defining Rust commands, calling them from TypeScript, and streaming events from backend to frontend. Auto-apply when working on Tauri commands or frontend/backend communication.
user-invocable: false
allowed-tools: Read, Grep
---

## Defining a Command (Rust)

```rust
#[tauri::command]
pub async fn get_note(
    id: String,
    db: tauri::State<'_, DbConnection>,
) -> Result<Note, String> {
    services::notes::get_by_id(&db, &id)
        .await
        .map_err(|e| e.to_string())
}

// Register in main.rs
.invoke_handler(tauri::generate_handler![
    commands::notes::get_note,
])
```

## Calling from Frontend (TypeScript)

```typescript
import { invoke } from '@tauri-apps/api/core'

const note = await invoke<Note>('get_note', { id: noteId })
```

Always wrap `invoke` in `try/catch` — Rust `Err` becomes a thrown JS error.

## Streaming Events (Rust → Frontend)

```rust
app_handle.emit("chat-stream", token)?;
app_handle.emit("chat-stream-done", ())?;
```

```typescript
import { listen } from '@tauri-apps/api/event'

useEffect(() => {
  const unlistenStream = listen<string>('chat-stream', (e) => {
    setText(prev => prev + e.payload)
  })
  return () => { unlistenStream.then(f => f()) }
}, [])
```

## Error Handling

- Rust commands return `Result<T, String>` — Tauri serializes errors automatically
- Frontend: always `try/catch` around `invoke`
