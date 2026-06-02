/** Server-only env (never expose service role to the browser). */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && key);
}

export function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
}
