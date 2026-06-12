/** Read env at runtime so bundlers cannot inline missing build-time values. */
function readRuntimeEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Server-only env (never expose service role to the browser). */
export function getSupabaseServiceRoleKey(): string | undefined {
  return readRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

/** True when homepage content can be read from Supabase (service role or anon key). */
export function isSupabaseReadable(): boolean {
  const url = getSupabaseUrl();
  return Boolean(url && (getSupabaseServiceRoleKey() || getSupabaseAnonKey()));
}

export function getSupabaseUrl(): string | undefined {
  return readRuntimeEnv("SUPABASE_URL") ?? readRuntimeEnv("VITE_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string | undefined {
  return readRuntimeEnv("VITE_SUPABASE_ANON_KEY") ?? readRuntimeEnv("SUPABASE_ANON_KEY");
}

/** Human-readable hint when server-side Supabase writes are unavailable. */
export function getSupabaseConfigError(): string | null {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();

  if (!url && !key) {
    return "Homepage photo save needs VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in Vercel. After adding them, redeploy the project.";
  }
  if (!url) {
    return "Homepage photo save needs VITE_SUPABASE_URL or SUPABASE_URL in Vercel. After adding it, redeploy the project.";
  }
  if (!key) {
    return "Homepage photo save needs SUPABASE_SERVICE_ROLE_KEY in Vercel. After adding it, redeploy the project (Deployments → … → Redeploy).";
  }
  return null;
}
