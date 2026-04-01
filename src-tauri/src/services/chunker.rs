use tiktoken_rs::cl100k_base;

const TARGET_CHUNK_TOKENS: usize = 512;
const OVERLAP_TOKENS: usize = 50;
const MIN_CHUNK_TOKENS: usize = 100;

#[derive(Debug, Clone)]
pub struct TextChunk {
    pub content: String,
    pub chunk_index: i32,
    pub token_count: i32,
}

pub fn chunk_text(text: &str) -> Result<Vec<TextChunk>, String> {
    let bpe = cl100k_base().map_err(|e| e.to_string())?;

    let paragraphs = split_paragraphs(text);
    let mut chunks: Vec<TextChunk> = Vec::new();
    let mut current_tokens: Vec<u32> = Vec::new();
    let mut current_text = String::new();

    for para in &paragraphs {
        let para_tokens = bpe.encode_with_special_tokens(para);
        let para_token_count = para_tokens.len();

        if current_tokens.len() + para_token_count > TARGET_CHUNK_TOKENS && !current_tokens.is_empty() {
            // Current chunk is full — finalize it
            chunks.push(TextChunk {
                content: current_text.trim().to_string(),
                chunk_index: chunks.len() as i32,
                token_count: current_tokens.len() as i32,
            });

            // Start new chunk with overlap from the end of the previous chunk
            let overlap_start = if current_tokens.len() > OVERLAP_TOKENS {
                current_tokens.len() - OVERLAP_TOKENS
            } else {
                0
            };
            let overlap_token_ids = &current_tokens[overlap_start..];
            let overlap_text = bpe.decode(overlap_token_ids.to_vec())
                .unwrap_or_default();

            current_text = overlap_text;
            current_tokens = overlap_token_ids.to_vec();
        }

        if !current_text.is_empty() && !current_text.ends_with('\n') {
            current_text.push('\n');
        }
        current_text.push_str(para);
        current_tokens.extend(para_tokens);
    }

    // Don't forget the last chunk
    if !current_text.trim().is_empty() {
        let token_count = current_tokens.len();

        // Merge tiny trailing chunks into the previous one
        if token_count < MIN_CHUNK_TOKENS && !chunks.is_empty() {
            let last = chunks.last_mut().unwrap();
            last.content.push('\n');
            last.content.push_str(current_text.trim());
            last.token_count += token_count as i32;
        } else {
            chunks.push(TextChunk {
                content: current_text.trim().to_string(),
                chunk_index: chunks.len() as i32,
                token_count: token_count as i32,
            });
        }
    }

    Ok(chunks)
}

fn split_paragraphs(text: &str) -> Vec<String> {
    text.split("\n\n")
        .map(|p| p.trim().to_string())
        .filter(|p| !p.is_empty())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chunk_short_text() {
        let result = chunk_text("Hello world. This is a short note.").unwrap();
        assert_eq!(result.len(), 1);
        assert!(result[0].token_count > 0);
    }

    #[test]
    fn test_chunk_empty_text() {
        let result = chunk_text("").unwrap();
        assert!(result.is_empty());
    }

    #[test]
    fn test_chunk_preserves_content() {
        let text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
        let result = chunk_text(text).unwrap();
        assert!(!result.is_empty());
        // All paragraphs should appear somewhere in the chunks
        let all_content: String = result.iter().map(|c| c.content.clone()).collect();
        assert!(all_content.contains("First paragraph"));
        assert!(all_content.contains("Third paragraph"));
    }
}
