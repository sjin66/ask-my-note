use crate::models::chunk::{Chunk, RetrievedChunk};
use rusqlite::{params, Connection};

pub fn delete_by_note_id(conn: &Connection, note_id: &str) -> Result<(), rusqlite::Error> {
    // Get chunk IDs to delete from vec table
    let mut stmt = conn.prepare("SELECT id FROM chunks WHERE note_id = ?1")?;
    let ids: Vec<i64> = stmt.query_map([note_id], |row| row.get(0))?
        .collect::<Result<Vec<_>, _>>()?;

    for id in &ids {
        conn.execute("DELETE FROM vec_chunks WHERE rowid = ?1", [id])?;
    }

    conn.execute("DELETE FROM chunks WHERE note_id = ?1", [note_id])?;
    Ok(())
}

pub fn insert_with_embedding(
    conn: &Connection,
    chunk: &Chunk,
    embedding: &[f32],
) -> Result<i64, rusqlite::Error> {
    conn.execute(
        "INSERT INTO chunks (note_id, content, chunk_index, token_count)
         VALUES (?1, ?2, ?3, ?4)",
        params![chunk.note_id, chunk.content, chunk.chunk_index, chunk.token_count],
    )?;

    let chunk_id = conn.last_insert_rowid();

    let embedding_blob = embedding
        .iter()
        .flat_map(|f| f.to_le_bytes())
        .collect::<Vec<u8>>();

    conn.execute(
        "INSERT INTO vec_chunks (rowid, embedding) VALUES (?1, ?2)",
        params![chunk_id, embedding_blob],
    )?;

    Ok(chunk_id)
}

pub fn search_similar(
    conn: &Connection,
    query_embedding: &[f32],
    limit: usize,
) -> Result<Vec<RetrievedChunk>, rusqlite::Error> {
    let query_blob = query_embedding
        .iter()
        .flat_map(|f| f.to_le_bytes())
        .collect::<Vec<u8>>();

    let mut stmt = conn.prepare(
        "SELECT c.id, c.note_id, c.content, c.chunk_index, v.distance
         FROM vec_chunks v
         INNER JOIN chunks c ON c.id = v.rowid
         WHERE v.embedding MATCH ?1
         ORDER BY v.distance
         LIMIT ?2"
    )?;

    let results = stmt.query_map(params![query_blob, limit as i64], |row| {
        Ok(RetrievedChunk {
            chunk_id: row.get(0)?,
            note_id: row.get(1)?,
            content: row.get(2)?,
            chunk_index: row.get(3)?,
            distance: row.get(4)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    Ok(results)
}
