import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckoutWizardConfirmRow,
  CheckoutWizardStepBody,
  CheckoutWizardStepFooter,
  CheckoutWizardStepHeader,
  CheckoutWizardStepper,
} from "@/components/booking/CheckoutWizardPrimitives";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import {
  canReapplyForVip,
  daysUntilVipReapply,
  formatVipReapplyDate,
  submitVipMembershipApplication,
} from "@/lib/api/vip-membership";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useAuthUser } from "@/lib/auth-user";
import {
  uploadVipAadhaarPhoto,
  uploadVipProfessionalCardPhoto,
} from "@/lib/vip-membership-photo-upload";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";
import { normalizeTenDigitPhone, sanitizeTenDigitPhoneInput, TEN_DIGIT_PHONE_INPUT_PROPS } from "@/lib/phone";

const STEPS = [
  { id: 1, label: "Contact" },
  { id: 2, label: "Documents" },
  { id: 3, label: "Social" },
] as const;

const inputClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";

type SocialPlatform = "instagram" | "facebook";

function PhotoUploadField({
  label,
  hint,
  photoUrl,
  uploading,
  disabled,
  onSelect,
}: {
  label: string;
  hint: string;
  photoUrl: string;
  uploading: boolean;
  disabled?: boolean;
  onSelect: (file: File) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="eyebrow luxury-panel-label mb-2 block">{label}</p>
      <p className="luxury-panel-body mb-3 text-xs">{hint}</p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={uploading || disabled}
          onClick={() => fileInputRef.current?.click()}
          className="luxury-btn-sm luxury-btn-panel-outline"
        >
          {uploading ? "Uploading…" : photoUrl ? "Change photo" : "Upload photo"}
        </button>
        {photoUrl ? (
          <a
            href={photoUrl}
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
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void onSelect(file);
        }}
      />
    </div>
  );
}

export function VipMembershipApplyForm() {
  const navigate = useNavigate();
  const {
    user,
    accessToken,
    displayName,
    profile,
    refreshVipMembershipStatus,
    vipMembershipStatus,
    vipMembershipRejectedAt,
  } = useAuthUser();
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(displayName ?? profile?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(() => sanitizeTenDigitPhoneInput(profile?.phone ?? ""));
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarPhotoUrl, setAadhaarPhotoUrl] = useState("");
  const [professionalCardPhotoUrl, setProfessionalCardPhotoUrl] = useState("");
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>("instagram");
  const [socialUsername, setSocialUsername] = useState("");
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);
  const [busy, setBusy] = useState(false);

  const validateStep = (currentStep: number): string | null => {
    if (currentStep === 1) {
      if (fullName.trim().length < 2) return "Enter your full name.";
      if (!email.trim()) return "Enter your email address.";
      if (phone.trim() && !normalizeTenDigitPhone(phone)) {
        return "Enter a valid 10-digit mobile number.";
      }
      if (description.trim().length < 20) return "About you must be at least 20 characters.";
      return null;
    }
    if (currentStep === 2) {
      if (!/^\d{12}$/.test(aadhaarNumber.replace(/\s/g, ""))) {
        return "Enter a valid 12-digit Aadhaar number.";
      }
      if (!aadhaarPhotoUrl) return "Upload a clear photo of your Aadhaar card.";
      if (!professionalCardPhotoUrl) return "Upload a photo of your business card.";
      return null;
    }
    if (currentStep === 3) {
      if (!socialUsername.trim()) {
        return `Enter your ${socialPlatform === "instagram" ? "Instagram" : "Facebook"} username.`;
      }
      return null;
    }
    return null;
  };

  const goNext = () => {
    const error = validateStep(step);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStep((current) => Math.min(current + 1, STEPS.length));
  };

  const goBack = () => {
    setStepError(null);
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleAadhaarUpload = async (file: File) => {
    setUploadingAadhaar(true);
    setStepError(null);
    try {
      setAadhaarPhotoUrl(await uploadVipAadhaarPhoto(file));
    } catch (err) {
      setStepError(toErrorMessage(err, "Failed to upload Aadhaar photo."));
    } finally {
      setUploadingAadhaar(false);
    }
  };

  const handleCardUpload = async (file: File) => {
    setUploadingCard(true);
    setStepError(null);
    try {
      setProfessionalCardPhotoUrl(await uploadVipProfessionalCardPhoto(file));
    } catch (err) {
      setStepError(toErrorMessage(err, "Failed to upload business card photo."));
    } finally {
      setUploadingCard(false);
    }
  };

  const handleSubmit = async () => {
    if (!accessToken) return;
    const error = validateStep(3);
    if (error) {
      setStepError(error);
      return;
    }

    const normalizedSocial = socialUsername.trim().replace(/^@/, "");

    setBusy(true);
    setStepError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      await submitVipMembershipApplication(accessToken, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: normalizeTenDigitPhone(phone) ?? undefined,
        address: address.trim() || undefined,
        idDocumentNumber: aadhaarNumber.replace(/\s/g, ""),
        idDocumentPhotoUrl: aadhaarPhotoUrl,
        description: description.trim(),
        professionalCardType: "business",
        professionalCardPhotoUrl,
        instagramUsername: socialPlatform === "instagram" ? normalizedSocial : undefined,
        facebookUsername: socialPlatform === "facebook" ? normalizedSocial : undefined,
      });
      await refreshVipMembershipStatus();
      void navigate({ to: "/account/profile" });
    } catch (err) {
      setStepError(toErrorMessage(err, "Failed to submit VIP membership application."));
    } finally {
      setBusy(false);
    }
  };

  if (!user || !accessToken) {
    return <PageLoadingGate />;
  }

  const reapplyBlocked =
    vipMembershipStatus === "rejected" &&
    !canReapplyForVip(vipMembershipStatus, vipMembershipRejectedAt);
  const reapplyDate = formatVipReapplyDate(vipMembershipRejectedAt);
  const daysRemaining = daysUntilVipReapply(vipMembershipRejectedAt);

  if (reapplyBlocked) {
    return (
      <LuxuryCheckoutPanel>
        <CheckoutWizardStepHeader
          title="Reapply later"
          description="Royal VIP applications can be submitted again 60 days after a rejection."
        />
        <CheckoutWizardStepBody>
          <p className="luxury-panel-body text-sm leading-relaxed">
            Your previous application was not approved. You may submit a new application on{" "}
            <strong>{reapplyDate ?? "a later date"}</strong>
            {daysRemaining ? ` (${daysRemaining} day(s) remaining).` : "."}
          </p>
        </CheckoutWizardStepBody>
        <CheckoutWizardStepFooter
          primary={{
            label: "Back to profile",
            onClick: () => void navigate({ to: "/account/profile" }),
            showArrow: false,
          }}
        />
      </LuxuryCheckoutPanel>
    );
  }

  const socialLabel = socialPlatform === "instagram" ? "Instagram" : "Facebook";
  const socialPlaceholder =
    socialPlatform === "instagram" ? "@username" : "username or profile name";

  return (
    <div className="space-y-6">
      <CheckoutWizardStepper steps={STEPS} currentStep={step} ariaLabel="VIP application progress" />

      {step === 1 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Contact & about you"
            description="Tell us how to reach you and share a short introduction for your Royal VIP application."
          />
          <CheckoutWizardStepBody>
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
                <label htmlFor="vip-phone" className="eyebrow luxury-panel-label mb-2 block">
                  Phone number
                </label>
                <input
                  id="vip-phone"
                  {...TEN_DIGIT_PHONE_INPUT_PROPS}
                  value={phone}
                  onChange={(e) => setPhone(sanitizeTenDigitPhoneInput(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
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
            </div>
            <div className="mt-4">
              <label htmlFor="vip-address" className="eyebrow luxury-panel-label mb-2 block">
                Address
              </label>
              <textarea
                id="vip-address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Residential or business address"
                className={inputClass}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="vip-description" className="eyebrow luxury-panel-label mb-2 block">
                About you
              </label>
              <textarea
                id="vip-description"
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Your background, interests, or why you are applying for VIP access…"
                className={inputClass}
              />
              <p className="luxury-panel-body mt-2 text-xs">{description.trim().length}/20 characters minimum</p>
            </div>
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter primary={{ label: "Continue", onClick: goNext }} />
        </LuxuryCheckoutPanel>
      ) : null}

      {step === 2 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Identity documents"
            description="Upload your Aadhaar verification and business card for Royal VIP identity checks."
          />
          <CheckoutWizardStepBody>
            <div className="mb-6">
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
            <PhotoUploadField
              label="Aadhaar card photo"
              hint="Required. JPEG, PNG, or WebP up to 5 MB. Ensure the number and photo are readable."
              photoUrl={aadhaarPhotoUrl}
              uploading={uploadingAadhaar}
              disabled={busy}
              onSelect={handleAadhaarUpload}
            />
            <div className="mt-6 border-t border-[rgb(74_0_0/0.12)] pt-6">
              <PhotoUploadField
                label="Business card photo"
                hint="Required. Upload a clear photo of your business card (JPEG, PNG, or WebP up to 5 MB)."
                photoUrl={professionalCardPhotoUrl}
                uploading={uploadingCard}
                disabled={busy}
                onSelect={handleCardUpload}
              />
            </div>
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            back={{ label: "Back", onClick: goBack }}
            primary={{
              label: "Continue",
              onClick: goNext,
              disabled: uploadingAadhaar || uploadingCard,
            }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      {step === 3 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Social account"
            description="Share one public profile so our concierge can verify you."
          />
          <CheckoutWizardStepBody>
            <div
              className="mb-4 inline-flex rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.35)] p-1"
              role="tablist"
              aria-label="Social platform"
            >
              <button
                type="button"
                role="tab"
                aria-selected={socialPlatform === "instagram"}
                className={`rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
                  socialPlatform === "instagram"
                    ? "bg-[#4A0000] text-[#f2e4c4]"
                    : "text-[rgb(58_0_0/0.65)] hover:text-[#4A0000]"
                }`}
                onClick={() => {
                  setSocialPlatform("instagram");
                  setStepError(null);
                }}
              >
                Instagram
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={socialPlatform === "facebook"}
                className={`rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
                  socialPlatform === "facebook"
                    ? "bg-[#4A0000] text-[#f2e4c4]"
                    : "text-[rgb(58_0_0/0.65)] hover:text-[#4A0000]"
                }`}
                onClick={() => {
                  setSocialPlatform("facebook");
                  setStepError(null);
                }}
              >
                Facebook
              </button>
            </div>
            <label htmlFor="vip-social-username" className="eyebrow luxury-panel-label mb-2 block">
              {socialLabel} username
            </label>
            <input
              id="vip-social-username"
              value={socialUsername}
              onChange={(e) => setSocialUsername(e.target.value)}
              placeholder={socialPlaceholder}
              className={inputClass}
            />

            <div className="mt-8 border-t border-[rgb(74_0_0/0.12)] pt-6">
              <p className="eyebrow luxury-panel-label mb-3 block">Review</p>
              <dl className="space-y-3 text-sm">
                <CheckoutWizardConfirmRow label="Full name" value={fullName} />
                <CheckoutWizardConfirmRow label="Email" value={email} />
                {phone ? <CheckoutWizardConfirmRow label="Phone" value={phone} /> : null}
                {address ? <CheckoutWizardConfirmRow label="Address" value={address} /> : null}
                <CheckoutWizardConfirmRow label="About you" value={description} />
                <CheckoutWizardConfirmRow label="Aadhaar" value="•••• •••• ••••" />
                <CheckoutWizardConfirmRow label="Business card" value="Uploaded" />
                <CheckoutWizardConfirmRow
                  label={socialLabel}
                  value={
                    socialPlatform === "instagram"
                      ? `@${socialUsername.replace(/^@/, "")}`
                      : socialUsername
                  }
                />
              </dl>
            </div>
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            back={{ label: "Back", onClick: goBack }}
            primary={{
              label: busy ? "Submitting…" : "Submit application",
              onClick: () => void handleSubmit(),
              disabled: busy || uploadingAadhaar || uploadingCard,
              showArrow: false,
            }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      {stepError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {stepError}
        </p>
      ) : null}
    </div>
  );
}
