mod commands;
mod db;
mod models;
mod services;

use tauri::Manager;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
