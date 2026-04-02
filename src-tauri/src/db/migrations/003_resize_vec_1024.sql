-- Resize vec_chunks from float[1536] to float[1024] for multi-provider support.
-- All existing embeddings must be re-generated with the new dimension.
DROP TABLE IF EXISTS vec_chunks;
UPDATE notes SET is_indexed = 0;
