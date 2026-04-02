use chrono::Utc;
use tauri::AppHandle;
use uuid::Uuid;

use crate::db::{self, DbConnection};
use crate::models::conversation::{Citation, Conversation, Message};
use crate::models::provider::AiProvider;
use crate::services::{chat, prompt, retrieval};

/// Full RAG send-message pipeline:
///   1. Persist the user message.
///   2. Embed the query and retrieve top-5 relevant chunks.
///   3. Build the system prompt and full message list.
///   4. Load conversation history (released before any await).
///   5. Stream GPT response via Tauri events.
///   6. Persist the assistant message + citations.
///   7. Auto-title the conversation from the first user message if needed.
///
/// IMPORTANT: The DB mutex is never held across an `.await` boundary.
pub async fn send_message(
    app: AppHandle,
    db: &DbConnection,
    conversation_id: &str,
    user_content: &str,
    api_key: &str,
    provider: AiProvider,
) -> Result<Message, String> {
    let now = Utc::now().to_rfc3339();

    // --- 1. Persist user message ---
    let user_msg = Message {
        id: Uuid::new_v4().to_string(),
        conversation_id: conversation_id.to_string(),
        role: "user".to_string(),
        content: user_content.to_string(),
        created_at: now.clone(),
    };
    {
        let conn = db.0.lock().map_err(|e| format!("DB lock poisoned: {}", e))?;
        db::messages::insert(&conn, &user_msg).map_err(|e| e.to_string())?;
    }

    // --- 2. Retrieve relevant chunks (async — no lock held) ---
    let retrieval_results = retrieval::retrieve(db, user_content, api_key, provider, 5).await?;

    // --- 3. Build system prompt ---
    let system_prompt = prompt::build_system_prompt(&retrieval_results);

    // --- 4. Load history (lock, read, drop guard before await) ---
    let history = {
        let conn = db.0.lock().map_err(|e| format!("DB lock poisoned: {}", e))?;
        db::messages::list_by_conversation(&conn, conversation_id)
            .map_err(|e| e.to_string())?
    };

    // --- 5. Build message list for the LLM ---
    // History at this point includes the user message we just saved, so we pass
    // the slice excluding the last entry to avoid a duplicate user turn.
    let history_without_current = if history.is_empty() {
        &[][..]
    } else {
        &history[..history.len() - 1]
    };
    let chat_messages = prompt::build_messages(&system_prompt, history_without_current, user_content);

    // --- 6. Stream LLM response (async — no lock held) ---
    let assistant_id = Uuid::new_v4().to_string();
    let full_response = match chat::stream_chat(
        app,
        chat_messages,
        api_key,
        provider,
        &assistant_id,
    )
    .await
    {
        Ok(response) => response,
        Err(e) => {
            // Clean up the dangling user message so the conversation isn't left in a broken state
            let _ = db.0.lock().map(|conn| {
                let _ = conn.execute("DELETE FROM messages WHERE id = ?1", [&user_msg.id]);
            });
            return Err(e);
        }
    };

    // --- 7. Persist assistant message ---
    let assistant_msg = Message {
        id: assistant_id.clone(),
        conversation_id: conversation_id.to_string(),
        role: "assistant".to_string(),
        content: full_response,
        created_at: Utc::now().to_rfc3339(),
    };
    {
        let conn = db.0.lock().map_err(|e| format!("DB lock poisoned: {}", e))?;
        db::messages::insert(&conn, &assistant_msg).map_err(|e| e.to_string())?;

        // --- 8. Persist citations (one per retrieval result) ---
        for result in &retrieval_results {
            let citation = Citation {
                id: 0, // auto-assigned by SQLite
                message_id: assistant_id.clone(),
                note_id: result.note_id.clone(),
                chunk_content: result.content.clone(),
                relevance_score: result.distance,
            };
            db::messages::insert_citation(&conn, &citation).map_err(|e| e.to_string())?;
        }

        // --- 9. Auto-title: set title to first 50 chars of user message if blank ---
        if let Ok(Some(conv)) = db::conversations::get_by_id(&conn, conversation_id) {
            if conv.title.trim().is_empty() {
                let title: String = user_content.chars().take(50).collect();
                db::conversations::update_title(&conn, conversation_id, &title)
                    .map_err(|e| e.to_string())?;
            }
        }
    }

    Ok(assistant_msg)
}

// ---------------------------------------------------------------------------
// Simple synchronous helpers — thin wrappers over db layer
// ---------------------------------------------------------------------------

pub fn create_conversation(db: &DbConnection) -> Result<Conversation, String> {
    let conv = Conversation {
        id: Uuid::new_v4().to_string(),
        title: String::new(),
        created_at: Utc::now().to_rfc3339(),
    };
    let conn = db.0.lock().map_err(|e| format!("DB lock poisoned: {}", e))?;
    db::conversations::insert(&conn, &conv).map_err(|e| e.to_string())?;
    Ok(conv)
}

pub fn list_conversations(db: &DbConnection) -> Result<Vec<Conversation>, String> {
    let conn = db.0.lock().map_err(|e| format!("DB lock poisoned: {}", e))?;
    db::conversations::list_all(&conn).map_err(|e| e.to_string())
}

pub fn get_messages(db: &DbConnection, conversation_id: &str) -> Result<Vec<Message>, String> {
    let conn = db.0.lock().map_err(|e| format!("DB lock poisoned: {}", e))?;
    db::messages::list_by_conversation(&conn, conversation_id).map_err(|e| e.to_string())
}

pub fn get_citations(db: &DbConnection, message_id: &str) -> Result<Vec<Citation>, String> {
    let conn = db.0.lock().map_err(|e| format!("DB lock poisoned: {}", e))?;
    db::messages::get_citations_for_message(&conn, message_id).map_err(|e| e.to_string())
}

pub fn delete_conversation(db: &DbConnection, conversation_id: &str) -> Result<bool, String> {
    let conn = db.0.lock().map_err(|e| format!("DB lock poisoned: {}", e))?;
    db::conversations::delete(&conn, conversation_id).map_err(|e| e.to_string())
}
