use crate::db::DbConnection;
use crate::models::conversation::{Citation, Conversation, Message};
use crate::services;

#[tauri::command]
pub fn create_conversation(db: tauri::State<'_, DbConnection>) -> Result<Conversation, String> {
    services::conversation::create_conversation(&db)
}

#[tauri::command]
pub fn list_conversations(db: tauri::State<'_, DbConnection>) -> Result<Vec<Conversation>, String> {
    services::conversation::list_conversations(&db)
}

#[tauri::command]
pub fn get_conversation_messages(
    db: tauri::State<'_, DbConnection>,
    conversation_id: String,
) -> Result<Vec<Message>, String> {
    services::conversation::get_messages(&db, &conversation_id)
}

#[tauri::command]
pub fn get_message_citations(
    db: tauri::State<'_, DbConnection>,
    message_id: String,
) -> Result<Vec<Citation>, String> {
    services::conversation::get_citations(&db, &message_id)
}

#[tauri::command]
pub fn delete_conversation(
    db: tauri::State<'_, DbConnection>,
    conversation_id: String,
) -> Result<bool, String> {
    services::conversation::delete_conversation(&db, &conversation_id)
}

#[tauri::command]
pub async fn send_message(
    app_handle: tauri::AppHandle,
    db: tauri::State<'_, DbConnection>,
    conversation_id: String,
    content: String,
) -> Result<Message, String> {
    let api_key = services::api_key::get_api_key(&app_handle)?;
    let provider = services::api_key::get_provider(&app_handle)?;

    // Clone the Arc'd inner connection so `db` (State, not Send) is not held
    // across the await boundary.
    let db_clone = db.inner().clone();

    services::conversation::send_message(
        app_handle,
        &db_clone,
        &conversation_id,
        &content,
        &api_key,
        provider,
    )
    .await
}
