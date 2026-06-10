import { useMemo, useState, type FormEvent } from "react";
import { RoyalGateField, royalGateInputClass } from "@/components/auth/RoyalGateField";
import { signInWithJwtToken } from "@/lib/auth-jwt";
import { decodeJwt, formatJwtJson } from "@/lib/jwt";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

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
    <form className="mt-2 flex flex-col gap-2" onSubmit={handleSubmit}>
      <p className={`${inscriptionClass} ${inscriptionClass}--verse`}>
        Host and admin court JWT entry.
      </p>
      <RoyalGateField id="jwt-token" label="Court JWT" icon="lock">
        <textarea
          id="jwt-token"
          name="jwtToken"
          rows={3}
          required
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className={`${royalGateInputClass()} min-h-[4.5rem] resize-y font-mono text-xs`}
        />
      </RoyalGateField>

      {decoded ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <pre className="max-h-28 overflow-auto rounded-sm border border-[#d4af3733] bg-[#2a0a0a88] p-2 font-mono text-[10px] text-[#f8f4e8cc]">
            {formatJwtJson(decoded.header)}
          </pre>
          <pre className="max-h-28 overflow-auto rounded-sm border border-[#d4af3733] bg-[#2a0a0a88] p-2 font-mono text-[10px] text-[#f8f4e8cc]">
            {formatJwtJson(decoded.payload)}
          </pre>
        </div>
      ) : null}

      <button type="submit" disabled={busy || !token.trim()} className="royal-gate-decree__submit">
        {busy ? "Verifying…" : "Seal JWT Entry"}
      </button>
    </form>
  );
}
