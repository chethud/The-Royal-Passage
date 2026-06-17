import { useState, type FormEvent } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { createHost } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";

const inputClass =
  "w-full rounded-sm border border-[rgb(88_16_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body placeholder:text-[rgb(27_23_22/0.4)] focus:border-brand-maroon-deep/50 focus:outline-none focus:ring-1 focus:ring-brand-maroon-deep/25";

type CreateHostFormProps = {
  accessToken: string;
  onCreated: () => void;
};

export function CreateHostForm({ accessToken, onCreated }: CreateHostFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      await createHost(accessToken, {
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      setNotice(`Host login created for ${email.trim()}. Share these credentials with the provider.`);
      setDisplayName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setBio("");
      onCreated();
    } catch (err) {
      setError(toErrorMessage(err, "Failed to create host account."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <LuxuryCheckoutPanel>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="luxury-panel-heading font-display text-2xl">Add experience provider (host)</h2>
          <p className="luxury-panel-body mt-2 text-sm">
            Create a login for artisans, chefs, guides, and other hosts. They sign in on the same page
            using the Host tab — they cannot sign up themselves.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="host-display-name" className="eyebrow luxury-panel-label mb-2 block">
              Display name
            </label>
            <input
              id="host-display-name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Heritage Clay Studio"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="host-email" className="eyebrow luxury-panel-label mb-2 block">
              Login email
            </label>
            <input
              id="host-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="studio@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="host-password" className="eyebrow luxury-panel-label mb-2 block">
              Temporary password
            </label>
            <input
              id="host-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="host-phone" className="eyebrow luxury-panel-label mb-2 block">
              Phone
            </label>
            <input
              id="host-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98XXXXXXX"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="host-bio" className="eyebrow luxury-panel-label mb-2 block">
            Short bio
          </label>
          <textarea
            id="host-bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Third-generation potters hosting intimate wheel sessions."
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="luxury-btn-sm luxury-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? "Creating host login..." : "Create host login"}
        </button>

        {error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-sm border border-[rgb(88_16_0/0.2)] bg-[rgb(255_255_255/0.45)] px-4 py-3 text-sm luxury-panel-body">
            {notice}
          </p>
        ) : null}
      </form>
    </LuxuryCheckoutPanel>
  );
}
