use async_openai::{
    Client,
    types::{CreateEmbeddingRequestArgs, EmbeddingInput},
};

const EMBEDDING_MODEL: &str = "text-embedding-3-small";
const EMBEDDING_DIMS: usize = 1536;

pub async fn embed_texts(texts: &[String]) -> Result<Vec<Vec<f32>>, String> {
    if texts.is_empty() {
        return Ok(vec![]);
    }

    let client = Client::new();

    let request = CreateEmbeddingRequestArgs::default()
        .model(EMBEDDING_MODEL)
        .input(EmbeddingInput::StringArray(texts.to_vec()))
        .build()
        .map_err(|e| format!("Failed to build embedding request: {}", e))?;

    let response = client
        .embeddings()
        .create(request)
        .await
        .map_err(|e| format!("Embedding API error: {}", e))?;

    let mut embeddings: Vec<Vec<f32>> = vec![vec![]; texts.len()];
    for item in response.data {
        let idx = item.index as usize;
        embeddings[idx] = item.embedding.iter().map(|&v| v as f32).collect();
    }

    // Verify dimensions
    for (i, emb) in embeddings.iter().enumerate() {
        if emb.len() != EMBEDDING_DIMS {
            return Err(format!(
                "Embedding {} has {} dims, expected {}",
                i, emb.len(), EMBEDDING_DIMS
            ));
        }
    }

    Ok(embeddings)
}

pub async fn embed_single(text: &str) -> Result<Vec<f32>, String> {
    let results = embed_texts(&[text.to_string()]).await?;
    results.into_iter().next().ok_or_else(|| "No embedding returned".to_string())
}
