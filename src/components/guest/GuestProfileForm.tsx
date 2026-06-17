import { useRef, useState } from "react";
import type { GuestProfile } from "@/lib/api/guest";
import { updateAccountProfile } from "@/lib/profile-browser";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { toErrorMessage } from "@/lib/api/client";
import { uploadProfilePhoto } from "@/lib/profile-photo-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type GuestProfileFormProps = {
  profile: GuestProfile;
  onUpdated: (profile: GuestProfile) => void;
};

function profileInitials(fullName: string | null, email: string | null): string {
  const source = fullName?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function GuestProfileForm({ profile, onUpdated }: GuestProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingPhoto(true);
    setError(null);
    setSaved(false);
    try {
      const url = await uploadProfilePhoto(file);
      setAvatarUrl(url);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to upload profile photo."));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl("");
    setSaved(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      if (!isSupabaseBrowserConfigured()) {
        throw new Error("Supabase is not configured for this deployment.");
      }
      const updated = await updateAccountProfile({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        avatarUrl,
        dateOfBirth,
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="h-24 w-24 border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/40">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-gold/15 text-lg font-semibold text-gold">
              {profileInitials(fullName, profile.email)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-3">
            <div>
              <p className="eyebrow text-muted-foreground">Profile photo</p>
              <p className="mt-1 text-xs text-muted-foreground">Optional. JPEG, PNG, WebP, or GIF up to 5 MB.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:border-ember/50 disabled:opacity-60"
              >
                {uploadingPhoto ? "Uploading…" : avatarUrl ? "Change photo" : "Add photo"}
              </button>
              {avatarUrl ? (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="rounded-sm px-3 py-2 text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-destructive"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => void handlePhotoSelect(event)}
            />
          </div>
        </div>

        <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <label htmlFor="guest-date-of-birth" className="eyebrow text-muted-foreground">
              Date of birth <span className="normal-case tracking-normal text-muted-foreground/80">(optional)</span>
            </label>
            <input
              id="guest-date-of-birth"
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="mt-2 w-full max-w-xs rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm [color-scheme:dark]"
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
        disabled={saving || uploadingPhoto}
        className="rounded-sm bg-ember px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
