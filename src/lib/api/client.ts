function readApiBaseUrl(): string {
  const fromImport = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (fromImport?.trim()) return fromImport.trim().replace(/\/$/, "");

  if (typeof process !== "undefined") {
    const fromProcess = process.env.VITE_API_BASE_URL;
    if (fromProcess?.trim()) return fromProcess.trim().replace(/\/$/, "");
  }

  return "";
}

export function isApiConfigured(): boolean {
  return Boolean(readApiBaseUrl());
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

  const response = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const json = (await response.json()) as { detail?: string };
      if (json.detail) detail = json.detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(detail || `API request failed (${response.status})`);
  }

  return (await response.json()) as T;
}
