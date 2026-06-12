import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

/** Fresh Supabase access token for server-side auth checks (refreshes when near expiry). */
export async function resolveAccessToken(): Promise<string> {
  if (!isSupabaseBrowserConfigured()) {
    throw new Error("Sign in as editor to upload photos.");
  }

  const supabase = getSupabaseBrowser();
  const { data: sessionData, error } = await supabase.auth.getSession();

  if (error || !sessionData.session?.access_token) {
    throw new Error("Sign in again as editor to upload photos.");
  }

  const expiresAt = sessionData.session.expires_at;
  const now = Math.floor(Date.now() / 1000);
  const shouldRefresh = !expiresAt || expiresAt - now < 120;

  if (shouldRefresh) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshed.session?.access_token) {
      throw new Error("Session expired. Sign out and sign in again as editor.");
    }
    return refreshed.session.access_token;
  }

  return sessionData.session.access_token;
}
