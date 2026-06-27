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

const STEPS = [
  { id: 1, label: "Contact" },
  { id: 2, label: "About you" },
  { id: 3, label: "Aadhaar" },
  { id: 4, label: "Business card" },
  { id: 5, label: "Social" },
  { id: 6, label: "Review" },
] as const;

const inputClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";

type ProfessionalCardType = "business" | "visitor";

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
  const { user, accessToken, displayName, profile, refreshVipMembershipStatus, vipMembershipStatus, vipMembershipRejectedAt } = useAuthUser();
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(displayName ?? profile?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarPhotoUrl, setAadhaarPhotoUrl] = useState("");
  const [professionalCardType, setProfessionalCardType] = useState<ProfessionalCardType>("business");
  const [professionalCardPhotoUrl, setProfessionalCardPhotoUrl] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [facebookUsername, setFacebookUsername] = useState("");
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);
  const [busy, setBusy] = useState(false);

  const validateStep = (currentStep: number): string | null => {
    if (currentStep === 1) {
      if (fullName.trim().length < 2) return "Enter your full name.";
      if (!email.trim()) return "Enter your email address.";
      return null;
    }
    if (currentStep === 2) {
      if (description.trim().length < 20) return "Description must be at least 20 characters.";
      return null;
    }
    if (currentStep === 3) {
      if (!/^\d{12}$/.test(aadhaarNumber.replace(/\s/g, ""))) {
        return "Enter a valid 12-digit Aadhaar number.";
      }
      if (!aadhaarPhotoUrl) return "Upload a clear photo of your Aadhaar card.";
      return null;
    }
    if (currentStep === 4) {
      if (!professionalCardPhotoUrl) {
        return `Upload a photo of your ${professionalCardType === "business" ? "business" : "visitor"} card.`;
      }
      return null;
    }
    if (currentStep === 5) {
      if (!instagramUsername.trim() && !facebookUsername.trim()) {
        return "Provide at least one Instagram or Facebook username.";
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
      setStepError(toErrorMessage(err, "Failed to upload card photo."));
    } finally {
      setUploadingCard(false);
    }
  };

  const handleSubmit = async () => {
    if (!accessToken) return;
    const error = validateStep(5);
    if (error) {
      setStepError(error);
      return;
    }

    setBusy(true);
    setStepError(null);
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
        description: description.trim(),
        professionalCardType,
        professionalCardPhotoUrl,
        instagramUsername: instagramUsername.trim().replace(/^@/, "") || undefined,
        facebookUsername: facebookUsername.trim().replace(/^@/, "") || undefined,
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

  const cardLabel = professionalCardType === "business" ? "Business card" : "Visitor card";

  return (
    <div className="space-y-6">
      <CheckoutWizardStepper steps={STEPS} currentStep={step} ariaLabel="VIP application progress" />

      {step === 1 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Contact details"
            description="Tell us how our Royal VIP concierge can reach you."
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
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            primary={{ label: "Continue", onClick: goNext }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      {step === 2 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="About you"
            description="Share a short introduction — your background, interests, or why you are applying for VIP access."
          />
          <CheckoutWizardStepBody>
            <label htmlFor="vip-description" className="eyebrow luxury-panel-label mb-2 block">
              Description
            </label>
            <textarea
              id="vip-description"
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about yourself or your business…"
              className={inputClass}
            />
            <p className="luxury-panel-body mt-2 text-xs">{description.trim().length}/20 characters minimum</p>
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            back={{ label: "Back", onClick: goBack }}
            primary={{ label: "Continue", onClick: goNext }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      {step === 3 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Aadhaar verification"
            description="Aadhaar is required for Royal VIP identity verification. Upload a clear photo and enter your 12-digit number."
          />
          <CheckoutWizardStepBody>
            <div className="mb-4">
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
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            back={{ label: "Back", onClick: goBack }}
            primary={{
              label: "Continue",
              onClick: goNext,
              disabled: uploadingAadhaar,
            }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      {step === 4 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Business or visitor card"
            description="Upload a photo of your business card or visitor card so our concierge can verify your profile."
          />
          <CheckoutWizardStepBody>
            <fieldset className="mb-4">
              <legend className="eyebrow luxury-panel-label mb-3 block">Card type</legend>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm luxury-panel-body">
                  <input
                    type="radio"
                    name="professional-card-type"
                    checked={professionalCardType === "business"}
                    onChange={() => setProfessionalCardType("business")}
                  />
                  Business card
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm luxury-panel-body">
                  <input
                    type="radio"
                    name="professional-card-type"
                    checked={professionalCardType === "visitor"}
                    onChange={() => setProfessionalCardType("visitor")}
                  />
                  Visitor card
                </label>
              </div>
            </fieldset>
            <PhotoUploadField
              label={`${cardLabel} photo`}
              hint="Required. JPEG, PNG, or WebP up to 5 MB."
              photoUrl={professionalCardPhotoUrl}
              uploading={uploadingCard}
              disabled={busy}
              onSelect={handleCardUpload}
            />
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            back={{ label: "Back", onClick: goBack }}
            primary={{
              label: "Continue",
              onClick: goNext,
              disabled: uploadingCard,
            }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      {step === 5 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Social profiles"
            description="Share at least one Instagram or Facebook username so we can verify your public profile."
          />
          <CheckoutWizardStepBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vip-instagram" className="eyebrow luxury-panel-label mb-2 block">
                  Instagram username
                </label>
                <input
                  id="vip-instagram"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  placeholder="@username"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="vip-facebook" className="eyebrow luxury-panel-label mb-2 block">
                  Facebook username
                </label>
                <input
                  id="vip-facebook"
                  value={facebookUsername}
                  onChange={(e) => setFacebookUsername(e.target.value)}
                  placeholder="username or profile name"
                  className={inputClass}
                />
              </div>
            </div>
          </CheckoutWizardStepBody>
          <CheckoutWizardStepFooter
            back={{ label: "Back", onClick: goBack }}
            primary={{ label: "Review application", onClick: goNext }}
          />
        </LuxuryCheckoutPanel>
      ) : null}

      {step === 6 ? (
        <LuxuryCheckoutPanel>
          <CheckoutWizardStepHeader
            title="Review your application"
            description="Check everything below, then submit for Royal VIP concierge review."
          />
          <CheckoutWizardStepBody>
            <dl className="space-y-4 text-sm">
              <CheckoutWizardConfirmRow label="Full name" value={fullName} />
              <CheckoutWizardConfirmRow label="Email" value={email} />
              {phone ? <CheckoutWizardConfirmRow label="Phone" value={phone} /> : null}
              {address ? <CheckoutWizardConfirmRow label="Address" value={address} /> : null}
              <CheckoutWizardConfirmRow label="Description" value={description} />
              <CheckoutWizardConfirmRow label="Aadhaar" value="•••• •••• ••••" />
              <CheckoutWizardConfirmRow label="Card type" value={cardLabel} />
              {instagramUsername ? (
                <CheckoutWizardConfirmRow label="Instagram" value={`@${instagramUsername.replace(/^@/, "")}`} />
              ) : null}
              {facebookUsername ? (
                <CheckoutWizardConfirmRow label="Facebook" value={facebookUsername} />
              ) : null}
            </dl>
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
