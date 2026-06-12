import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env.server";

export type VerifiedAuthUser = {
  id: string;
  email?: string;
};

function authHeaders(accessToken: string): Record<string, string> {
  const apiKey = getSupabaseAnonKey() ?? getSupabaseServiceRoleKey();
  if (!apiKey) {
    throw new Error("Auth is not configured on the server (missing Supabase API key).");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    apikey: apiKey,
  };
}

function parseAuthUserPayload(body: unknown): VerifiedAuthUser | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const nestedUser = record.user;
  const candidate =
    nestedUser && typeof nestedUser === "object" ? (nestedUser as Record<string, unknown>) : record;

  const id = typeof candidate.id === "string" ? candidate.id : null;
  if (!id) return null;

  return {
    id,
    email: typeof candidate.email === "string" ? candidate.email : undefined,
  };
}

/** Verify a browser access token against Supabase Auth (serverless-safe). */
export async function verifySupabaseAccessToken(accessToken: string): Promise<VerifiedAuthUser> {
  const token = accessToken.trim();
  if (!token) {
    throw new Error("You must be signed in as an editor.");
  }

  const url = getSupabaseUrl()?.replace(/\/$/, "");
  if (!url) {
    throw new Error("Auth is not configured on the server (missing Supabase URL).");
  }

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: authHeaders(token),
  });

  const text = await response.text();
  if (!response.ok) {
    let message = text.trim();
    if (message) {
      try {
        const parsed = JSON.parse(message) as { msg?: string; message?: string; error?: string };
        message = parsed.msg ?? parsed.message ?? parsed.error ?? message;
      } catch {
        // Keep raw text when Supabase does not return JSON.
      }
    }

    const normalized = message.toLowerCase();
    if (
      response.status === 401 ||
      normalized.includes("expired") ||
      normalized.includes("invalid") ||
      normalized.includes("jwt")
    ) {
      throw new Error("Session expired. Sign out and sign in again as editor.");
    }

    throw new Error(message || `Could not verify editor sign-in (${response.status}).`);
  }

  if (!text.trim()) {
    throw new Error(
      "Auth check returned an empty response. Confirm VITE_SUPABASE_URL and API keys in Vercel match your Supabase project.",
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Auth check returned invalid JSON. Confirm Supabase URL and keys in Vercel.");
  }

  const user = parseAuthUserPayload(payload);
  if (!user) {
    throw new Error("You must be signed in as an editor.");
  }

  return user;
}
