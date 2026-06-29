/**
 * Centralised configuration, sourced from environment variables with sane
 * defaults so the demo works out of the box.
 */

export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

export const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

/** Number of chunks to retrieve for each question. */
export const TOP_K = 5;

/**
 * Minimum cosine similarity for a chunk to count as relevant. Chunks below
 * this score are ignored so off-topic questions fall back to the
 * "I don't have that information" response instead of hallucinating.
 */
export const MIN_SCORE = 0.2;

/** Relative path (from project root) to the generated vector index. */
export const VECTOR_INDEX_PATH = "data/vector-index.json";

/** Directory (from project root) holding the markdown knowledge files. */
export const KNOWLEDGE_DIR = "data/knowledge";

/** The exact phrase returned when the knowledge base has no answer. */
export const NO_ANSWER_MESSAGE =
  "I don't have that information in the current knowledge base.";
