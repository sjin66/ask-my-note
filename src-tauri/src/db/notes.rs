use crate::models::note::Note;
use rusqlite::{params, Connection};

pub fn insert_or_update(conn: &Connection, note: &Note) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO notes (id, title, content, created_at, updated_at, is_indexed)
         VALUES (?1, ?2, ?3, ?4, ?5, 0)
         ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            content = excluded.content,
            updated_at = excluded.updated_at,
            is_indexed = 0",
        params![note.id, note.title, note.content, note.created_at, note.updated_at],
    )?;
    Ok(())
}

pub fn list_all(conn: &Connection) -> Result<Vec<Note>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, title, content, created_at, updated_at, is_indexed
         FROM notes ORDER BY updated_at DESC"
    )?;

    let notes = stmt.query_map([], |row| {
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
            is_indexed: row.get::<_, i32>(5)? != 0,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    Ok(notes)
}

pub fn get_by_id(conn: &Connection, id: &str) -> Result<Option<Note>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, title, content, created_at, updated_at, is_indexed
         FROM notes WHERE id = ?1"
    )?;

    let mut rows = stmt.query_map([id], |row| {
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
            is_indexed: row.get::<_, i32>(5)? != 0,
        })
    })?;

    match rows.next() {
        Some(row) => Ok(Some(row?)),
        None => Ok(None),
    }
}

pub fn delete(conn: &Connection, id: &str) -> Result<bool, rusqlite::Error> {
    let affected = conn.execute("DELETE FROM notes WHERE id = ?1", [id])?;
    Ok(affected > 0)
}
