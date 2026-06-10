import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { JwtSignInForm } from "@/components/auth/JwtSignInForm";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { RoyalCrest } from "@/components/auth/RoyalCrest";
import { EyeToggle, RoyalGateField, royalGateInputClass } from "@/components/auth/RoyalGateField";
import { RoyalPalaceGateway } from "@/components/auth/RoyalPalaceGateway";
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
import { getRoyalSignInPhaseFlags } from "@/lib/royal-sign-in-phase";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

const inscriptionClass = "royal-signin-inscription";

type RoyalAuthExperienceProps = {
  initialMode: "signin" | "signup";
};

export function RoyalAuthExperience({ initialMode }: RoyalAuthExperienceProps) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const redirect = typeof search.redirect === "string" ? search.redirect : undefined;

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [showJwtSignIn, setShowJwtSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
  const { user, role, loading } = useAuthUser();
  const reducedMotion = usePrefersReducedMotion();
  const { phase, start, intro, isAnimating } = useRoyalSignInAnimation(reducedMotion);
  const pendingPalaceEntryRef = useRef(false);
  const introStartedRef = useRef(false);
  const supabase = useMemo(() => {
    if (!browserConfigured) return null;
    return getSupabaseBrowser();
  }, [browserConfigured]);

  const phaseFlags = getRoyalSignInPhaseFlags(phase);
  const gatewayFlags = {
    lit: phaseFlags.archLit,
    formVisible: phaseFlags.showForm,
    formGlowing: phaseFlags.formGlowing,
    formDissolving: phaseFlags.formDissolving,
    sealActive: phaseFlags.sealActive,
    activationActive: phaseFlags.activationActive,
    showSealRings: phaseFlags.showSealRings,
    showDissolveParticles: phaseFlags.showDissolveParticles,
    showDoors: phaseFlags.showDoors,
    doorsRevealing: phaseFlags.doorsRevealing,
    doorsUnlocking: phaseFlags.doorsUnlocking,
    doorsOpen: phaseFlags.doorsOpen,
  };
  const passwordType = showPassword ? "text" : "password";
  const eyeToggle = <EyeToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />;

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

  // Stages 1–3 play automatically on load for a visitor, lighting the arch
  // and glowing the form before they sign in.
  useEffect(() => {
    if (loading || user || introStartedRef.current) return;
    introStartedRef.current = true;
    intro();
  }, [intro, loading, user]);

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

  const isEmailNotConfirmedError = (message: string) => /email not confirmed/i.test(message);

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
        options: { emailRedirectTo: buildAuthRedirect(redirect) },
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
          data: { full_name: fullName.trim(), phone: phone.trim() || null },
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
        setMode("signin");
      }
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

  const statusAnnex = (
    <>
      {!browserConfigured && (
        <p className={`${inscriptionClass} ${inscriptionClass}--alert text-center`}>
          Missing browser auth env vars. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
        </p>
      )}
      {error ? <p className={`${inscriptionClass} ${inscriptionClass}--alert text-center`}>{error}</p> : null}
      {notice ? (
        <p className={`${inscriptionClass} ${inscriptionClass}--notice text-center`} role="status">
          {notice}
        </p>
      ) : null}
    </>
  );

  const portal = user ? (
    <RoyalPalaceGateway {...gatewayFlags} onSubmit={updateProfile} annex={statusAnnex} decree={
      <>
        {role ? <div className="mb-2 flex justify-center"><RoleBadge role={role} /></div> : null}
        <RoyalCrest className="royal-gate-decree__crest mx-auto" />
        <h2 className="royal-gate-decree__title">Thy Court Identity</h2>
        <p className="royal-gate-decree__subtitle">
          Redirecting to your {role ? ROLE_LABELS[role].toLowerCase() : "account"} chamber.
        </p>
        <RoyalGateField id="profile-name" label="Full Name" icon="user">
          <input id="profile-name" name="fullName" type="text" autoComplete="name" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={royalGateInputClass()} />
        </RoyalGateField>
        <RoyalGateField id="profile-email" label="Email" icon="mail">
          <input id="profile-email" type="email" value={user.email ?? ""} disabled className={royalGateInputClass(true)} />
        </RoyalGateField>
        <RoyalGateField id="profile-phone" label="Phone" icon="phone">
          <input id="profile-phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 98XXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className={royalGateInputClass()} />
        </RoyalGateField>
        <button type="submit" disabled={savingProfile} className="royal-gate-decree__submit">
          {savingProfile ? "Recording…" : "Seal Profile"}
        </button>
        <div className="royal-gate-decree__links">
          {role ? <Link to={dashboardPathForRole(role)} className="royal-gate-decree__link">Enter {ROLE_LABELS[role]} chamber →</Link> : null}
          <button type="button" onClick={signOut} className="royal-gate-decree__link">Depart the kingdom</button>
        </div>
      </>
    } />
  ) : mode === "signin" ? (
    <RoyalPalaceGateway {...gatewayFlags} onSubmit={signIn} annex={<>{statusAnnex}{showJwtSignIn ? <JwtSignInForm busy={busy} onBusyChange={setBusy} onError={setError} onNotice={setNotice} onSuccess={beginPalaceEntry} /> : null}</>} decree={
      <>
        <RoyalCrest className="royal-gate-decree__crest mx-auto" />
        <p className="royal-gate-decree__eyebrow">Welcome to</p>
        <h2 className="royal-gate-decree__title">The Royal Passage</h2>
        <RoyalGateField id="signin-email" label="Email or Phone" icon="mail">
          <input id="signin-email" name="email" type="email" autoComplete="username" required placeholder="you@kingdom.in" value={email} onChange={(e) => setEmail(e.target.value)} className={royalGateInputClass()} />
        </RoyalGateField>
        <RoyalGateField id="signin-password" label="Password" icon="lock" trailing={eyeToggle}>
          <input id="signin-password" name="password" type={passwordType} autoComplete="current-password" required placeholder="Your royal seal" value={password} onChange={(e) => setPassword(e.target.value)} className={royalGateInputClass()} />
        </RoyalGateField>
        <div className="royal-gate-decree__row">
          <label className="royal-gate-decree__remember"><input type="checkbox" className="royal-signin-checkbox" /> Remember Me</label>
          <button type="button" className="royal-gate-decree__link">Forgot Password?</button>
        </div>
        <button type="submit" disabled={busy || isAnimating || !email.trim() || !password} className="royal-gate-decree__submit">
          {busy || isAnimating ? "Opening…" : "Enter the Palace"}
        </button>
        <div className="royal-gate-decree__links">
          <GoogleSignInButton busy={googleBusy} disabled={!browserConfigured} className="royal-gate-decree__link royal-gate-decree__link--google" onClick={() => void signInWithGoogle()} />
          {emailNotConfirmed ? (
            <button type="button" onClick={() => void resendConfirmation()} disabled={resendingConfirmation || !email.trim()} className="royal-gate-decree__link">
              {resendingConfirmation ? "Sending…" : "Resend confirmation"}
            </button>
          ) : null}
          <Link to="/sign-up" className="royal-gate-decree__link" onClick={() => { setMode("signup"); setError(null); setNotice(null); }}>Create Account</Link>
          <button type="button" onClick={() => setShowJwtSignIn((o) => !o)} className="royal-gate-decree__link">
            {showJwtSignIn ? "Hide JWT entry" : "Host / admin JWT"}
          </button>
          <Link to="/" className="royal-gate-decree__link">Return to homepage →</Link>
        </div>
      </>
    } />
  ) : (
    <RoyalPalaceGateway {...gatewayFlags} onSubmit={signUpGuest} annex={statusAnnex} decree={
      <>
        <RoyalCrest className="royal-gate-decree__crest mx-auto" />
        <p className="royal-gate-decree__eyebrow">Join the Kingdom</p>
        <h2 className="royal-gate-decree__title">Request Royal Passage</h2>
        <p className="royal-gate-decree__subtitle">Inscribe thy name upon the palace ledger.</p>
        <RoyalGateField id="signup-name" label="Full Name" icon="user">
          <input id="signup-name" name="fullName" type="text" autoComplete="name" required placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={royalGateInputClass()} />
        </RoyalGateField>
        <RoyalGateField id="signup-email" label="Email" icon="mail">
          <input id="signup-email" name="email" type="email" autoComplete="email" required placeholder="you@kingdom.in" value={email} onChange={(e) => setEmail(e.target.value)} className={royalGateInputClass()} />
        </RoyalGateField>
        <RoyalGateField id="signup-phone" label="Phone" icon="phone">
          <input id="signup-phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 98XXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className={royalGateInputClass()} />
        </RoyalGateField>
        <RoyalGateField id="signup-password" label="Password" icon="lock" trailing={eyeToggle}>
          <input id="signup-password" name="password" type={passwordType} autoComplete="new-password" required minLength={8} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={royalGateInputClass()} />
        </RoyalGateField>
        <button type="submit" disabled={busy || !email.trim() || !password || !fullName.trim()} className="royal-gate-decree__submit">
          {busy ? "Inscribing…" : "Seal Guest Passage"}
        </button>
        <div className="royal-gate-decree__links">
          <GoogleSignInButton busy={googleBusy} disabled={!browserConfigured} label="Sign up with Google" className="royal-gate-decree__link royal-gate-decree__link--google" onClick={() => void signInWithGoogle()} />
          <Link to="/sign-in" className="royal-gate-decree__link" onClick={() => { setMode("signin"); setError(null); setNotice(null); }}>Return to gateway</Link>
          <Link to="/" className="royal-gate-decree__link">Return to homepage →</Link>
        </div>
      </>
    } />
  );

  return <RoyalSignInExperience phase={phase} portal={portal} />;
}
