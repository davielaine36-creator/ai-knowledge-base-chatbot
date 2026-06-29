/**
 * Shared types for the RAG knowledge base.
 */

/** A single chunk of knowledge base text plus its embedding vector. */
export interface KnowledgeChunk {
  /** Stable id, e.g. "pricing-2". */
  id: string;
  /** Human-friendly source label, e.g. "Pricing". */
  source: string;
  /** Original markdown filename, e.g. "pricing.md". */
  sourceFile: string;
  /** Nearest markdown heading this chunk belongs to (if any). */
  heading: string;
  /** The chunk text. */
  text: string;
  /** Embedding vector for `text`. */
  embedding: number[];
}

/** A chunk before embeddings are attached. */
export type RawChunk = Omit<KnowledgeChunk, "embedding">;

/** The on-disk vector index file. */
export interface VectorIndex {
  /** Embedding model used to build the index. */
  embeddingModel: string;
  /** ISO timestamp the index was generated. */
  createdAt: string;
  /** Number of chunks in the index. */
  count: number;
  /** The embedded chunks. */
  chunks: KnowledgeChunk[];
}

/** A retrieved chunk with its similarity score. */
export interface RetrievedChunk extends KnowledgeChunk {
  score: number;
}

/** A source surfaced to the user under "Sources used". */
export interface Source {
  source: string;
  sourceFile: string;
}
