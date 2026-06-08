import { useState, type FormEvent } from "react";
import { createHostAccount } from "@/lib/admin-fns";

const inputClass =
  "w-full rounded-sm border border-input bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ember/50 focus:outline-none focus:ring-1 focus:ring-ember/30";

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
      await createHostAccount({
        data: {
          accessToken,
          displayName: displayName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          bio: bio.trim() || undefined,
        },
      });
      setNotice(`Host login created for ${email.trim()}. Share these credentials with the provider.`);
      setDisplayName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setBio("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create host account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-strong space-y-4 rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6"
    >
      <div>
        <h2 className="font-display text-2xl">Add experience provider (host)</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a login for artisans, chefs, guides, and other hosts. They sign in on the same page
          using the Host tab — they cannot sign up themselves.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="host-display-name" className="eyebrow mb-2 block text-foreground/90">
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
          <label htmlFor="host-email" className="eyebrow mb-2 block text-foreground/90">
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
          <label htmlFor="host-password" className="eyebrow mb-2 block text-foreground/90">
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
          <label htmlFor="host-phone" className="eyebrow mb-2 block text-foreground/90">
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
        <label htmlFor="host-bio" className="eyebrow mb-2 block text-foreground/90">
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
        className="rounded-sm bg-ember px-6 py-3 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "Creating host login..." : "Create host login"}
      </button>

      {error ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-sm border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-foreground">
          {notice}
        </p>
      ) : null}
    </form>
  );
}
