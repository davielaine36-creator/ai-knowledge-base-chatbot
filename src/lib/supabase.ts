import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_KEY, SUPABASE_URL } from "./config";

let client: SupabaseClient | null = null;

/**
 * Lazily create a shared Supabase client (used server-side for retrieval).
 * Uses the publishable/anon key — reads go through the SECURITY DEFINER
 * `kb_match_documents` function, so no service-role secret is needed at runtime.
 */
export function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY."
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
