use async_openai::{
    Client,
    config::OpenAIConfig,
    types::{
        ChatCompletionRequestAssistantMessageArgs,
        ChatCompletionRequestSystemMessageArgs,
        ChatCompletionRequestUserMessageArgs,
        ChatCompletionRequestMessage,
        CreateChatCompletionRequestArgs,
    },
};
use futures::StreamExt;
use tauri::{AppHandle, Emitter};

use crate::models::provider::AiProvider;
use crate::services::prompt::ChatMessage;

/// Streams a chat completion response token-by-token via Tauri events and
/// returns the full accumulated response string when done.
///
/// Events emitted:
///   - `chat-token`  — `{ "message_id": "…", "token": "…" }` for each delta
///   - `chat-done`   — `{ "message_id": "…" }` when the stream is exhausted
pub async fn stream_chat(
    app: AppHandle,
    messages: Vec<ChatMessage>,
    api_key: &str,
    provider: AiProvider,
    message_id: &str,
) -> Result<String, String> {
    let config = OpenAIConfig::new()
        .with_api_key(api_key)
        .with_api_base(provider.base_url());
    let client = Client::with_config(config);

    // Map our internal ChatMessage type to async-openai request messages.
    let request_messages: Vec<ChatCompletionRequestMessage> = messages
        .into_iter()
        .map(map_message)
        .collect::<Result<Vec<_>, String>>()?;

    let request = CreateChatCompletionRequestArgs::default()
        .model(provider.chat_model())
        .messages(request_messages)
        .stream(true)
        .build()
        .map_err(|e| format!("Failed to build chat request: {}", e))?;

    let mut stream = client
        .chat()
        .create_stream(request)
        .await
        .map_err(|e| format!("Chat API error: {}", e))?;

    let mut full_response = String::new();
    let msg_id = message_id.to_string();

    while let Some(result) = stream.next().await {
        match result {
            Ok(response) => {
                if let Some(choice) = response.choices.first() {
                    if let Some(ref token) = choice.delta.content {
                        full_response.push_str(token);

                        let payload = serde_json::json!({
                            "message_id": msg_id,
                            "token": token,
                        });
                        app.emit("chat-token", payload)
                            .map_err(|e| format!("Failed to emit chat-token: {}", e))?;
                    }
                }
            }
            Err(e) => {
                let _ = app.emit("chat-done", serde_json::json!({ "message_id": msg_id }));
                return Err(format!("Stream error: {}", e));
            }
        }
    }

    let done_payload = serde_json::json!({ "message_id": msg_id });
    app.emit("chat-done", done_payload)
        .map_err(|e| format!("Failed to emit chat-done: {}", e))?;

    Ok(full_response)
}

fn map_message(msg: ChatMessage) -> Result<ChatCompletionRequestMessage, String> {
    let mapped = match msg.role.as_str() {
        "system" => ChatCompletionRequestMessage::System(
            ChatCompletionRequestSystemMessageArgs::default()
                .content(msg.content)
                .build()
                .map_err(|e| format!("Failed to build system message: {}", e))?,
        ),
        "user" => ChatCompletionRequestMessage::User(
            ChatCompletionRequestUserMessageArgs::default()
                .content(msg.content)
                .build()
                .map_err(|e| format!("Failed to build user message: {}", e))?,
        ),
        "assistant" => ChatCompletionRequestMessage::Assistant(
            ChatCompletionRequestAssistantMessageArgs::default()
                .content(msg.content)
                .build()
                .map_err(|e| format!("Failed to build assistant message: {}", e))?,
        ),
        unknown => return Err(format!("Unknown message role: {}", unknown)),
    };
    Ok(mapped)
}
