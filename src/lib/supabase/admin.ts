import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env.server";

let cachedAdmin: SupabaseClient | null = null;
let cachedRead: SupabaseClient | null = null;

/** Service-role client — bypasses RLS; use only from server functions / loaders. */
export function getSupabaseAdmin(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY in the server environment.",
    );
  }
  if (!cachedAdmin) {
    cachedAdmin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedAdmin;
}

/** Read-only server client for public tables (falls back to anon key). */
export function getSupabaseServerRead(): SupabaseClient | null {
  const url = getSupabaseUrl();
  if (!url) return null;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    return getSupabaseAdmin();
  }

  const anonKey = getSupabaseAnonKey();
  if (!anonKey) return null;

  if (!cachedRead) {
    cachedRead = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedRead;
}
