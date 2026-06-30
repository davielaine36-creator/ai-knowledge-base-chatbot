import {
  EMBEDDING_MODEL,
  isSupabaseConfigured,
  MIN_SCORE,
  SUPABASE_MATCH_FN,
  TOP_K,
} from "./config";
import { embedText } from "./embeddings";
import { getSupabase } from "./supabase";
import type { RetrievedChunk } from "./types";
import { loadVectorIndex, searchIndex } from "./vectorStore";

export type RetrievalBackend = "supabase" | "local";

/** Outcome of a retrieval attempt, mirroring the RAG failure cases. */
export type RetrieveOutcome =
  | { ok: true; backend: RetrievalBackend; chunks: RetrievedChunk[] }
  | { ok: false; reason: "no-index" }
  | { ok: false; reason: "model-mismatch"; message: string };

interface MatchRow {
  id: string;
  source: string;
  source_file: string;
  heading: string;
  content: string;
  score: number;
}

/**
 * Retrieve the most relevant knowledge base chunks for a question. Uses
 * Supabase (pgvector) when configured, otherwise the local JSON index.
 */
export async function retrieve(question: string): Promise<RetrieveOutcome> {
  if (isSupabaseConfigured()) {
    return retrieveFromSupabase(question);
  }
  return retrieveFromLocalIndex(question);
}

async function retrieveFromSupabase(
  question: string
): Promise<RetrieveOutcome> {
  const embedding = await embedText(question);
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc(SUPABASE_MATCH_FN, {
    query_embedding: embedding,
    match_count: TOP_K,
    min_score: MIN_SCORE,
  });

  if (error) {
    throw new Error(`Supabase retrieval failed: ${error.message}`);
  }

  const rows = (data ?? []) as MatchRow[];
  const chunks: RetrievedChunk[] = rows.map((r) => ({
    id: r.id,
    source: r.source,
    sourceFile: r.source_file,
    heading: r.heading,
    text: r.content,
    embedding: [],
    score: r.score,
  }));

  return { ok: true, backend: "supabase", chunks };
}

async function retrieveFromLocalIndex(
  question: string
): Promise<RetrieveOutcome> {
  const index = loadVectorIndex();
  if (!index) return { ok: false, reason: "no-index" };

  // The query must be embedded with the same model the index was built with.
  if (index.embeddingModel && index.embeddingModel !== EMBEDDING_MODEL) {
    return {
      ok: false,
      reason: "model-mismatch",
      message:
        `The knowledge base index was built with "${index.embeddingModel}" but the app ` +
        `is configured to use "${EMBEDDING_MODEL}". Rebuild the index with ` +
        "`npm run embeddings`, or set OPENAI_EMBEDDING_MODEL back to " +
        `"${index.embeddingModel}".`,
    };
  }

  const embedding = await embedText(question);
  const chunks = searchIndex(index, embedding);
  return { ok: true, backend: "local", chunks };
}
