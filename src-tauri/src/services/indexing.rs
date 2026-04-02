use crate::db::{self, DbConnection};
use crate::models::chunk::Chunk;
use crate::models::provider::AiProvider;
use crate::services::{chunker, embeddings};

/// Index a note: chunk its content, embed the chunks, store in sqlite-vec.
/// Deletes any existing chunks for this note first (full re-index on every save).
pub async fn index_note(db: &DbConnection, note_id: &str, content: &str, api_key: &str, provider: AiProvider) -> Result<(), String> {
    // Strip HTML tags for plain text chunking
    let plain_text = strip_html(content);

    if plain_text.trim().is_empty() {
        // Nothing to index — just clean up old chunks
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        db::chunks::delete_by_note_id(&conn, note_id).map_err(|e| e.to_string())?;
        mark_indexed(&conn, note_id)?;
        return Ok(());
    }

    // 1. Chunk the text
    let text_chunks = chunker::chunk_text(&plain_text)?;

    if text_chunks.is_empty() {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        db::chunks::delete_by_note_id(&conn, note_id).map_err(|e| e.to_string())?;
        mark_indexed(&conn, note_id)?;
        return Ok(());
    }

    // 2. Embed all chunks in one batch API call
    let texts: Vec<String> = text_chunks.iter().map(|c| c.content.clone()).collect();
    let embeddings_result = embeddings::embed_texts(&texts, api_key, provider).await?;

    // 3. Store in DB within a transaction (delete old chunks, insert new ones)
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute_batch("BEGIN").map_err(|e| e.to_string())?;

    let result = (|| -> Result<(), String> {
        db::chunks::delete_by_note_id(&conn, note_id).map_err(|e| e.to_string())?;

        for (text_chunk, embedding) in text_chunks.iter().zip(embeddings_result.iter()) {
            let chunk = Chunk {
                id: 0, // auto-increment
                note_id: note_id.to_string(),
                content: text_chunk.content.clone(),
                chunk_index: text_chunk.chunk_index,
                token_count: text_chunk.token_count,
            };

            db::chunks::insert_with_embedding(&conn, &chunk, embedding)
                .map_err(|e| e.to_string())?;
        }

        mark_indexed(&conn, note_id)?;
        Ok(())
    })();

    match result {
        Ok(()) => {
            conn.execute_batch("COMMIT").map_err(|e| e.to_string())?;
        }
        Err(e) => {
            let _ = conn.execute_batch("ROLLBACK");
            return Err(e);
        }
    }

    Ok(())
}

fn mark_indexed(conn: &std::sync::MutexGuard<'_, rusqlite::Connection>, note_id: &str) -> Result<(), String> {
    conn.execute(
        "UPDATE notes SET is_indexed = 1 WHERE id = ?1",
        [note_id],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

fn strip_html(html: &str) -> String {
    let mut result = String::with_capacity(html.len());
    let mut in_tag = false;

    for ch in html.chars() {
        match ch {
            '<' => in_tag = true,
            '>' => {
                in_tag = false;
                result.push(' ');
            }
            _ if !in_tag => result.push(ch),
            _ => {}
        }
    }

    // Collapse whitespace
    let collapsed: String = result
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");

    collapsed
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_strip_html() {
        assert_eq!(strip_html("<p>Hello <b>world</b></p>"), "Hello world");
        assert_eq!(strip_html("no tags"), "no tags");
        assert_eq!(strip_html("<p></p>"), "");
    }
}
