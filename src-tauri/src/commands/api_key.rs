use crate::models::provider::AiProvider;
use crate::services;

#[tauri::command]
pub fn save_api_key(app_handle: tauri::AppHandle, key: String) -> Result<(), String> {
    services::api_key::save_api_key(&app_handle, &key)
}

#[tauri::command]
pub fn has_api_key(app_handle: tauri::AppHandle) -> Result<bool, String> {
    services::api_key::has_api_key(&app_handle)
}

#[tauri::command]
pub fn delete_api_key(app_handle: tauri::AppHandle) -> Result<(), String> {
    services::api_key::delete_api_key(&app_handle)
}

#[tauri::command]
pub fn save_provider(app_handle: tauri::AppHandle, provider: AiProvider) -> Result<(), String> {
    services::api_key::save_provider(&app_handle, provider)
}

#[tauri::command]
pub fn get_provider(app_handle: tauri::AppHandle) -> Result<AiProvider, String> {
    services::api_key::get_provider(&app_handle)
}
