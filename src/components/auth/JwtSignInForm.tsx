import { useMemo, useState, type FormEvent } from "react";
import { signInWithJwtToken } from "@/lib/auth-jwt";
import { decodeJwt, formatJwtJson } from "@/lib/jwt";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const inputClass = "royal-signin-engraved-input font-mono text-xs";
const inscriptionClass = "royal-signin-inscription";

type JwtSignInFormProps = {
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string | null) => void;
  onNotice: (message: string | null) => void;
  onSuccess?: () => void;
};

export function JwtSignInForm({ busy, onBusyChange, onError, onNotice, onSuccess }: JwtSignInFormProps) {
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
      onSuccess?.();
      onNotice("Signed in with JWT. Entering the kingdom…");
    } catch (err) {
      onError(err instanceof Error ? err.message : "JWT sign-in failed.");
    } finally {
      onBusyChange(false);
    }
  };

  return (
    <form className="royal-signin-engraved-form mt-2" onSubmit={handleSubmit}>
      <p className={`${inscriptionClass} ${inscriptionClass}--verse`}>
        Host and admin may inscribe a court JWT upon the palace ledger.
      </p>
      <div className="royal-signin-field">
        <label htmlFor="jwt-token" className={inscriptionClass}>
          Court JWT Decree
        </label>
        <textarea
          id="jwt-token"
          name="jwtToken"
          rows={4}
          required
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className={`${inputClass} min-h-[5.5rem] resize-y`}
        />
      </div>

      {decoded ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className={inscriptionClass}>Decree Header</p>
            <pre className="royal-signin-engraved-input max-h-32 overflow-auto p-2 font-mono text-[10px] leading-relaxed">
              {formatJwtJson(decoded.header)}
            </pre>
          </div>
          <div>
            <p className={inscriptionClass}>Decree Body</p>
            <pre className="royal-signin-engraved-input max-h-32 overflow-auto p-2 font-mono text-[10px] leading-relaxed">
              {formatJwtJson(decoded.payload)}
            </pre>
          </div>
        </div>
      ) : null}

      <button type="submit" disabled={busy || !token.trim()} className="royal-signin-seal">
        {busy ? "Verifying…" : "Seal JWT Entry"}
      </button>
    </form>
  );
}
