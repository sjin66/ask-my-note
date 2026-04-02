use crate::models::conversation::Conversation;
use rusqlite::{params, Connection};

pub fn insert(conn: &Connection, conv: &Conversation) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO conversations (id, title, created_at) VALUES (?1, ?2, ?3)",
        params![conv.id, conv.title, conv.created_at],
    )?;
    Ok(())
}

pub fn list_all(conn: &Connection) -> Result<Vec<Conversation>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, title, created_at FROM conversations ORDER BY created_at DESC",
    )?;

    let conversations = stmt.query_map([], |row| {
        Ok(Conversation {
            id: row.get(0)?,
            title: row.get(1)?,
            created_at: row.get(2)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    Ok(conversations)
}

pub fn get_by_id(conn: &Connection, id: &str) -> Result<Option<Conversation>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, title, created_at FROM conversations WHERE id = ?1",
    )?;

    let mut rows = stmt.query_map([id], |row| {
        Ok(Conversation {
            id: row.get(0)?,
            title: row.get(1)?,
            created_at: row.get(2)?,
        })
    })?;

    match rows.next() {
        Some(row) => Ok(Some(row?)),
        None => Ok(None),
    }
}

pub fn update_title(conn: &Connection, id: &str, title: &str) -> Result<(), rusqlite::Error> {
    conn.execute(
        "UPDATE conversations SET title = ?1 WHERE id = ?2",
        params![title, id],
    )?;
    Ok(())
}

pub fn delete(conn: &Connection, id: &str) -> Result<bool, rusqlite::Error> {
    let affected = conn.execute("DELETE FROM conversations WHERE id = ?1", [id])?;
    Ok(affected > 0)
}
