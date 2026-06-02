import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { useAuthUser } from "@/lib/auth-user";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — The Royal Passage" },
      { name: "description", content: "Access your member account and bookings." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = Route.useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<null | "otp" | "google">(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const browserConfigured = isSupabaseBrowserConfigured();
  const { user, displayName } = useAuthUser();
  const supabase = useMemo(() => {
    if (!browserConfigured) return null;
    return getSupabaseBrowser();
  }, [browserConfigured]);

  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setNotice("Signed in successfully.");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata ?? {};
    setFullName((meta.full_name as string | undefined) ?? (meta.name as string | undefined) ?? "");
    setPhone((meta.phone as string | undefined) ?? user.phone ?? "");
  }, [user]);

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError(
        "Supabase browser auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      );
      return;
    }

    try {
      setBusy("otp");
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/sign-in` },
      });
      if (otpErr) throw otpErr;
      setNotice("Check your email for the magic link.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP.";
      setError(msg);
    } finally {
      setBusy(null);
    }
  };

  const signInGoogle = async () => {
    setError(null);
    setNotice(null);
    if (!supabase) {
      setError("Supabase browser auth is not configured.");
      return;
    }
    try {
      setBusy("google");
      // Ensure a fresh OAuth handshake and force Google account picker each attempt.
      await supabase.auth.signOut({ scope: "local" });
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/sign-in`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (oauthErr) throw oauthErr;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start Google sign-in.";
      setError(msg);
      setBusy(null);
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
    void navigate({ to: "/" });
  };

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 md:py-24">
        <div className="glass-strong w-full max-w-md rounded-md px-8 py-10 md:px-10 md:py-12">
          {user ? (
            <>
              <div className="eyebrow mb-3 text-ember/90">Your account</div>
              <h1 className="font-display text-3xl tracking-tight md:text-4xl">
                Welcome, {displayName ?? "Member"}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Manage your profile details below.
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
                    className="w-full rounded-sm border border-input bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ember/50 focus:outline-none focus:ring-1 focus:ring-ember/30"
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
                    className="w-full rounded-sm border border-input bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ember/50 focus:outline-none focus:ring-1 focus:ring-ember/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full rounded-sm bg-ember py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingProfile ? "Saving profile..." : "Save profile"}
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="glass glass-hover glass-hover-active w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-ember/50 hover:text-ember"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="eyebrow mb-3 text-ember/90">Member access</div>
              <h1 className="font-display text-3xl tracking-tight md:text-4xl">Sign in</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Use Google or receive a magic link via email.
              </p>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={signInGoogle}
                  disabled={busy !== null}
                  className="glass glass-hover glass-hover-active w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-ember/50 hover:text-ember disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === "google" ? "Redirecting to Google..." : "Continue with Google"}
                </button>
              </div>

              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span className="h-px flex-1 bg-border/70" />
                <span>Or email OTP</span>
                <span className="h-px flex-1 bg-border/70" />
              </div>

              <form className="space-y-4" onSubmit={sendOtp}>
                <div>
                  <label htmlFor="signin-email" className="eyebrow mb-2 block text-foreground/90">
                    Email
                  </label>
                  <input
                    id="signin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-sm border border-input bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ember/50 focus:outline-none focus:ring-1 focus:ring-ember/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy !== null || !email.trim()}
                  className="w-full rounded-sm bg-ember py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110"
                >
                  {busy === "otp" ? "Sending magic link..." : "Send magic link"}
                </button>
              </form>
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
