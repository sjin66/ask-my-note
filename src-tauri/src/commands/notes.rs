use crate::db::DbConnection;
use crate::models::note::Note;
use crate::services;

#[tauri::command]
pub fn create_note(db: tauri::State<'_, DbConnection>) -> Result<Note, String> {
    services::notes::create_note(&db)
}

#[tauri::command]
pub fn save_note(
    app_handle: tauri::AppHandle,
    db: tauri::State<'_, DbConnection>,
    id: String,
    title: String,
    content: String,
) -> Result<Note, String> {
    let note = services::notes::save_note(&db, &id, &title, &content)?;

    // Read API key — skip indexing if not set (don't block the save)
    let api_key = match services::api_key::get_api_key(&app_handle) {
        Ok(key) => key,
        Err(_) => {
            eprintln!("[indexing] Skipped — no API key set");
            return Ok(note);
        }
    };

    let db_clone = db.inner().clone();
    let note_id = note.id.clone();
    let note_content = note.content.clone();

    tauri::async_runtime::spawn(async move {
        match services::indexing::index_note(&db_clone, &note_id, &note_content, &api_key).await {
            Ok(_) => println!("[indexing] Indexed note {}", note_id),
            Err(e) => eprintln!("[indexing] Failed to index note {}: {}", note_id, e),
        }
    });

    Ok(note)
}

#[tauri::command]
pub fn list_notes(db: tauri::State<'_, DbConnection>) -> Result<Vec<Note>, String> {
    services::notes::list_notes(&db)
}

#[tauri::command]
pub fn get_note(db: tauri::State<'_, DbConnection>, id: String) -> Result<Option<Note>, String> {
    services::notes::get_note(&db, &id)
}

#[tauri::command]
pub fn delete_note(db: tauri::State<'_, DbConnection>, id: String) -> Result<bool, String> {
    services::notes::delete_note(&db, &id)
}
