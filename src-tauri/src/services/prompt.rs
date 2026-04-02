use crate::models::conversation::Message;
use crate::services::retrieval::RetrievalResult;

/// A single message in the chat request sent to the LLM.
#[derive(Debug, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

/// Builds the system prompt that will be sent as the first message of every
/// chat request.  When chunks are provided the prompt embeds them as labelled
/// excerpts and instructs the model to cite every claim inline.  When no chunks
/// are available the model is told to be honest about the missing context.
pub fn build_system_prompt(context_chunks: &[RetrievalResult]) -> String {
    let mut prompt = String::from(
        "You are a helpful assistant that answers questions based on the user's personal notes.\n\
         Use the following note excerpts to answer the question. \
         You MUST cite every claim using inline citations in the format [Note Title](note-id). \
         Only cite notes that appear in the context below. \
         Never answer without at least one citation when context is available.\n\
         If the context does not contain enough information to answer, say so honestly \
         and do not invent facts.\n",
    );

    if context_chunks.is_empty() {
        prompt.push_str(
            "\nNo relevant notes were found in your knowledge base for this query. \
             Answer based on general knowledge if helpful, but make clear that no \
             personal notes are available as sources.\n",
        );
        return prompt;
    }

    prompt.push_str("\n--- Retrieved note excerpts ---\n");

    for chunk in context_chunks {
        prompt.push_str(&format!(
            "\n---\nSource: \"{}\" (note-id: {}), Chunk {}:\n{}\n",
            chunk.note_title, chunk.note_id, chunk.chunk_index, chunk.content
        ));
    }

    prompt.push_str("\n--- End of excerpts ---\n");
    prompt
}

/// Assembles the ordered list of messages to send to the chat completion API:
///   1. System prompt (context + citation instructions)
///   2. Up to the last 20 messages from conversation history
///   3. The current user query
pub fn build_messages(
    system_prompt: &str,
    history: &[Message],
    user_query: &str,
) -> Vec<ChatMessage> {
    // Cap history to avoid blowing the context window.  Take the tail so that
    // the most-recent exchanges are always retained.
    const MAX_HISTORY: usize = 20;
    let history_window = if history.len() > MAX_HISTORY {
        &history[history.len() - MAX_HISTORY..]
    } else {
        history
    };

    let mut messages = Vec::with_capacity(1 + history_window.len() + 1);

    messages.push(ChatMessage {
        role: "system".to_string(),
        content: system_prompt.to_string(),
    });

    for msg in history_window {
        messages.push(ChatMessage {
            role: msg.role.clone(),
            content: msg.content.clone(),
        });
    }

    messages.push(ChatMessage {
        role: "user".to_string(),
        content: user_query.to_string(),
    });

    messages
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_chunk(note_id: &str, note_title: &str, chunk_index: i32, content: &str) -> RetrievalResult {
        RetrievalResult {
            chunk_id: 1,
            note_id: note_id.to_string(),
            note_title: note_title.to_string(),
            content: content.to_string(),
            chunk_index,
            distance: 0.1,
        }
    }

    fn make_message(role: &str, content: &str) -> Message {
        Message {
            id: "msg-1".to_string(),
            conversation_id: "conv-1".to_string(),
            role: role.to_string(),
            content: content.to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
        }
    }

    #[test]
    fn system_prompt_contains_citation_instructions() {
        let chunks = vec![make_chunk("abc123", "Meeting Notes", 0, "We discussed Q3 goals.")];
        let prompt = build_system_prompt(&chunks);

        assert!(prompt.contains("[Note Title](note-id)"));
        assert!(prompt.contains("Meeting Notes"));
        assert!(prompt.contains("abc123"));
        assert!(prompt.contains("Chunk 0"));
        assert!(prompt.contains("We discussed Q3 goals."));
    }

    #[test]
    fn system_prompt_no_chunks_signals_missing_context() {
        let prompt = build_system_prompt(&[]);

        assert!(prompt.contains("No relevant notes were found"));
        // Citation instructions should still be present.
        assert!(prompt.contains("[Note Title](note-id)"));
    }

    #[test]
    fn build_messages_ordering() {
        let chunks = vec![make_chunk("n1", "Notes", 0, "content")];
        let system = build_system_prompt(&chunks);
        let history = vec![
            make_message("user", "Hello"),
            make_message("assistant", "Hi there"),
        ];

        let messages = build_messages(&system, &history, "What are the Q3 goals?");

        assert_eq!(messages[0].role, "system");
        assert_eq!(messages[1].role, "user");
        assert_eq!(messages[1].content, "Hello");
        assert_eq!(messages[2].role, "assistant");
        assert_eq!(messages[3].role, "user");
        assert_eq!(messages[3].content, "What are the Q3 goals?");
    }

    #[test]
    fn build_messages_history_capped_at_20() {
        let system = build_system_prompt(&[]);
        // Create 30 history messages alternating user/assistant.
        let history: Vec<Message> = (0..30)
            .map(|i| {
                let role = if i % 2 == 0 { "user" } else { "assistant" };
                make_message(role, &format!("message {}", i))
            })
            .collect();

        let messages = build_messages(&system, &history, "final question");

        // system + 20 history + 1 user query = 22
        assert_eq!(messages.len(), 22);
        // The tail of history is retained; message 10 is the first kept.
        assert_eq!(messages[1].content, "message 10");
        assert_eq!(messages.last().unwrap().content, "final question");
    }
}
