import fs from "node:fs";
import path from "node:path";

import { MIN_SCORE, TOP_K, VECTOR_INDEX_PATH } from "./config";
import type { RetrievedChunk, VectorIndex } from "./types";

let cachedIndex: VectorIndex | null = null;

/** Cosine similarity between two equal-length vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Embedding dimension mismatch: ${a.length} vs ${b.length}. ` +
        "This usually means the embedding model changed since the index was " +
        "built. Rebuild it with `npm run embeddings`."
    );
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Load the vector index from disk (cached after first read). Returns null with
 * a helpful flag if the index has not been generated yet.
 */
export function loadVectorIndex(rootDir = process.cwd()): VectorIndex | null {
  if (cachedIndex) return cachedIndex;

  const file = path.join(rootDir, VECTOR_INDEX_PATH);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Corrupt / hand-edited file — treat as "not built" so the caller shows the
    // friendly "run `npm run embeddings`" message rather than crashing.
    return null;
  }

  const index = parsed as VectorIndex;
  if (!index || !Array.isArray(index.chunks) || index.chunks.length === 0) {
    return null;
  }

  cachedIndex = index;
  return cachedIndex;
}

/**
 * Rank chunks by similarity to the query embedding and return the most
 * relevant ones (above MIN_SCORE, up to TOP_K).
 */
export function searchIndex(
  index: VectorIndex,
  queryEmbedding: number[],
  topK = TOP_K,
  minScore = MIN_SCORE
): RetrievedChunk[] {
  const scored = index.chunks.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.filter((c) => c.score >= minScore).slice(0, topK);
}
