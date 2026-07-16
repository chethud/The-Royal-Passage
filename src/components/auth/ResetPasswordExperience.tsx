import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { isPasswordRecoveryCallback, redirectOffLocalhostIfNeeded } from "@/lib/auth-redirect";
import { formatAuthError } from "@/lib/format-auth-error";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

const inputClass =
  "w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/40 px-4 py-3 text-sm normal-case tracking-normal text-ink placeholder:text-ink/45 backdrop-blur-sm [font-family:Georgia,'Times_New_Roman',serif] focus:border-ember/50 focus:outline-none focus:ring-1 focus:ring-ember/30";
const labelClass =
  "block text-sm font-medium leading-normal normal-case tracking-normal text-ink/90 [font-family:Georgia,'Times_New_Roman',serif]";

export function ResetPasswordExperience() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const redirect = typeof search.redirect === "string" ? search.redirect : undefined;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const browserConfigured = isSupabaseBrowserConfigured();
  const supabase = useMemo(() => {
    if (!browserConfigured) return null;
    return getSupabaseBrowser();
  }, [browserConfigured]);

  const passwordType = showPassword ? "text" : "password";
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = ready && password.length >= 8 && passwordsMatch && !busy;

  useEffect(() => {
    redirectOffLocalhostIfNeeded();
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;
    let timeoutId = 0;

    const markReady = () => {
      if (!cancelled) {
        window.clearTimeout(timeoutId);
        setReady(true);
      }
    };

    if (isPasswordRecoveryCallback()) {
      void supabase.auth.getSession().then(() => markReady());
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        markReady();
      }
    });

    timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setError("This reset link is invalid or has expired. Request a new one from the sign-in page.");
      }
    }, 15000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const submitNewPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!supabase) {
      setError("Supabase browser auth is not configured.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setBusy(true);
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setNotice("Your password has been updated. You can sign in with your new password.");
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        void navigate({
          to: "/sign-in",
          search: redirect ? { redirect } : undefined,
        });
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthPageLayout
      title="Choose a new password"
      subtitle="Enter a new password for your Royal Passage account."
    >
      {!browserConfigured ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Missing browser auth env vars. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
        </p>
      ) : !ready && !error ? (
        <p className="text-center text-sm text-ink/75">Verifying your reset link…</p>
      ) : ready ? (
        <form className="mt-1 flex flex-col gap-5" onSubmit={submitNewPassword}>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="reset-password" className={labelClass}>
              New password
            </label>
            <div className="relative">
              <input
                id="reset-password"
                name="password"
                type={passwordType}
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/60 hover:text-ink"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="reset-password-confirm" className={labelClass}>
              Confirm password
            </label>
            <input
              id="reset-password-confirm"
              name="confirmPassword"
              type={passwordType}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-sm bg-ember py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p
          className="mt-4 rounded-sm border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ink"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-ink/70">
        <Link to="/sign-in" className="text-ember underline-offset-4 hover:underline">
          Back to sign in
        </Link>
        {" · "}
        <Link to="/forgot-password" className="text-ember underline-offset-4 hover:underline">
          Request a new link
        </Link>
      </p>
    </AuthPageLayout>
  );
}
