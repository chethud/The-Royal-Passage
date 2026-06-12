import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  readSupabaseProjectUrls,
} from "@/lib/env.server";

export type VerifiedAuthUser = {
  id: string;
  email?: string;
};

function decodeAccessTokenPayload(
  token: string,
): { sub?: string; exp?: number; email?: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1]!, "base64url").toString("utf8")) as {
      sub?: string;
      exp?: number;
      email?: string;
    };
  } catch {
    return null;
  }
}

function authHeaders(accessToken: string, apiKey: string): Record<string, string> {
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

function mapAuthFailure(status: number, message: string): Error {
  const normalized = message.toLowerCase();
  if (
    status === 401 ||
    normalized.includes("expired") ||
    normalized.includes("invalid") ||
    normalized.includes("jwt")
  ) {
    return new Error("Session expired. Sign out and sign in again as editor.");
  }
  if (status === 404) {
    return new Error(
      "Server Supabase URL is wrong (404). In Vercel, set VITE_SUPABASE_URL to https://YOUR_PROJECT.supabase.co and remove any incorrect SUPABASE_URL value, then redeploy.",
    );
  }
  return new Error(message || `Could not verify editor sign-in (${status}).`);
}

async function verifyViaAuthFetch(
  projectUrl: string,
  accessToken: string,
  apiKey: string,
): Promise<VerifiedAuthUser> {
  const response = await fetch(`${projectUrl}/auth/v1/user`, {
    headers: authHeaders(accessToken, apiKey),
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
    throw mapAuthFailure(response.status, message);
  }

  if (!text.trim()) {
    throw new Error("Auth check returned an empty response.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Auth check returned invalid JSON.");
  }

  const user = parseAuthUserPayload(payload);
  if (!user) {
    throw new Error("You must be signed in as an editor.");
  }

  return user;
}

async function verifyViaSupabaseClient(
  projectUrl: string,
  accessToken: string,
  apiKey: string,
): Promise<VerifiedAuthUser> {
  const client = createClient(projectUrl, apiKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser(accessToken);

  if (error) {
    throw mapAuthFailure(401, error.message);
  }

  if (!user) {
    throw new Error("You must be signed in as an editor.");
  }

  return { id: user.id, email: user.email ?? undefined };
}

async function verifyViaAdminUserLookup(accessToken: string): Promise<VerifiedAuthUser> {
  const payload = decodeAccessTokenPayload(accessToken);
  const userId = payload?.sub;
  if (!userId) {
    throw new Error("You must be signed in as an editor.");
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Session expired. Sign out and sign in again as editor.");
  }

  const serviceKey = getSupabaseServiceRoleKey();
  const projectUrl = getSupabaseUrl();
  if (!serviceKey || !projectUrl) {
    throw new Error("Auth is not configured on the server.");
  }

  const admin = createClient(projectUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) {
    throw new Error("You must be signed in as an editor.");
  }

  return {
    id: data.user.id,
    email: data.user.email ?? payload.email,
  };
}

/** Verify a browser access token against Supabase Auth (serverless-safe). */
export async function verifySupabaseAccessToken(accessToken: string): Promise<VerifiedAuthUser> {
  const token = accessToken.trim();
  if (!token) {
    throw new Error("You must be signed in as an editor.");
  }

  const projectUrls = readSupabaseProjectUrls();
  if (projectUrls.length === 0) {
    throw new Error("Auth is not configured on the server (missing Supabase URL).");
  }

  const apiKeys = [getSupabaseAnonKey(), getSupabaseServiceRoleKey()].filter(
    (key): key is string => Boolean(key),
  );
  if (apiKeys.length === 0) {
    throw new Error("Auth is not configured on the server (missing Supabase API key).");
  }

  const errors: string[] = [];

  for (const projectUrl of projectUrls) {
    for (const apiKey of apiKeys) {
      try {
        return await verifyViaAuthFetch(projectUrl, token, apiKey);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
      }

      try {
        return await verifyViaSupabaseClient(projectUrl, token, apiKey);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }
  }

  try {
    return await verifyViaAdminUserLookup(token);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const distinct = [...new Set(errors.filter(Boolean))];
  throw new Error(distinct[0] ?? "Could not verify editor sign-in.");
}
