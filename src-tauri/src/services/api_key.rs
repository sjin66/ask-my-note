use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const STORE_FILE: &str = "settings.json";
const KEY_NAME: &str = "openai_api_key";

pub fn save_api_key(app: &AppHandle, key: &str) -> Result<(), String> {
    let key = key.trim();

    if !key.starts_with("sk-") || key.len() < 20 {
        return Err("Invalid API key format. Key must start with 'sk-' and be at least 20 characters.".to_string());
    }

    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store.set(KEY_NAME, serde_json::json!(key));
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}

pub fn get_api_key(app: &AppHandle) -> Result<String, String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;

    match store.get(KEY_NAME) {
        Some(val) => val
            .as_str()
            .map(|s| s.to_string())
            .ok_or_else(|| "API key is not a valid string".to_string()),
        None => Err("No API key set. Please add your OpenAI API key in Settings.".to_string()),
    }
}

pub fn has_api_key(app: &AppHandle) -> Result<bool, String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    Ok(store.get(KEY_NAME).is_some())
}

pub fn delete_api_key(app: &AppHandle) -> Result<(), String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    let _ = store.delete(KEY_NAME);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}
