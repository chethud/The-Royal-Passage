import { useMemo, useState, type FormEvent } from "react";
import { signInWithJwtToken } from "@/lib/auth-jwt";
import { decodeJwt, formatJwtJson } from "@/lib/jwt";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const inputClass =
  "w-full rounded-sm border border-input bg-background/50 px-4 py-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-ember/50 focus:outline-none focus:ring-1 focus:ring-ember/30";

type JwtSignInFormProps = {
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string | null) => void;
  onNotice: (message: string | null) => void;
};

export function JwtSignInForm({ busy, onBusyChange, onError, onNotice }: JwtSignInFormProps) {
  const [token, setToken] = useState("");
  const decoded = useMemo(() => (token.trim() ? decodeJwt(token) : null), [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onError(null);
    onNotice(null);

    const supabase = getSupabaseBrowser();
    try {
      onBusyChange(true);
      await signInWithJwtToken(supabase, token);
      onNotice("Signed in with JWT. Redirecting to your dashboard…");
    } catch (err) {
      onError(err instanceof Error ? err.message : "JWT sign-in failed.");
    } finally {
      onBusyChange(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Host and admin accounts can paste a Supabase JWT access token. API requests send it as{" "}
        <span className="font-mono text-xs">Authorization: Bearer &lt;token&gt;</span>.
      </p>
      <div>
        <label htmlFor="jwt-token" className="eyebrow mb-2 block text-foreground/90">
          JWT access token
        </label>
        <textarea
          id="jwt-token"
          name="jwtToken"
          rows={4}
          required
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className={inputClass}
        />
      </div>

      {decoded ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-2 text-foreground/90">Decoded header</p>
            <pre className="max-h-40 overflow-auto rounded-sm border border-input/70 bg-background/40 p-3 font-mono text-[11px] leading-relaxed text-foreground/90">
              {formatJwtJson(decoded.header)}
            </pre>
          </div>
          <div>
            <p className="eyebrow mb-2 text-foreground/90">Decoded payload</p>
            <pre className="max-h-40 overflow-auto rounded-sm border border-input/70 bg-background/40 p-3 font-mono text-[11px] leading-relaxed text-foreground/90">
              {formatJwtJson(decoded.payload)}
            </pre>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={busy || !token.trim()}
        className="w-full rounded-sm bg-ember py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "Verifying JWT…" : "Sign in with JWT"}
      </button>
    </form>
  );
}
