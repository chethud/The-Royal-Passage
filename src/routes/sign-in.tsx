import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { JwtSignInForm } from "@/components/auth/JwtSignInForm";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { RoyalSignInExperience } from "@/components/auth/RoyalSignInExperience";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useRoyalSignInAnimation } from "@/hooks/use-royal-sign-in-animation";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole, isGuestAccount, isStaffRole, ROLE_LABELS } from "@/lib/roles";
import {
  buildAuthRedirect,
  buildOAuthCallbackUrl,
  readAuthCallbackError,
  redirectOffLocalhostIfNeeded,
} from "@/lib/auth-redirect";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

const inputClass = "royal-signin-input";

const cardTitleClass = "font-display text-xl tracking-[0.04em] text-[#F8F4E8] sm:text-2xl";

type SignInSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/sign-in")({
  validateSearch: (s: Record<string, unknown>): SignInSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — The Royal Passage" },
      { name: "description", content: "Sign in with your email and password. Your role is assigned automatically." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = Route.useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showJwtSignIn, setShowJwtSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const browserConfigured = isSupabaseBrowserConfigured();
  const { user, displayName, role, loading } = useAuthUser();
  const reducedMotion = usePrefersReducedMotion();
  const { phase, start, isAnimating } = useRoyalSignInAnimation(reducedMotion);
  const pendingPalaceEntryRef = useRef(false);
  const supabase = useMemo(() => {
    if (!browserConfigured) return null;
    return getSupabaseBrowser();
  }, [browserConfigured]);

  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata ?? {};
    setFullName((meta.full_name as string | undefined) ?? (meta.name as string | undefined) ?? "");
    setPhone((meta.phone as string | undefined) ?? user.phone ?? "");
  }, [user]);

  useEffect(() => {
    redirectOffLocalhostIfNeeded();
    const oauthError = readAuthCallbackError();
    if (oauthError) {
      setError(oauthError);
    }
  }, []);

  const finishPalaceEntry = useCallback(() => {
    if (redirect && isGuestAccount(role) && redirect.startsWith("/")) {
      window.location.href = redirect;
      return;
    }
    void navigate({ to: dashboardPathForRole(role) });
  }, [navigate, redirect, role]);

  const beginPalaceEntry = useCallback(() => {
    pendingPalaceEntryRef.current = true;
    start(() => {});
  }, [start]);

  useEffect(() => {
    if (phase !== "done" || !pendingPalaceEntryRef.current || loading || !user) return;
    pendingPalaceEntryRef.current = false;
    finishPalaceEntry();
  }, [finishPalaceEntry, loading, phase, user]);

  useEffect(() => {
    if (loading || !user || isAnimating || pendingPalaceEntryRef.current) return;
    if (isStaffRole(role)) {
      void navigate({ to: dashboardPathForRole(role) });
      return;
    }
    if (redirect && isGuestAccount(role) && redirect.startsWith("/")) {
      window.location.href = redirect;
      return;
    }
    if (role) {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [isAnimating, loading, navigate, redirect, role, user]);

  const isEmailNotConfirmedError = (message: string) =>
    /email not confirmed/i.test(message);

  const signInWithGoogle = async () => {
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError("Supabase browser auth is not configured.");
      return;
    }

    try {
      setGoogleBusy(true);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildOAuthCallbackUrl(redirect),
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start Google sign-in.");
      setGoogleBusy(false);
    }
  };

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setEmailNotConfirmed(false);

    if (!supabase) {
      setError("Supabase browser auth is not configured.");
      return;
    }

    try {
      setBusy(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      setNotice("Welcome to the kingdom.");
      beginPalaceEntry();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign in.";
      if (isEmailNotConfirmedError(message)) {
        setEmailNotConfirmed(true);
        setError(
          "Your email is not confirmed yet. Open the confirmation link from Supabase, or resend it below.",
        );
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  };

  const resendConfirmation = async () => {
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError("Supabase browser auth is not configured.");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your email address first.");
      return;
    }

    try {
      setResendingConfirmation(true);
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: trimmedEmail,
        options: {
          emailRedirectTo: buildAuthRedirect(redirect),
        },
      });
      if (resendError) throw resendError;
      setNotice(`Confirmation email sent to ${trimmedEmail}. Check your inbox and spam folder.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend confirmation email.");
    } finally {
      setResendingConfirmation(false);
    }
  };

  const signUpGuest = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError("Supabase browser auth is not configured.");
      return;
    }

    try {
      setBusy(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: buildAuthRedirect(redirect),
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || null,
          },
        },
      });
      if (signUpError) throw signUpError;
      if (data.session) {
        setNotice("Account created. Entering the kingdom…");
        beginPalaceEntry();
      } else {
        setNotice(
          "Account created. Check your email for a confirmation link, then sign in with your password.",
        );
      }
      setMode("signin");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setBusy(false);
    }
  };

  const updateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!supabase || !user) {
      setError("You must be signed in to update profile.");
      return;
    }
    try {
      setSavingProfile(true);
      const { error: upErr } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      });
      if (upErr) throw upErr;
      setNotice("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setNotice("Signed out.");
    void navigate({ to: "/sign-in" });
  };

  return (
    <RoyalSignInExperience phase={phase}>
      <div className="w-full">
          {user ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {role ? <RoleBadge role={role} /> : null}
              </div>
              <h2 className={cardTitleClass}>Account details</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">
                Redirecting to your {role ? ROLE_LABELS[role].toLowerCase() : "account"} dashboard.
              </p>
              <form className="mt-8 space-y-4" onSubmit={updateProfile}>
                <div>
                  <label htmlFor="profile-name" className="eyebrow mb-2 block text-ink/90">
                    Full name
                  </label>
                  <input
                    id="profile-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="eyebrow mb-2 block text-ink/90">
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={user.email ?? ""}
                    disabled
                    className="w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)] bg-background/30 px-4 py-3 text-sm text-ink/55"
                  />
                </div>
                <div>
                  <label htmlFor="profile-phone" className="eyebrow mb-2 block text-ink/90">
                    Phone
                  </label>
                  <input
                    id="profile-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="royal-signin-btn disabled:cursor-not-allowed"
                >
                  {savingProfile ? "Saving profile..." : "Save profile"}
                </button>
                {role ? (
                  <Link
                    to={dashboardPathForRole(role)}
                    className="block w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-3 text-center text-sm font-medium text-ink transition-colors hover:border-ember/50 hover:text-ember"
                  >
                    Go to {ROLE_LABELS[role]} dashboard
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={signOut}
                  className="glass glass-hover glass-hover-active w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-ember/50 hover:text-ember"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : mode === "signin" ? (
            <>
              <p className="text-center text-[0.62rem] font-medium uppercase tracking-[0.32em] text-[#C9A227]">
                The Royal Passage
              </p>
              <h2 className={`${cardTitleClass} mt-3 text-center`}>Welcome to the Kingdom</h2>
              <p className="mt-2 text-center text-sm leading-relaxed text-[#F8F4E8]/72">
                Sign in to enter the palace and access your royal passage.
              </p>

              <div className="mt-8 space-y-4">
                <GoogleSignInButton
                  busy={googleBusy}
                  disabled={!browserConfigured}
                  onClick={() => void signInWithGoogle()}
                />
                <div className="flex items-center gap-3">
                  <div className="hairline flex-1" />
                  <span className="text-xs uppercase tracking-[0.14em] text-ink/55">
                    or email
                  </span>
                  <div className="hairline flex-1" />
                </div>
              </div>

              <form className="mt-4 space-y-4" onSubmit={signIn}>
                <div>
                  <label htmlFor="signin-email" className="eyebrow mb-2 block text-ink/90">
                    Email
                  </label>
                  <input
                    id="signin-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="signin-password" className="eyebrow mb-2 block text-ink/90">
                    Password
                  </label>
                  <input
                    id="signin-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy || isAnimating || !email.trim() || !password}
                  className="royal-signin-btn disabled:cursor-not-allowed"
                >
                  {busy || isAnimating ? "Entering..." : "Sign in"}
                </button>
                {emailNotConfirmed ? (
                  <button
                    type="button"
                    onClick={() => void resendConfirmation()}
                    disabled={resendingConfirmation || !email.trim()}
                    className="w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-ember/50 hover:text-ember disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {resendingConfirmation ? "Sending..." : "Resend confirmation email"}
                  </button>
                ) : null}
              </form>

              <p className="mt-6 text-center text-sm text-ink/70">
                New guest?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setNotice(null);
                  }}
                  className="text-ember underline-offset-4 transition-colors hover:underline"
                >
                  Create an account
                </button>
              </p>

              <div className="mt-8 border-t border-[oklch(0.88_0.08_86_/_0.25)] pt-6">
                <button
                  type="button"
                  onClick={() => setShowJwtSignIn((open) => !open)}
                  className="w-full text-left text-sm font-medium text-ink transition-colors hover:text-ember"
                >
                  {showJwtSignIn ? "Hide host / admin JWT sign-in" : "Host or admin? Sign in with JWT"}
                </button>
                {showJwtSignIn ? (
                  <div className="mt-4">
                    <JwtSignInForm
                      busy={busy}
                      onBusyChange={setBusy}
                      onError={setError}
                      onNotice={setNotice}
                      onSuccess={beginPalaceEntry}
                    />
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-[0.62rem] font-medium uppercase tracking-[0.32em] text-[#C9A227]">
                Guest Registration
              </p>
              <h2 className={`${cardTitleClass} mt-3 text-center`}>Join the Kingdom</h2>
              <p className="mt-2 text-center text-sm leading-relaxed text-[#F8F4E8]/72">
                Create a guest account to book curated Mysuru experiences.
              </p>

              <div className="mt-8 space-y-4">
                <GoogleSignInButton
                  busy={googleBusy}
                  disabled={!browserConfigured}
                  label="Sign up with Google"
                  onClick={() => void signInWithGoogle()}
                />
                <div className="flex items-center gap-3">
                  <div className="hairline flex-1" />
                  <span className="text-xs uppercase tracking-[0.14em] text-ink/55">
                    or email
                  </span>
                  <div className="hairline flex-1" />
                </div>
              </div>

              <form className="mt-4 space-y-4" onSubmit={signUpGuest}>
                <div>
                  <label htmlFor="signup-name" className="eyebrow mb-2 block text-ink/90">
                    Full name
                  </label>
                  <input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="signup-email" className="eyebrow mb-2 block text-ink/90">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="signup-phone" className="eyebrow mb-2 block text-ink/90">
                    Phone
                  </label>
                  <input
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className="eyebrow mb-2 block text-ink/90">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy || !email.trim() || !password || !fullName.trim()}
                  className="royal-signin-btn disabled:cursor-not-allowed"
                >
                  {busy ? "Creating account..." : "Create guest account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-ink/70">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setNotice(null);
                  }}
                  className="text-ember underline-offset-4 transition-colors hover:underline"
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {!browserConfigured && (
            <p className="mt-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Missing browser auth env vars. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p
              className="mt-4 rounded-sm border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ink"
              role="status"
            >
              {notice}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-[#F8F4E8]/65">
            <Link
              to="/"
              className="text-[#D4AF37] underline-offset-4 transition-colors hover:underline"
            >
              Return to homepage →
            </Link>
          </p>
        </div>
    </RoyalSignInExperience>
  );
}
