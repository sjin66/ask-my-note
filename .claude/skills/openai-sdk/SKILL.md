---
name: openai-sdk
description: OpenAI SDK patterns for this project — embeddings with text-embedding-3-small and streaming chat with GPT-4o using the async-openai Rust crate. Auto-apply when working on embedding, retrieval, or chat code.
user-invocable: false
allowed-tools: Read, Grep
---

Use the `async-openai` crate for all OpenAI API calls in this project.

```toml
[dependencies]
async-openai = "0.28"
futures = "0.3"
tokio = { version = "1", features = ["full"] }
```

## Embeddings

```rust
use async_openai::{Client, types::CreateEmbeddingRequestArgs};

pub async fn embed(text: &str) -> Result<Vec<f32>, Box<dyn std::error::Error>> {
    let client = Client::new(); // reads OPENAI_API_KEY from env
    let request = CreateEmbeddingRequestArgs::default()
        .model("text-embedding-3-small")
        .input(text)
        .build()?;
    let response = client.embeddings().create(request).await?;
    Ok(response.data[0].embedding.clone()) // 1536 dimensions
}
```

## Chat Completion (Streaming)

```rust
use async_openai::types::{
    ChatCompletionRequestSystemMessageArgs,
    ChatCompletionRequestUserMessageArgs,
    CreateChatCompletionRequestArgs,
};
use futures::StreamExt;

pub async fn stream_chat(
    system_prompt: &str,
    user_message: &str,
    app_handle: tauri::AppHandle,
) -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let request = CreateChatCompletionRequestArgs::default()
        .model("gpt-4o")
        .messages([
            ChatCompletionRequestSystemMessageArgs::default()
                .content(system_prompt)
                .build()?.into(),
            ChatCompletionRequestUserMessageArgs::default()
                .content(user_message)
                .build()?.into(),
        ])
        .stream(true)
        .build()?;

    let mut stream = client.chat().create_stream(request).await?;
    while let Some(chunk) = stream.next().await {
        let content = chunk?.choices[0].delta.content.clone().unwrap_or_default();
        app_handle.emit("chat-stream", content)?;
    }
    app_handle.emit("chat-stream-done", ())?;
    Ok(())
}
```

## Environment

- Store `OPENAI_API_KEY` in `.env` at the project root
- Never commit `.env` — it must be in `.gitignore`
