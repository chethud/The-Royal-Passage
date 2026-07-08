import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { GuestProfile } from "@/lib/api/guest";
import { updateAccountProfile } from "@/lib/profile-browser";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { toErrorMessage } from "@/lib/api/client";
import { handlePassportPhotoUpload } from "@/lib/passport-photo/passport-photo-upload";
import { resolveRegistrationNumber } from "@/lib/registration-number";
import {
  RoyalPassportBook,
  type PassportMobilePage,
} from "@/components/passport/RoyalPassportBook";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { useAuthUser } from "@/lib/auth-user";

type GuestProfileFormProps = {
  profile: GuestProfile;
  onUpdated: (profile: GuestProfile) => void;
};

export function GuestProfileForm({ profile, onUpdated }: GuestProfileFormProps) {
  const { detectLargestFace, loading: faceModelLoading, error: faceModelError } = useFaceDetection();
  const { vipMembershipStatus: authVipStatus, vipMembershipRejectedAt: authVipRejectedAt } =
    useAuthUser();
  const vipMembershipStatus = authVipStatus ?? profile.vipMembershipStatus;
  const vipMembershipRejectedAt = authVipRejectedAt;

  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatarUrl ?? null);
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [mobilePage, setMobilePage] = useState<PassportMobilePage>("identity");

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

  const goToPage = (page: PassportMobilePage) => {
    setMobilePage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="royal-passport-form"
      data-mobile-page={mobilePage}
    >
      {faceModelLoading ? (
        <p className="royal-passport-form__status">Preparing portrait intelligence…</p>
      ) : null}
      {faceModelError ? (
        <p className="royal-passport-form__status royal-passport-form__status--warn">
          Portrait detection unavailable — photos will use a centered crop. {faceModelError}
        </p>
      ) : null}

      <RoyalPassportBook
        regNo={resolveRegistrationNumber(profile)}
        fullName={fullName}
        dateOfBirth={dateOfBirth}
        domicile="Mysuru, Bharata"
        email={profile.email}
        phone={phone}
        vipMembershipStatus={vipMembershipStatus}
        vipMembershipRejectedAt={vipMembershipRejectedAt}
        photoUrl={previewUrl}
        photoProcessing={uploadingPhoto}
        mobilePage={mobilePage}
        onFullNameChange={setFullName}
        onDateOfBirthChange={setDateOfBirth}
        onPhoneChange={setPhone}
        onPhotoSelected={(file) => void handlePhotoSelected(file)}
      />

      {error ? <p className="royal-passport-form__error">{error}</p> : null}
      {saved ? <p className="royal-passport-form__saved">Profile updated.</p> : null}

      <div className="royal-passport-form__actions">
        <button
          type="button"
          className="royal-passport-form__nav royal-passport-form__nav--back"
          onClick={() => goToPage("identity")}
        >
          Back
        </button>

        <button
          type="submit"
          disabled={saving || uploadingPhoto}
          className="royal-passport-form__save"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>

        <button
          type="button"
          className="royal-passport-form__nav royal-passport-form__nav--next"
          onClick={() => goToPage("vip")}
        >
          Next
        </button>
      </div>
    </form>
  );
}
