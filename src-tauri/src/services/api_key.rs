use crate::models::provider::AiProvider;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const STORE_FILE: &str = "settings.json";
const KEY_NAME: &str = "api_key";
const PROVIDER_NAME: &str = "ai_provider";

pub fn save_api_key(app: &AppHandle, key: &str) -> Result<(), String> {
    let key = key.trim();

    if key.len() < 10 {
        return Err("API key must be at least 10 characters.".to_string());
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
        None => Err("No API key set. Please add your API key in Settings.".to_string()),
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

pub fn save_provider(app: &AppHandle, provider: AiProvider) -> Result<(), String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store.set(PROVIDER_NAME, serde_json::to_value(provider).map_err(|e| e.to_string())?);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

pub fn get_provider(app: &AppHandle) -> Result<AiProvider, String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;

    match store.get(PROVIDER_NAME) {
        Some(val) => serde_json::from_value(val.clone()).map_err(|e| e.to_string()),
        None => Ok(AiProvider::default()),
    }
}
