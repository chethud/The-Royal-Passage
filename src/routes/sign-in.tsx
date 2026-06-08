import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole, ROLE_LABELS } from "@/lib/roles";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

const inputClass =
  "w-full rounded-sm border border-input bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ember/50 focus:outline-none focus:ring-1 focus:ring-ember/30";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const browserConfigured = isSupabaseBrowserConfigured();
  const { user, displayName, role, loading } = useAuthUser();
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
    if (loading || !user || !role) return;
    if (redirect && role === "guest" && redirect.startsWith("/")) {
      window.location.href = redirect;
      return;
    }
    void navigate({ to: dashboardPathForRole(role) });
  }, [loading, navigate, redirect, role, user]);

  const isEmailNotConfirmedError = (message: string) =>
    /email not confirmed/i.test(message);

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
      setNotice("Signed in successfully.");
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
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || null,
          },
        },
      });
      if (signUpError) throw signUpError;
      if (data.session) {
        setNotice("Account created. You are signed in.");
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
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 md:py-24">
        <div className="glass-strong w-full max-w-md rounded-md px-8 py-10 md:px-10 md:py-12">
          {user ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="eyebrow text-ember/90">Your account</div>
                {role ? <RoleBadge role={role} /> : null}
              </div>
              <h1 className="font-display text-3xl tracking-tight md:text-4xl">
                Welcome, {displayName ?? "Member"}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Your access level is set automatically. You will be redirected to your{" "}
                {role ? ROLE_LABELS[role].toLowerCase() : "account"} dashboard.
              </p>
              <form className="mt-8 space-y-4" onSubmit={updateProfile}>
                <div>
                  <label htmlFor="profile-name" className="eyebrow mb-2 block text-foreground/90">
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
                  <label htmlFor="profile-email" className="eyebrow mb-2 block text-foreground/90">
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={user.email ?? ""}
                    disabled
                    className="w-full rounded-sm border border-input/70 bg-background/30 px-4 py-3 text-sm text-muted-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="profile-phone" className="eyebrow mb-2 block text-foreground/90">
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
                  {savingProfile ? "Saving profile..." : "Save profile"}
                </button>
                {role ? (
                  <Link
                    to={dashboardPathForRole(role)}
                    className="block w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-3 text-center text-sm font-medium text-foreground transition-colors hover:border-ember/50 hover:text-ember"
                  >
                    Go to {ROLE_LABELS[role]} dashboard
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={signOut}
                  className="glass glass-hover glass-hover-active w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-ember/50 hover:text-ember"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : mode === "signin" ? (
            <>
              <div className="eyebrow mb-3 text-ember/90">Member access</div>
              <h1 className="font-display text-3xl tracking-tight md:text-4xl">Sign in</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Enter your email and password. The system will open the correct dashboard for your
                account — guest, host, or admin.
              </p>

              <form className="mt-8 space-y-4" onSubmit={signIn}>
                <div>
                  <label htmlFor="signin-email" className="eyebrow mb-2 block text-foreground/90">
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
                  <label htmlFor="signin-password" className="eyebrow mb-2 block text-foreground/90">
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
                  disabled={busy || !email.trim() || !password}
                  className="w-full rounded-sm bg-ember py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {busy ? "Signing in..." : "Sign in"}
                </button>
                {emailNotConfirmed ? (
                  <button
                    type="button"
                    onClick={() => void resendConfirmation()}
                    disabled={resendingConfirmation || !email.trim()}
                    className="w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-ember/50 hover:text-ember disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {resendingConfirmation ? "Sending..." : "Resend confirmation email"}
                  </button>
                ) : null}
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
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
            </>
          ) : (
            <>
              <div className="eyebrow mb-3 text-ember/90">Guest registration</div>
              <h1 className="font-display text-3xl tracking-tight md:text-4xl">Create account</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Only guests can sign up here. Host and admin logins are created by the platform
                team.
              </p>

              <form className="mt-8 space-y-4" onSubmit={signUpGuest}>
                <div>
                  <label htmlFor="signup-name" className="eyebrow mb-2 block text-foreground/90">
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
                  <label htmlFor="signup-email" className="eyebrow mb-2 block text-foreground/90">
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
                  <label htmlFor="signup-phone" className="eyebrow mb-2 block text-foreground/90">
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
                  <label htmlFor="signup-password" className="eyebrow mb-2 block text-foreground/90">
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
                  className="w-full rounded-sm bg-ember py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {busy ? "Creating account..." : "Create guest account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
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
              className="mt-4 rounded-sm border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-foreground"
              role="status"
            >
              {notice}
            </p>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link
              to="/experiences"
              className="text-ember underline-offset-4 transition-colors hover:underline"
            >
              Browse experiences →
            </Link>
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
