-- Knowledge-base retrieval backend (pgvector).
--
-- Creates the objects the app + seed script depend on:
--   * table    kb_documents        (src/lib/config.ts SUPABASE_TABLE)
--   * function kb_match_documents   (src/lib/config.ts SUPABASE_MATCH_FN)
--
-- The column + return contract is pinned by:
--   * scripts/seed-supabase.ts  (id, source, source_file, heading, content, embedding)
--   * src/lib/retrieval.ts      (MatchRow: id, source, source_file, heading, content, score)
--
-- Runtime path: the app queries with the ANON/publishable key and only ever
-- calls kb_match_documents(). That function is SECURITY DEFINER so it can read
-- kb_documents while RLS keeps the table itself unreadable to anon. Seeding
-- uses the SERVICE-ROLE key (bypasses RLS) to write rows.
--
-- Embedding width 1536 matches OpenAI text-embedding-3-small (EMBEDDING_MODEL).

-- 1. pgvector extension --------------------------------------------------------
create extension if not exists vector;

-- 2. Documents table -----------------------------------------------------------
-- id is the deterministic chunk id produced by src/lib/chunk.ts (a text key),
-- which is why the seed script upserts on it and clears with .neq("id", "").
create table if not exists public.kb_documents (
  id          text primary key,
  source      text,
  source_file text,
  heading     text,
  content     text,
  embedding   vector(1536)
);

-- Approximate-nearest-neighbour index for cosine distance. HNSW gives fast
-- recall at this corpus size; drop/recreate if you change the embedding width.
create index if not exists kb_documents_embedding_hnsw
  on public.kb_documents
  using hnsw (embedding vector_cosine_ops);

-- 3. Row Level Security --------------------------------------------------------
-- Enable RLS with NO policies: the anon key cannot select/insert/update/delete
-- the table directly. All anon reads flow through the SECURITY DEFINER function
-- below; all writes use the service-role key, which bypasses RLS entirely.
alter table public.kb_documents enable row level security;

-- 4. Similarity-search function ------------------------------------------------
-- Cosine similarity = 1 - cosine distance (<=>). Returns rows at or above
-- min_score, closest first, capped at match_count. Parameter names must stay
-- query_embedding / match_count / min_score — src/lib/retrieval.ts calls this
-- via supabase.rpc() with those exact named args.
create or replace function public.kb_match_documents(
  query_embedding vector(1536),
  match_count     int,
  min_score       float
)
returns table (
  id          text,
  source      text,
  source_file text,
  heading     text,
  content     text,
  score       float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.id,
    d.source,
    d.source_file,
    d.heading,
    d.content,
    1 - (d.embedding <=> query_embedding) as score
  from public.kb_documents d
  where d.embedding is not null
    and 1 - (d.embedding <=> query_embedding) >= min_score
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- 5. Grants --------------------------------------------------------------------
-- The runtime (anon / publishable key) only needs to execute the function.
-- authenticated included for parity if you later add signed-in users.
grant execute on function public.kb_match_documents(vector, int, float)
  to anon, authenticated;
