mod commands;
mod db;
mod models;
mod services;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");

            let db = db::init_db(&app_dir).expect("failed to initialize database");
            app.manage(db);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::notes::create_note,
            commands::notes::save_note,
            commands::notes::list_notes,
            commands::notes::get_note,
            commands::notes::delete_note,
            commands::api_key::save_api_key,
            commands::api_key::has_api_key,
            commands::api_key::delete_api_key,
            commands::api_key::save_provider,
            commands::api_key::get_provider,
            commands::chat::create_conversation,
            commands::chat::list_conversations,
            commands::chat::get_conversation_messages,
            commands::chat::get_message_citations,
            commands::chat::delete_conversation,
            commands::chat::send_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
