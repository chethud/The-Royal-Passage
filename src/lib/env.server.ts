/** Server-only env (never expose service role to the browser). */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && key);
}

/** True when homepage content can be read from Supabase (service role or anon key). */
export function isSupabaseReadable(): boolean {
  const url = getSupabaseUrl();
  return Boolean(url && (process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseAnonKey()));
}

export function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
}
