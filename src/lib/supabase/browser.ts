import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/** Browser client (anon key). Only create when env is present. */
export function getSupabaseBrowser(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url?.trim() || !anon?.trim()) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and add your project keys.",
    );
  }
  if (!cached) {
    cached = createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return cached;
}

export function isSupabaseBrowserConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return Boolean(url?.trim() && anon?.trim());
}
