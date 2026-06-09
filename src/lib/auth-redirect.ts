/** Origin used for Supabase email confirmation / magic-link redirects. */
export function getAppOrigin(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  const fromVite = import.meta.env.VITE_SITE_URL as string | undefined;
  if (fromVite?.trim()) return fromVite.trim().replace(/\/$/, "");

  return "https://the-royal-passage.vercel.app";
}

/** Post-auth landing page for email confirmation and OAuth (Google). */
export function buildAuthRedirect(returnPath?: string): string {
  const origin = getAppOrigin();
  const base = `${origin}/sign-in`;
  if (returnPath?.startsWith("/")) {
    return `${base}?redirect=${encodeURIComponent(returnPath)}`;
  }
  return base;
}

/** @deprecated Use buildAuthRedirect */
export const buildEmailConfirmRedirect = buildAuthRedirect;

/** Error message when Supabase OAuth redirects back with ?error=… */
export function readAuthCallbackError(): string | null {
  if (typeof window === "undefined") return null;

  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const raw =
    search.get("error_description") ??
    hash.get("error_description") ??
    search.get("error") ??
    hash.get("error");

  if (!raw) return null;
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw;
  }
}
