use crate::db::{self, DbConnection};
use crate::models::note::Note;
use chrono::Utc;
use uuid::Uuid;

pub fn create_note(db: &DbConnection) -> Result<Note, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    let note = Note {
        id: Uuid::new_v4().to_string(),
        title: String::new(),
        content: String::new(),
        created_at: now.clone(),
        updated_at: now,
        is_indexed: false,
    };
    db::notes::insert_or_update(&conn, &note).map_err(|e| e.to_string())?;
    Ok(note)
}

pub fn save_note(db: &DbConnection, id: &str, title: &str, content: &str) -> Result<Note, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    let existing = db::notes::get_by_id(&conn, id).map_err(|e| e.to_string())?;
    let created_at = existing
        .map(|n| n.created_at)
        .unwrap_or_else(|| now.clone());

    let note = Note {
        id: id.to_string(),
        title: title.to_string(),
        content: content.to_string(),
        created_at,
        updated_at: now,
        is_indexed: false,
    };

    db::notes::insert_or_update(&conn, &note).map_err(|e| e.to_string())?;
    Ok(note)
}

pub fn list_notes(db: &DbConnection) -> Result<Vec<Note>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    db::notes::list_all(&conn).map_err(|e| e.to_string())
}

pub fn get_note(db: &DbConnection, id: &str) -> Result<Option<Note>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    db::notes::get_by_id(&conn, id).map_err(|e| e.to_string())
}

pub fn delete_note(db: &DbConnection, id: &str) -> Result<bool, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    db::notes::delete(&conn, id).map_err(|e| e.to_string())
}
