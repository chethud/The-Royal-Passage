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

export function toErrorMessage(err: unknown, fallback = "Request failed."): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  try {
    return JSON.stringify(err);
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
    let detail = response.statusText;
    try {
      const json = (await response.json()) as { detail?: unknown; message?: unknown };
      detail =
        formatApiDetail(json.detail) ??
        formatApiDetail(json.message) ??
        detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(detail || `API request failed (${response.status})`);
  }

  return (await response.json()) as T;
}
