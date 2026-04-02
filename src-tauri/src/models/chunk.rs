use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chunk {
    pub id: i64,
    pub note_id: String,
    pub content: String,
    pub chunk_index: i32,
    pub token_count: i32,
}

#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct ChunkWithEmbedding {
    pub chunk: Chunk,
    pub embedding: Vec<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetrievedChunk {
    pub chunk_id: i64,
    pub note_id: String,
    pub content: String,
    pub chunk_index: i32,
    pub distance: f32,
}
