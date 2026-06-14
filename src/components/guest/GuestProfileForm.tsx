import { useState } from "react";
import type { GuestProfile } from "@/lib/api/guest";
import { updateGuestProfile } from "@/lib/api/guest";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";

type GuestProfileFormProps = {
  profile: GuestProfile;
  accessToken: string;
  onUpdated: (profile: GuestProfile) => void;
};

export function GuestProfileForm({ profile, accessToken, onUpdated }: GuestProfileFormProps) {
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      if (!isApiConfigured()) {
        throw new Error("Profile API is not configured for this deployment.");
      }
      const updated = await updateGuestProfile(accessToken, {
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      onUpdated(updated);
      setSaved(true);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="max-w-xl space-y-6">
      <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8">
        <dl className="grid gap-5 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="eyebrow text-muted-foreground">Email</dt>
            <dd className="mt-1">{profile.email ?? "—"}</dd>
            <p className="mt-1 text-xs text-muted-foreground">Email is managed through your sign-in account.</p>
          </div>
          <div>
            <label htmlFor="guest-full-name" className="eyebrow text-muted-foreground">
              Full name
            </label>
            <input
              id="guest-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="guest-phone" className="eyebrow text-muted-foreground">
              Phone
            </label>
            <input
              id="guest-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-2 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm"
            />
          </div>
        </dl>
      </div>

      {error ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {saved ? <p className="text-sm text-ember">Profile updated.</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-sm bg-ember px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
