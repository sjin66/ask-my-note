---
paths:
  - "src-tauri/src/services/**/*.rs"
  - "src-tauri/src/db/**/*.rs"
  - "src-tauri/src/commands/chat.rs"
  - "src/components/chat/**/*.tsx"
---

# RAG Pipeline Conventions

## Notes
- Notes are the source of truth — never modify note content silently
- Track `is_indexed: bool` on every note — set to `false` when content changes, re-index asynchronously
- Store raw markdown in the DB; render in the frontend

## Chunking
- Target: ~512 tokens per chunk with 50-token overlap
- Split on sentence/paragraph boundaries — never mid-sentence
- Every chunk stores `note_id`, `chunk_index`, and `token_count`

## Embeddings
- Model: `text-embedding-3-small` (1536 dimensions)
- Embed at write time (when a note is saved), not at query time
- Batch embed when indexing multiple notes at startup

## Retrieval
- Default: top-5 chunks by cosine similarity via `sqlite-vec`
- Always include `note_id`, `note_title`, and `chunk_index` in retrieved context passed to the LLM

## Citations
- Every AI response must cite source notes
- Citation format in responses: `[Note Title](note-id)` inline
- Pass citation instructions explicitly in the system prompt
- Never return an answer without at least one citation when notes were retrieved
