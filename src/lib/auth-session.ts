import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

type ResolveAccessTokenOptions = {
  /** Prefer rotating via refresh_token before returning. */
  forceRefresh?: boolean;
  /** Friendly error when no session exists. */
  missingMessage?: string;
};

const DEFAULT_MISSING = "Sign in again to continue.";

/**
 * Fresh Supabase access token.
 * Never force-refresh in a way that signs the user out on failure — fall back to
 * the current session token instead.
 */
export async function resolveAccessToken(
  options: ResolveAccessTokenOptions = {},
): Promise<string> {
  const missingMessage = options.missingMessage ?? DEFAULT_MISSING;

  if (!isSupabaseBrowserConfigured()) {
    throw new Error(missingMessage);
  }

  const supabase = getSupabaseBrowser();
  const { data: sessionData, error } = await supabase.auth.getSession();
  const currentToken = sessionData.session?.access_token ?? null;

  if (error || !currentToken) {
    throw new Error(missingMessage);
  }

  const expiresAt = sessionData.session?.expires_at;
  const now = Math.floor(Date.now() / 1000);
  const nearExpiry = !expiresAt || expiresAt - now < 120;
  const shouldRefresh = Boolean(options.forceRefresh) || nearExpiry;

  if (!shouldRefresh) {
    return currentToken;
  }

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
  if (!refreshError && refreshed.session?.access_token) {
    return refreshed.session.access_token;
  }

  // Refresh failed — keep the existing token. Forcing a hard failure here can
  // leave supabase-js in a signed-out state and bounce admins to /sign-in.
  return currentToken;
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
    const before = await resolveAccessToken();
    const after = await resolveAccessToken({ forceRefresh: true });
    // Only treat as success if we actually got a different token.
    if (after && after !== before) return after;
    return after || null;
  } catch {
    return null;
  }
}
