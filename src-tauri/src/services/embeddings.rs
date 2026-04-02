use async_openai::{
    Client,
    config::OpenAIConfig,
    types::{CreateEmbeddingRequestArgs, EmbeddingInput},
};

use crate::models::provider::AiProvider;

pub const EMBEDDING_DIMS: usize = 1024;

pub async fn embed_texts(
    texts: &[String],
    api_key: &str,
    provider: AiProvider,
) -> Result<Vec<Vec<f32>>, String> {
    if texts.is_empty() {
        return Ok(vec![]);
    }

    let config = OpenAIConfig::new()
        .with_api_key(api_key)
        .with_api_base(provider.base_url());
    let client = Client::with_config(config);

    let mut builder = CreateEmbeddingRequestArgs::default();
    builder
        .model(provider.embedding_model())
        .input(EmbeddingInput::StringArray(texts.to_vec()));

    // OpenAI supports dimension reduction via API param; BigModel embedding-2 is native 1024
    if provider == AiProvider::OpenAI {
        builder.dimensions(EMBEDDING_DIMS as u32);
    }

    let request = builder
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
        embeddings[idx] = item.embedding.to_vec();
    }

    for (i, emb) in embeddings.iter().enumerate() {
        if emb.len() != EMBEDDING_DIMS {
            return Err(format!(
                "Embedding {} has {} dims, expected {}",
                i,
                emb.len(),
                EMBEDDING_DIMS
            ));
        }
    }

    Ok(embeddings)
}

/// Used by the upcoming RAG retrieval (Phase 5)
#[allow(dead_code)]
pub async fn embed_single(
    text: &str,
    api_key: &str,
    provider: AiProvider,
) -> Result<Vec<f32>, String> {
    let results = embed_texts(&[text.to_string()], api_key, provider).await?;
    results
        .into_iter()
        .next()
        .ok_or_else(|| "No embedding returned".to_string())
}
