import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

type ResolveAccessTokenOptions = {
  /** Always rotate via refresh_token before returning. */
  forceRefresh?: boolean;
  /** Friendly error when no session exists. */
  missingMessage?: string;
};

const DEFAULT_MISSING = "Sign in again to continue.";

/** Fresh Supabase access token (refreshes when near expiry or when forced). */
export async function resolveAccessToken(
  options: ResolveAccessTokenOptions = {},
): Promise<string> {
  const missingMessage = options.missingMessage ?? DEFAULT_MISSING;

  if (!isSupabaseBrowserConfigured()) {
    throw new Error(missingMessage);
  }

  const supabase = getSupabaseBrowser();

  if (options.forceRefresh) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshed.session?.access_token) {
      throw new Error("Session expired. Sign out and sign in again.");
    }
    return refreshed.session.access_token;
  }

  const { data: sessionData, error } = await supabase.auth.getSession();

  if (error || !sessionData.session?.access_token) {
    throw new Error(missingMessage);
  }

  const expiresAt = sessionData.session.expires_at;
  const now = Math.floor(Date.now() / 1000);
  const shouldRefresh = !expiresAt || expiresAt - now < 120;

  if (shouldRefresh) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshed.session?.access_token) {
      throw new Error("Session expired. Sign out and sign in again.");
    }
    return refreshed.session.access_token;
  }

  return sessionData.session.access_token;
}

export function isStaleSessionError(message: string): boolean {
  const lowered = message.toLowerCase();
  return (
    lowered.includes("session from session_id") ||
    lowered.includes("session_id claim") ||
    lowered.includes("session does not exist") ||
    lowered.includes("invalid or expired token") ||
    lowered.includes("could not validate session")
  );
}

/** Refresh once after a stale-session API error; returns a new token or null. */
export async function refreshAccessTokenAfterAuthError(): Promise<string | null> {
  if (!isSupabaseBrowserConfigured()) return null;
  try {
    return await resolveAccessToken({ forceRefresh: true });
  } catch {
    return null;
  }
}
