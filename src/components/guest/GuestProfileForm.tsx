import { useCallback, useState } from "react";
import { Crown } from "lucide-react";
import { toast } from "sonner";
import type { GuestProfile } from "@/lib/api/guest";
import { updateAccountProfile } from "@/lib/profile-browser";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { toErrorMessage } from "@/lib/api/client";
import { handlePassportPhotoUpload } from "@/lib/passport-photo/passport-photo-upload";
import { RoyalPassportBook } from "@/components/passport/RoyalPassportBook";
import { useFaceDetection } from "@/hooks/useFaceDetection";

type GuestProfileFormProps = {
  profile: GuestProfile;
  onUpdated: (profile: GuestProfile) => void;
};

function registrationNumberFromId(id: string): string {
  const digits = id.replace(/\D/g, "");
  if (digits.length >= 7) return digits.slice(0, 7);
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 10_000_000;
  }
  return String(hash).padStart(7, "0");
}

export function GuestProfileForm({ profile, onUpdated }: GuestProfileFormProps) {
  const { detectLargestFace, loading: faceModelLoading, error: faceModelError } = useFaceDetection();

  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatarUrl ?? null);
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handlePhotoSelected = useCallback(
    async (file: File) => {
      setUploadingPhoto(true);
      setError(null);
      setSaved(false);

      try {
        let faceBox = null;
        try {
          faceBox = await detectLargestFace(file);
        } catch {
          faceBox = null;
        }

        if (!faceBox) {
          toast.warning("No face detected", {
            description:
              "We centered your photo in the passport frame. For best results, upload a clear front-facing portrait.",
          });
        }

        const result = await handlePassportPhotoUpload(file, faceBox);
        setPreviewUrl(result.previewUrl);
        setAvatarUrl(result.uploadedUrl);
      } catch (err) {
        setError(toErrorMessage(err, "Failed to process passport portrait."));
      } finally {
        setUploadingPhoto(false);
      }
    },
    [detectLargestFace],
  );

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
    <form onSubmit={(event) => void handleSubmit(event)} className="royal-passport-form">
      {faceModelLoading ? (
        <p className="royal-passport-form__status">Preparing portrait intelligence…</p>
      ) : null}
      {faceModelError ? (
        <p className="royal-passport-form__status royal-passport-form__status--warn">
          Portrait detection unavailable — photos will use a centered crop. {faceModelError}
        </p>
      ) : null}

      <RoyalPassportBook
        regNo={registrationNumberFromId(profile.id)}
        fullName={fullName}
        dateOfBirth={dateOfBirth}
        domicile="Mysuru, Bharata"
        email={profile.email}
        phone={phone}
        vipMembershipStatus={profile.vipMembershipStatus}
        photoUrl={previewUrl}
        photoProcessing={uploadingPhoto}
        onFullNameChange={setFullName}
        onDateOfBirthChange={setDateOfBirth}
        onPhoneChange={setPhone}
        onPhotoSelected={(file) => void handlePhotoSelected(file)}
      />

      {error ? (
        <p className="royal-passport-form__error">{error}</p>
      ) : null}
      {saved ? <p className="royal-passport-form__saved">Profile updated.</p> : null}

      <button
        type="submit"
        disabled={saving || uploadingPhoto}
        className="royal-passport-form__save"
      >
        <Crown className="royal-passport-form__save-icon" aria-hidden />
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
