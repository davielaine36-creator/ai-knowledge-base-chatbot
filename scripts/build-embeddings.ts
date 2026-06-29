/**
 * Build the local vector index.
 *
 *   1. Reads every markdown file in data/knowledge/
 *   2. Splits each file into chunks
 *   3. Creates an OpenAI embedding for every chunk
 *   4. Writes the result to data/vector-index.json
 *
 * Run with: npm run embeddings
 */
import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";

// Load .env.local first (Next.js convention), then fall back to .env.
dotenv.config({ path: ".env.local" });
dotenv.config();

import { readKnowledgeChunks } from "../src/lib/chunk";
import { EMBEDDING_MODEL, VECTOR_INDEX_PATH } from "../src/lib/config";
import { embedTexts } from "../src/lib/embeddings";
import type { KnowledgeChunk, VectorIndex } from "../src/lib/types";

/** Embed in batches so we stay well within request limits. */
const BATCH_SIZE = 64;

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error(
      "\n✗ OPENAI_API_KEY is not set.\n  Copy .env.example to .env.local and add your key, then run again.\n"
    );
    process.exit(1);
  }

  console.log("Reading knowledge base…");
  const rawChunks = readKnowledgeChunks();
  console.log(`  Found ${rawChunks.length} chunks.`);

  if (rawChunks.length === 0) {
    console.error("✗ No chunks found. Add markdown files to data/knowledge/.");
    process.exit(1);
  }

  console.log(`Creating embeddings with ${EMBEDDING_MODEL}…`);
  const embeddedChunks: KnowledgeChunk[] = [];

  for (let i = 0; i < rawChunks.length; i += BATCH_SIZE) {
    const batch = rawChunks.slice(i, i + BATCH_SIZE);
    const vectors = await embedTexts(batch.map((c) => c.text));
    batch.forEach((chunk, j) => {
      embeddedChunks.push({ ...chunk, embedding: vectors[j] });
    });
    console.log(
      `  Embedded ${Math.min(i + BATCH_SIZE, rawChunks.length)}/${rawChunks.length}`
    );
  }

  const index: VectorIndex = {
    embeddingModel: EMBEDDING_MODEL,
    createdAt: new Date().toISOString(),
    count: embeddedChunks.length,
    chunks: embeddedChunks,
  };

  const outPath = path.join(process.cwd(), VECTOR_INDEX_PATH);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(index, null, 2), "utf8");

  console.log(`\n✓ Wrote ${embeddedChunks.length} chunks to ${VECTOR_INDEX_PATH}`);
  console.log("  You can now run `npm run dev` and use the chatbot.\n");
}

main().catch((err) => {
  console.error("\n✗ Failed to build embeddings:\n", err);
  process.exit(1);
});
