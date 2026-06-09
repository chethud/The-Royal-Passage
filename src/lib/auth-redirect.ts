export const PRODUCTION_SITE_ORIGIN = "https://the-royal-passage.vercel.app";

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "");
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function isLocalOrigin(origin: string): boolean {
  try {
    return isLocalHostname(new URL(origin).hostname);
  } catch {
    return origin.includes("localhost") || origin.includes("127.0.0.1");
  }
}

/** Production origin baked at build time (set VITE_SITE_URL on Vercel). */
export function getConfiguredSiteOrigin(): string | null {
  const fromVite = import.meta.env.VITE_SITE_URL as string | undefined;
  if (!fromVite?.trim()) return null;
  const origin = normalizeOrigin(fromVite);
  return isLocalOrigin(origin) ? null : origin;
}

/** Origin used for Supabase email confirmation and OAuth redirects. */
export function getAppOrigin(): string {
  const configured = getConfiguredSiteOrigin();
  if (configured) return configured;

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return PRODUCTION_SITE_ORIGIN;
}

/** Post-auth landing page for email confirmation. */
export function buildAuthRedirect(returnPath?: string): string {
  const origin = getAppOrigin();
  const base = `${origin}/sign-in`;
  if (returnPath?.startsWith("/")) {
    return `${base}?redirect=${encodeURIComponent(returnPath)}`;
  }
  return base;
}

/** OAuth callback — dedicated route that completes the Google sign-in flow. */
export function buildOAuthCallbackUrl(returnPath?: string): string {
  const origin = getAppOrigin();
  const base = `${origin}/auth/callback`;
  if (returnPath?.startsWith("/")) {
    return `${base}?redirect=${encodeURIComponent(returnPath)}`;
  }
  return base;
}

/** @deprecated Use buildAuthRedirect */
export const buildEmailConfirmRedirect = buildAuthRedirect;

/**
 * If Supabase Site URL is still localhost, OAuth may land on localhost with tokens in the URL.
 * Bounce to the production site while preserving query/hash so the session can be established.
 */
export function redirectOffLocalhostIfNeeded(): void {
  if (typeof window === "undefined") return;

  const { hostname, pathname, search, hash } = window.location;
  if (!isLocalHostname(hostname)) return;

  const production = getConfiguredSiteOrigin() ?? PRODUCTION_SITE_ORIGIN;
  if (isLocalOrigin(production)) return;

  window.location.replace(`${production}${pathname}${search}${hash}`);
}

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
