use crate::db::DbConnection;
use crate::models::note::Note;
use crate::services;

#[tauri::command]
pub fn create_note(db: tauri::State<'_, DbConnection>) -> Result<Note, String> {
    services::notes::create_note(&db)
}

#[tauri::command]
pub fn save_note(
    db: tauri::State<'_, DbConnection>,
    id: String,
    title: String,
    content: String,
) -> Result<Note, String> {
    services::notes::save_note(&db, &id, &title, &content)
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
