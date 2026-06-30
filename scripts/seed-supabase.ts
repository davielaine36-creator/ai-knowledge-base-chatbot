/**
 * Seed the Supabase pgvector store from the local markdown knowledge base.
 *
 *   1. Reads every markdown file in data/knowledge/
 *   2. Splits each file into chunks
 *   3. Creates an OpenAI embedding for every chunk
 *   4. Upserts the chunks + embeddings into the `kb_documents` table
 *
 * Writing rows is blocked by RLS for the anon key, so this script needs the
 * Supabase SERVICE ROLE key (find it in: Supabase dashboard → Project Settings
 * → API → service_role). It is a secret — keep it in .env.local only.
 *
 * Run with: npm run seed:supabase
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

import { createClient } from "@supabase/supabase-js";

import { readKnowledgeChunks } from "../src/lib/chunk";
import { EMBEDDING_MODEL, SUPABASE_TABLE } from "../src/lib/config";
import { embedTexts } from "../src/lib/embeddings";

const BATCH_SIZE = 64;

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!process.env.OPENAI_API_KEY) {
    console.error(
      "\n✗ OPENAI_API_KEY is not set. Add it to .env.local and try again.\n"
    );
    process.exit(1);
  }
  if (!url || !serviceKey) {
    console.error(
      "\n✗ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.\n" +
        "  The service_role key is required to write rows (RLS blocks the anon key).\n"
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Reading knowledge base…");
  const rawChunks = readKnowledgeChunks();
  console.log(`  Found ${rawChunks.length} chunks.`);
  if (rawChunks.length === 0) {
    console.error("✗ No chunks found. Add markdown files to data/knowledge/.");
    process.exit(1);
  }

  // Clear existing rows so re-seeding reflects deletions/edits cleanly.
  console.log("Clearing existing rows…");
  const { error: deleteError } = await supabase
    .from(SUPABASE_TABLE)
    .delete()
    .neq("id", "");
  if (deleteError) {
    console.error("✗ Failed to clear table:", deleteError.message);
    process.exit(1);
  }

  console.log(`Creating embeddings with ${EMBEDDING_MODEL} and upserting…`);
  for (let i = 0; i < rawChunks.length; i += BATCH_SIZE) {
    const batch = rawChunks.slice(i, i + BATCH_SIZE);
    const vectors = await embedTexts(batch.map((c) => c.text));
    const rows = batch.map((c, j) => ({
      id: c.id,
      source: c.source,
      source_file: c.sourceFile,
      heading: c.heading,
      content: c.text,
      embedding: vectors[j],
    }));

    const { error } = await supabase.from(SUPABASE_TABLE).upsert(rows);
    if (error) {
      console.error("\n✗ Upsert failed:", error.message);
      process.exit(1);
    }
    console.log(
      `  Upserted ${Math.min(i + BATCH_SIZE, rawChunks.length)}/${rawChunks.length}`
    );
  }

  const { count } = await supabase
    .from(SUPABASE_TABLE)
    .select("*", { count: "exact", head: true });

  console.log(`\n✓ Seeded ${count ?? rawChunks.length} chunks into ${SUPABASE_TABLE}.`);
  console.log("  The deployed app will now answer from Supabase.\n");
}

main().catch((err) => {
  console.error("\n✗ Failed to seed Supabase:\n", err);
  process.exit(1);
});
