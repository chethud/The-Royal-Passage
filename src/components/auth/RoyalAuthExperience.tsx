import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AuthTermsAcceptance } from "@/components/auth/AuthTermsAcceptance";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRoles, isGuestAccount, isStaffRole, ROLE_LABELS } from "@/lib/roles";
import {
  buildAuthRedirect,
  buildOAuthCallbackUrl,
  buildPasswordResetRedirect,
  readAuthCallbackError,
  redirectOffLocalhostIfNeeded,
} from "@/lib/auth-redirect";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { formatAuthError } from "@/lib/format-auth-error";
import { markVipSignupPromptPending } from "@/lib/vip-membership-prompt-storage";

const inputClass =
  "w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/40 px-4 py-3 text-sm text-ink placeholder:text-ink/45 backdrop-blur-sm focus:border-ember/50 focus:outline-none focus:ring-1 focus:ring-ember/30";

type RoyalAuthExperienceProps = {
  initialMode: "signin" | "signup" | "forgot";
};

export function RoyalAuthExperience({ initialMode }: RoyalAuthExperienceProps) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const redirect = typeof search.redirect === "string" ? search.redirect : undefined;

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const browserConfigured = isSupabaseBrowserConfigured();
  const { user, displayName, role, roles, loading } = useAuthUser();
  const supabase = useMemo(() => {
    if (!browserConfigured) return null;
    return getSupabaseBrowser();
  }, [browserConfigured]);

  useEffect(() => {
    setMode(initialMode);
    setAcceptedTerms(false);
  }, [initialMode]);

  const passwordType = showPassword ? "text" : "password";

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

  useEffect(() => {
    if (loading || !user) return;
    if (isStaffRole(role)) {
      void navigate({ to: dashboardPathForRoles(roles, role) });
      return;
    }
    if (redirect && isGuestAccount(role, roles) && redirect.startsWith("/")) {
      window.location.href = redirect;
      return;
    }
    if (role) {
      void navigate({ to: dashboardPathForRoles(roles, role) });
    }
  }, [loading, navigate, redirect, role, roles, user]);

  const isEmailNotConfirmedError = (message: string) => /email not confirmed/i.test(message);

  const signInWithGoogle = async () => {
    setError(null);
    setNotice(null);
    if (!acceptedTerms) {
      setError("Please accept the terms and conditions to continue.");
      return;
    }
    if (!supabase) {
      setError("Supabase browser auth is not configured.");
      return;
    }
    try {
      setGoogleBusy(true);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: buildOAuthCallbackUrl(redirect) },
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
    if (!acceptedTerms) {
      setError("Please accept the terms and conditions to continue.");
      return;
    }
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
      setNotice("Signed in successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign in.";
      if (isEmailNotConfirmedError(message)) {
        setEmailNotConfirmed(true);
        setError(
          "Your email is not confirmed yet. Open the confirmation link from Supabase, or resend it below.",
        );
      } else {
        setError(formatAuthError(err, "Failed to sign in."));
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
        options: { emailRedirectTo: buildAuthRedirect(redirect) },
      });
      if (resendError) throw resendError;
      setNotice(`Confirmation email sent to ${trimmedEmail}. Check your inbox and spam folder.`);
    } catch (err) {
      setError(formatAuthError(err, "Failed to resend confirmation email."));
    } finally {
      setResendingConfirmation(false);
    }
  };

  const sendPasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!supabase) {
      setError("Supabase browser auth is not configured.");
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your email address.");
      return;
    }
    try {
      setSendingPasswordReset(true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: buildPasswordResetRedirect(redirect),
      });
      if (resetError) throw resetError;
      setNotice(
        `If an account exists for ${trimmedEmail}, we sent a password reset link. Check your inbox and spam folder.`,
      );
    } catch (err) {
      setError(formatAuthError(err, "Failed to send password reset email."));
    } finally {
      setSendingPasswordReset(false);
    }
  };

  const signUpGuest = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!acceptedTerms) {
      setError("Please accept the terms and conditions to continue.");
      return;
    }
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
          data: { full_name: fullName.trim(), phone: phone.trim() || null },
        },
      });
      if (signUpError) throw signUpError;
      if (data.session?.user?.id) {
        markVipSignupPromptPending(data.session.user.id);
        setNotice("Account created. You are signed in.");
        if (data.session.access_token) {
          void import("@/lib/api/guest")
            .then(({ fetchGuestProfile }) => fetchGuestProfile(data.session!.access_token))
            .catch(() => undefined);
        }
      } else {
        setNotice(
          "Account created. Check your email for a confirmation link, then sign in with your password.",
        );
        setMode("signin");
        setAcceptedTerms(false);
      }
      setPassword("");
    } catch (err) {
      setError(formatAuthError(err, "Failed to create account."));
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
        data: { full_name: fullName.trim(), phone: phone.trim() },
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

  const pageMeta = user
    ? {
        title: `Welcome, ${displayName ?? "Member"}`,
        subtitle:
          "Your access level is set automatically. You will be redirected to your dashboard, or update your profile below.",
      }
    : mode === "forgot"
      ? {
          title: "Forgot password",
          subtitle:
            "Enter your email and we will send you a secure link to choose a new password.",
        }
      : mode === "signin"
      ? {
          title: "Sign in",
          subtitle:
            "Sign in with Google or your email and password. Your role is assigned automatically.",
        }
      : {
          title: "Create account",
          subtitle:
            "Create a guest account to book experiences. Host, editor, and admin logins are created by the platform team.",
        };

  return (
    <AuthPageLayout title={pageMeta.title} subtitle={pageMeta.subtitle}>
        {user ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              {role ? <RoleBadge role={role} /> : null}
            </div>
            <form className="space-y-4" onSubmit={updateProfile}>
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
                  className={`${inputClass} opacity-70`}
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
                className="w-full rounded-sm bg-ember py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingProfile ? "Saving…" : "Save profile"}
              </button>
            </form>
            <div className="mt-6 flex flex-col gap-3 text-center text-sm">
              {role ? (
                <Link
                  to={dashboardPathForRoles(roles, role)}
                  className="text-ember underline-offset-4 hover:underline"
                >
                  Go to {ROLE_LABELS[role]} dashboard →
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => void signOut()}
                className="text-ink/70 underline-offset-4 hover:text-ink hover:underline"
              >
                Sign out
              </button>
            </div>
          </>
        ) : mode === "forgot" ? (
          <>
            <form className="space-y-4" onSubmit={sendPasswordReset}>
              <div>
                <label htmlFor="forgot-email" className="eyebrow mb-2 block text-ink/90">
                  Email
                </label>
                <input
                  id="forgot-email"
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
              <button
                type="submit"
                disabled={sendingPasswordReset || !email.trim()}
                className="w-full rounded-sm bg-ember py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sendingPasswordReset ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-ink/70">
              Remember your password?{" "}
              <Link
                to="/sign-in"
                search={redirect ? { redirect } : undefined}
                className="text-ember underline-offset-4 transition-colors hover:underline"
                onClick={() => {
                  setMode("signin");
                  setAcceptedTerms(false);
                  setError(null);
                  setNotice(null);
                }}
              >
                Back to sign in
              </Link>
            </p>
          </>
        ) : mode === "signin" ? (
          <>
            <div className="space-y-4">
              <GoogleSignInButton
                busy={googleBusy}
                disabled={!browserConfigured}
                onClick={() => void signInWithGoogle()}
              />
              <div className="flex items-center gap-3">
                <div className="hairline flex-1" />
                <span className="text-xs uppercase tracking-[0.14em] text-ink/55">or email</span>
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
                <div className="relative">
                  <input
                    id="signin-password"
                    name="password"
                    type={passwordType}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
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
                <p className="mt-2 text-right">
                  <Link
                    to="/forgot-password"
                    search={redirect ? { redirect } : undefined}
                    className="text-xs text-ember/90 underline-offset-4 transition-colors hover:text-ember hover:underline"
                  >
                    Forgot password?
                  </Link>
                </p>
              </div>
              <button
                type="submit"
                disabled={busy || !email.trim() || !password}
                className="w-full rounded-sm bg-ember py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <AuthTermsAcceptance
                id="signin-terms"
                checked={acceptedTerms}
                onCheckedChange={setAcceptedTerms}
              />
              {emailNotConfirmed ? (
                <button
                  type="button"
                  onClick={() => void resendConfirmation()}
                  disabled={resendingConfirmation || !email.trim()}
                  className="w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-ember/50 hover:text-ember disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {resendingConfirmation ? "Sending…" : "Resend confirmation email"}
                </button>
              ) : null}
            </form>

            <p className="mt-6 text-center text-sm text-ink/70">
              New guest?{" "}
              <Link
                to="/sign-up"
                className="text-ember underline-offset-4 transition-colors hover:underline"
                onClick={() => {
                  setMode("signup");
                  setAcceptedTerms(false);
                  setError(null);
                  setNotice(null);
                }}
              >
                Create an account
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <GoogleSignInButton
                busy={googleBusy}
                disabled={!browserConfigured}
                label="Sign up with Google"
                onClick={() => void signInWithGoogle()}
              />
              <div className="flex items-center gap-3">
                <div className="hairline flex-1" />
                <span className="text-xs uppercase tracking-[0.14em] text-ink/55">or email</span>
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
                <div className="relative">
                  <input
                    id="signup-password"
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
              <button
                type="submit"
                disabled={busy || !email.trim() || !password || !fullName.trim()}
                className="w-full rounded-sm bg-ember py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? "Creating account…" : "Create guest account"}
              </button>
              <AuthTermsAcceptance
                id="signup-terms"
                checked={acceptedTerms}
                onCheckedChange={setAcceptedTerms}
              />
            </form>

            <p className="mt-6 text-center text-sm text-ink/70">
              Already have an account?{" "}
              <Link
                to="/sign-in"
                className="text-ember underline-offset-4 transition-colors hover:underline"
                onClick={() => {
                  setMode("signin");
                  setAcceptedTerms(false);
                  setError(null);
                  setNotice(null);
                }}
              >
                Sign in
              </Link>
            </p>
          </>
        )}

        {!browserConfigured ? (
          <p className="mt-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Missing browser auth env vars. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
          </p>
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
    </AuthPageLayout>
  );
}
