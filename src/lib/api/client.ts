const PRODUCTION_API_BASE_URL = "https://the-royal-passage.onrender.com";

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function resolveApiBaseUrl(raw: string | undefined): string {
  if (!raw?.trim()) return "";
  return raw.trim().replace(/\/$/, "");
}

function browserProductionFallback(): string {
  if (typeof window === "undefined") return "";
  if (isLocalHostname(window.location.hostname)) return "";
  return PRODUCTION_API_BASE_URL;
}

function serverProductionFallback(): string {
  if (typeof process === "undefined") return "";
  const fromProcess = resolveApiBaseUrl(process.env.VITE_API_BASE_URL);
  if (fromProcess) return fromProcess;
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return PRODUCTION_API_BASE_URL;
  }
  return "";
}

export function readApiBaseUrl(): string {
  const fromImport = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);
  if (fromImport) {
    if (typeof window !== "undefined" && fromImport.includes("localhost")) {
      if (!isLocalHostname(window.location.hostname)) {
        return browserProductionFallback() || fromImport;
      }
    }
    return fromImport;
  }

  const fromServer = serverProductionFallback();
  if (fromServer) return fromServer;

  return browserProductionFallback();
}

export function isApiConfigured(): boolean {
  return Boolean(readApiBaseUrl());
}

const CRYPTIC_ERROR_MESSAGES: Record<string, string> = {
  from_json:
    "The API server failed to decode requests (Connect/protobuf). Redeploy the Render backend and confirm SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.",
  from_binary:
    "The API server failed to decode requests (Connect/protobuf). Redeploy the Render backend and confirm SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.",
  "json could not be generated":
    "The server returned an unexpected database response. Check that Supabase schema is up to date and the API is configured correctly.",
};

function humanizeErrorMessage(message: string, fallback: string): string {
  const trimmed = message.trim();
  if (!trimmed) return fallback;

  const mapped = CRYPTIC_ERROR_MESSAGES[trimmed.toLowerCase()];
  if (mapped) return mapped;

  const lowered = trimmed.toLowerCase();
  if (lowered.includes("does not exist") && lowered.includes("relation")) {
    return CRYPTIC_ERROR_MESSAGES.from_json;
  }
  if (lowered === "failed to fetch") {
    return "Cannot reach the API. Set VITE_API_BASE_URL on Vercel and SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on Render, then redeploy both.";
  }

  return trimmed;
}

export function toErrorMessage(err: unknown, fallback = "Request failed."): string {
  if (err instanceof Error) return humanizeErrorMessage(err.message, fallback);
  if (typeof err === "string" && err.trim()) return humanizeErrorMessage(err.trim(), fallback);
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return humanizeErrorMessage(message.trim(), fallback);
    }
  }
  try {
    return humanizeErrorMessage(JSON.stringify(err), fallback);
  } catch {
    return fallback;
  }
}

function formatApiDetail(detail: unknown): string | null {
  if (detail == null) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg?: unknown }).msg ?? "");
        }
        return "";
      })
      .filter(Boolean);
    return messages.length > 0 ? messages.join("; ") : null;
  }
  if (typeof detail === "object") {
    if ("message" in detail && typeof (detail as { message?: unknown }).message === "string") {
      return (detail as { message: string }).message;
    }
    try {
      return JSON.stringify(detail);
    } catch {
      return null;
    }
  }
  return String(detail);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {},
): Promise<T> {
  const base = readApiBaseUrl();
  if (!base) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error(
        `Cannot reach the API at ${base}. Set VITE_API_BASE_URL=https://the-royal-passage.onrender.com on Vercel and confirm the Render backend is running.`,
      );
    }
    throw err;
  }

  if (!response.ok) {
    let detail = "";
    try {
      const json = (await response.json()) as { detail?: unknown; message?: unknown };
      detail =
        formatApiDetail(json.detail) ??
        formatApiDetail(json.message) ??
        "";
    } catch {
      // ignore parse errors
    }
    const statusHint = response.statusText?.trim() || `HTTP ${response.status}`;
    throw new Error(detail || `API request failed (${statusHint})`);
  }

  return (await response.json()) as T;
}
