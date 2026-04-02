use crate::models::conversation::{Citation, Message};
use rusqlite::{params, Connection};

pub fn insert(conn: &Connection, msg: &Message) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO messages (id, conversation_id, role, content, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![msg.id, msg.conversation_id, msg.role, msg.content, msg.created_at],
    )?;
    Ok(())
}

pub fn list_by_conversation(
    conn: &Connection,
    conversation_id: &str,
) -> Result<Vec<Message>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, conversation_id, role, content, created_at
         FROM messages WHERE conversation_id = ?1 ORDER BY created_at ASC",
    )?;

    let messages = stmt.query_map([conversation_id], |row| {
        Ok(Message {
            id: row.get(0)?,
            conversation_id: row.get(1)?,
            role: row.get(2)?,
            content: row.get(3)?,
            created_at: row.get(4)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    Ok(messages)
}

pub fn insert_citation(conn: &Connection, citation: &Citation) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO citations (message_id, note_id, chunk_content, relevance_score)
         VALUES (?1, ?2, ?3, ?4)",
        params![
            citation.message_id,
            citation.note_id,
            citation.chunk_content,
            citation.relevance_score
        ],
    )?;
    Ok(())
}

pub fn get_citations_for_message(
    conn: &Connection,
    message_id: &str,
) -> Result<Vec<Citation>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, message_id, note_id, chunk_content, relevance_score
         FROM citations WHERE message_id = ?1",
    )?;

    let citations = stmt.query_map([message_id], |row| {
        Ok(Citation {
            id: row.get(0)?,
            message_id: row.get(1)?,
            note_id: row.get(2)?,
            chunk_content: row.get(3)?,
            relevance_score: row.get(4)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    Ok(citations)
}
