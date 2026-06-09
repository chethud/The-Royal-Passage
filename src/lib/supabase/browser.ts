import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

function readEnv(key: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY"): string | undefined {
  const fromImport = import.meta.env[key] as string | undefined;
  if (fromImport?.trim()) return fromImport.trim();

  if (typeof process !== "undefined") {
    const fromProcess = process.env[key];
    if (fromProcess?.trim()) return fromProcess.trim();
  }

  return undefined;
}

function getBrowserCredentials() {
  return {
    url: readEnv("VITE_SUPABASE_URL"),
    anon: readEnv("VITE_SUPABASE_ANON_KEY"),
  };
}

/** Browser client (anon key). Only create when env is present. */
export function getSupabaseBrowser(): SupabaseClient {
  const { url, anon } = getBrowserCredentials();
  if (!url || !anon) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and add your project keys.",
    );
  }
  if (!cached) {
    cached = createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }
  return cached;
}

export function isSupabaseBrowserConfigured(): boolean {
  const { url, anon } = getBrowserCredentials();
  return Boolean(url && anon);
}
