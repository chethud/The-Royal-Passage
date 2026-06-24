import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { submitVipMembershipApplication } from "@/lib/api/vip-membership";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useAuthUser } from "@/lib/auth-user";
import { uploadVipAadhaarPhoto } from "@/lib/vip-aadhaar-photo-upload";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

const inputClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";

export function VipMembershipApplyForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, accessToken, displayName, profile, refreshVipMembershipStatus } = useAuthUser();
  const [fullName, setFullName] = useState(displayName ?? profile?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [address, setAddress] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarPhotoUrl, setAadhaarPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingPhoto(true);
    setError(null);
    try {
      setAadhaarPhotoUrl(await uploadVipAadhaarPhoto(file));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to upload Aadhaar photo."));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!aadhaarPhotoUrl) {
      setError("Please upload a clear photo of your Aadhaar card.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      await submitVipMembershipApplication(accessToken, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        idDocumentNumber: aadhaarNumber.replace(/\s/g, ""),
        idDocumentPhotoUrl: aadhaarPhotoUrl,
      });
      await refreshVipMembershipStatus();
      void navigate({ to: "/account/profile" });
    } catch (err) {
      setError(toErrorMessage(err, "Failed to submit VIP membership application."));
    } finally {
      setBusy(false);
    }
  };

  if (!user || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <LuxuryCheckoutPanel>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h2 className="luxury-panel-heading font-display text-2xl">VIP membership application</h2>
          <p className="luxury-panel-body mt-2 text-sm">
            Aadhaar card is required for Royal VIP verification. Upload a clear photo of your
            Aadhaar and enter the 12-digit number. Our concierge will review your application.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="vip-full-name" className="eyebrow luxury-panel-label mb-2 block">
              Full name
            </label>
            <input
              id="vip-full-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="vip-email" className="eyebrow luxury-panel-label mb-2 block">
              Email
            </label>
            <input
              id="vip-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="vip-phone" className="eyebrow luxury-panel-label mb-2 block">
              Phone
            </label>
            <input
              id="vip-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="vip-aadhaar-number" className="eyebrow luxury-panel-label mb-2 block">
              Aadhaar number
            </label>
            <input
              id="vip-aadhaar-number"
              required
              inputMode="numeric"
              pattern="\d{12}"
              maxLength={12}
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="12-digit Aadhaar number"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <p className="eyebrow luxury-panel-label mb-2 block">Aadhaar card photo</p>
          <p className="luxury-panel-body mb-3 text-xs">
            Required. JPEG, PNG, or WebP up to 5 MB. Ensure the number and photo are readable.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={uploadingPhoto || busy}
              onClick={() => fileInputRef.current?.click()}
              className="luxury-btn-sm luxury-btn-panel-outline"
            >
              {uploadingPhoto ? "Uploading…" : aadhaarPhotoUrl ? "Change photo" : "Upload Aadhaar photo"}
            </button>
            {aadhaarPhotoUrl ? (
              <a
                href={aadhaarPhotoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-panel-link text-sm hover:underline"
              >
                Preview uploaded photo
              </a>
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => void handlePhotoSelect(e)}
          />
        </div>

        <div>
          <label htmlFor="vip-address" className="eyebrow luxury-panel-label mb-2 block">
            Address
          </label>
          <textarea
            id="vip-address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Residential address"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={busy || uploadingPhoto}
          className="luxury-btn-sm luxury-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? "Submitting…" : "Submit application"}
        </button>

        {error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </form>
    </LuxuryCheckoutPanel>
  );
}
