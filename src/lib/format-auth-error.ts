import type { AuthError } from "@supabase/supabase-js";

function isAuthError(err: unknown): err is AuthError {
  return (
    typeof err === "object" &&
    err !== null &&
    "__isAuthError" in err &&
    (err as AuthError).__isAuthError === true
  );
}

/** User-facing copy for Supabase Auth failures (signup, magic link, resend). */
export function formatAuthError(err: unknown, fallback: string): string {
  if (!isAuthError(err) && !(err instanceof Error)) return fallback;

  const message = err instanceof Error ? err.message : "";
  const code = isAuthError(err) ? err.code : undefined;

  const smtpFailure =
    message.includes("Error sending confirmation email") ||
    message.includes("Error sending magic link email") ||
    message.includes("Error sending recovery email") ||
    code === "unexpected_failure";

  if (smtpFailure) {
    return (
      "We could not send the auth email. This is usually a Supabase SMTP setup issue " +
      "(Resend domain verification, API key as SMTP password, sender noreplay@theroyalpassage.com). " +
      "Fix Authentication → SMTP Settings in the Supabase dashboard, then try again."
    );
  }

  return message || fallback;
}
