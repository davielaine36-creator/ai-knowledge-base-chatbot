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

/**
 * Supabase (pgvector) configuration. When both a URL and key are present the
 * app retrieves from Supabase; otherwise it falls back to the local JSON index.
 */
export const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

/** True when Supabase retrieval is configured. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

/** Name of the pgvector similarity-search function in Supabase. */
export const SUPABASE_MATCH_FN = "kb_match_documents";

/** Name of the pgvector documents table in Supabase. */
export const SUPABASE_TABLE = "kb_documents";
