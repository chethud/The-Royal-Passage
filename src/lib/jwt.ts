export type DecodedJwt = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
};

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  if (typeof globalThis.atob === "function") {
    return globalThis.atob(padded);
  }
  throw new Error("JWT decoding is only available in the browser.");
}

/** Decode a JWT header and payload without verifying the signature (display only). */
export function decodeJwt(token: string): DecodedJwt | null {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;

  try {
    return {
      header: JSON.parse(decodeBase64Url(parts[0])) as Record<string, unknown>,
      payload: JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>,
    };
  } catch {
    return null;
  }
}

export function formatJwtJson(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2);
}
