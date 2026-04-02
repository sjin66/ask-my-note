use serde::{Deserialize, Serialize};

use crate::db::{self, DbConnection};
use crate::models::provider::AiProvider;
use crate::services::embeddings;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetrievalResult {
    pub chunk_id: i64,
    pub note_id: String,
    pub note_title: String,
    pub content: String,
    pub chunk_index: i32,
    pub distance: f32,
}

/// Embeds `query`, searches for the top `limit` similar chunks in sqlite-vec,
/// and enriches each result with its parent note title.
pub async fn retrieve(
    db: &DbConnection,
    query: &str,
    api_key: &str,
    provider: AiProvider,
    limit: usize,
) -> Result<Vec<RetrievalResult>, String> {
    // 1. Embed the query using the same model used at index time.
    let embedding = embeddings::embed_single(query, api_key, provider).await?;

    // 2. Vector search — lock the connection only for the synchronous DB work.
    let conn = db.0.lock().map_err(|e| format!("DB lock poisoned: {}", e))?;

    let chunks = db::chunks::search_similar(&conn, &embedding, limit)
        .map_err(|e| format!("Vector search failed: {}", e))?;

    // 3. Enrich each chunk with its parent note title.
    //    Collect unique note IDs and batch-fetch titles to minimize lock hold time.
    let unique_note_ids: Vec<String> = {
        let mut ids: Vec<String> = chunks.iter().map(|c| c.note_id.clone()).collect();
        ids.sort();
        ids.dedup();
        ids
    };

    let mut title_map = std::collections::HashMap::new();
    for note_id in &unique_note_ids {
        let title = db::notes::get_by_id(&conn, note_id)
            .map_err(|e| format!("Note lookup failed for '{}': {}", note_id, e))?
            .map(|n| n.title)
            .unwrap_or_else(|| "Untitled".to_string());
        title_map.insert(note_id.clone(), title);
    }

    // Drop the lock before building results
    drop(conn);

    let mut results = Vec::with_capacity(chunks.len());
    for chunk in chunks {
        let note_title = title_map
            .get(&chunk.note_id)
            .cloned()
            .unwrap_or_else(|| "Untitled".to_string());

        results.push(RetrievalResult {
            chunk_id: chunk.chunk_id,
            note_id: chunk.note_id,
            note_title,
            content: chunk.content,
            chunk_index: chunk.chunk_index,
            distance: chunk.distance,
        });
    }

    Ok(results)
}
