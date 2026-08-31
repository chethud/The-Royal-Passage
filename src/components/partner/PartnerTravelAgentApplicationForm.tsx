import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { toErrorMessage } from "@/lib/api/client";
import { validateExperiencePhotoFile } from "@/lib/experience-photo-upload";
import { uploadPartnerExperiencePhoto } from "@/lib/partner-experience-fns";
import { submitPartnerTravelAgentApplication } from "@/lib/partner-travel-agent-fns";
import { normalizeTenDigitPhone, sanitizeTenDigitPhoneInput, TEN_DIGIT_PHONE_INPUT_PROPS } from "@/lib/phone";

const inputClass =
  "mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-3 py-2 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read photo."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Failed to read photo."));
    reader.readAsDataURL(file);
  });
}

async function uploadPartnerFiles(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const validationError = validateExperiencePhotoFile(file);
    if (validationError) throw new Error(validationError);
    const base64 = await fileToBase64(file);
    const { url } = await uploadPartnerExperiencePhoto({
      data: {
        fileName: file.name,
        contentType: file.type,
        base64,
      },
    });
    urls.push(url);
  }
  return urls;
}

export function PartnerTravelAgentApplicationForm() {
  const passportInputRef = useRef<HTMLInputElement>(null);
  const gstInputRef = useRef<HTMLInputElement>(null);
  const registrationInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Mysuru");
  const [bio, setBio] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [passportPhotoUrl, setPassportPhotoUrl] = useState("");
  const [gstCertificateUrl, setGstCertificateUrl] = useState("");
  const [companyRegistrationUrl, setCompanyRegistrationUrl] = useState("");
  const [uploadingPassport, setUploadingPassport] = useState(false);
  const [uploadingGst, setUploadingGst] = useState(false);
  const [uploadingRegistration, setUploadingRegistration] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const uploadOne = async (file: File) => {
    const [url] = await uploadPartnerFiles([file]);
    return url;
  };

  const handlePassportSelect = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploadingPassport(true);
    try {
      setPassportPhotoUrl(await uploadOne(file));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to upload passport photo."));
    } finally {
      setUploadingPassport(false);
      if (passportInputRef.current) passportInputRef.current.value = "";
    }
  };

  const handleGstSelect = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploadingGst(true);
    try {
      setGstCertificateUrl(await uploadOne(file));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to upload GST certificate."));
    } finally {
      setUploadingGst(false);
      if (gstInputRef.current) gstInputRef.current.value = "";
    }
  };

  const handleRegistrationSelect = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploadingRegistration(true);
    try {
      setCompanyRegistrationUrl(await uploadOne(file));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to upload company registration."));
    } finally {
      setUploadingRegistration(false);
      if (registrationInputRef.current) registrationInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const normalizedPhone = normalizeTenDigitPhone(phone);
      if (!normalizedPhone) {
        throw new Error("Enter a valid 10-digit mobile number.");
      }
      if (!passportPhotoUrl) {
        throw new Error("Upload a passport-size photo of the contact person.");
      }
      await submitPartnerTravelAgentApplication({
        data: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: normalizedPhone,
          bio: bio.trim() || undefined,
          city: city.trim(),
          companyName: companyName.trim(),
          companyAddress: companyAddress.trim(),
          gstNumber: gstNumber.trim().toUpperCase(),
          panNumber: panNumber.trim().toUpperCase(),
          passportPhotoUrl,
          gstCertificateUrl: gstCertificateUrl || undefined,
          companyRegistrationUrl: companyRegistrationUrl || undefined,
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to submit application."));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <LuxuryCheckoutPanel>
        <h1 className="font-display text-3xl luxury-panel-heading">Application received</h1>
        <p className="mt-3 text-sm luxury-panel-body">
          Thank you. Our team will review your company details and GST documents. If approved, you
          will receive login credentials by email with your negotiated discount rate.
        </p>
        <Link to="/" className="luxury-btn mt-6 inline-flex no-underline">
          Back to home
        </Link>
      </LuxuryCheckoutPanel>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      <LuxuryCheckoutPanel>
        <p className="eyebrow luxury-panel-label">Partner with us</p>
        <h1 className="font-display text-3xl luxury-panel-heading sm:text-4xl">Travel agent application</h1>
        <p className="mt-3 max-w-2xl text-sm luxury-panel-body">
          Apply to book Royal Passage experiences and homestays on behalf of your clients. Share your
          company GST details and KYC documents for admin review.
        </p>
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel>
        <h2 className="font-display text-xl luxury-panel-heading">Contact person</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">Full name</span>
            <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">Email</span>
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">Phone</span>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(sanitizeTenDigitPhoneInput(e.target.value))}
              {...TEN_DIGIT_PHONE_INPUT_PROPS}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">City</span>
            <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">About your agency</span>
            <textarea className={`${inputClass} min-h-[96px]`} value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>
        </div>
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel>
        <h2 className="font-display text-xl luxury-panel-heading">Company & GST</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">Company name</span>
            <input className={inputClass} value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">Registered address</span>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">GSTIN</span>
            <input
              className={inputClass}
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] luxury-panel-label">PAN</span>
            <input
              className={inputClass}
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              required
            />
          </label>
        </div>
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel>
        <h2 className="font-display text-xl luxury-panel-heading">Documents</h2>
        <div className="mt-4 space-y-6">
          <div className="text-sm">
            <p className="eyebrow luxury-panel-label mb-2">Passport photo (contact person)</p>
            <input
              ref={passportInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => void handlePassportSelect(e.target.files?.[0] ?? null)}
            />
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="luxury-btn-sm dashboard-chrome-btn"
                disabled={uploadingPassport}
                onClick={() => passportInputRef.current?.click()}
              >
                {uploadingPassport ? "Uploading…" : passportPhotoUrl ? "Replace photo" : "Upload photo"}
              </button>
              {passportPhotoUrl ? (
                <img
                  src={passportPhotoUrl}
                  alt="Passport photo preview"
                  className="h-20 w-16 rounded-sm border border-[rgb(74_0_0/0.15)] object-cover"
                />
              ) : null}
            </div>
            {passportPhotoUrl ? (
              <p className="luxury-panel-body mt-2 text-xs">Photo uploaded.</p>
            ) : (
              <p className="luxury-panel-body mt-2 text-xs">Required — passport-size photo of the contact person.</p>
            )}
          </div>

          <div className="text-sm">
            <p className="eyebrow luxury-panel-label mb-2">GST certificate (optional)</p>
            <input
              ref={gstInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              className="sr-only"
              onChange={(e) => void handleGstSelect(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="luxury-btn-sm dashboard-chrome-btn"
              disabled={uploadingGst}
              onClick={() => gstInputRef.current?.click()}
            >
              {uploadingGst ? "Uploading…" : gstCertificateUrl ? "Replace GST certificate" : "Upload GST certificate"}
            </button>
            {gstCertificateUrl ? (
              <p className="luxury-panel-body mt-2 text-xs">GST certificate uploaded.</p>
            ) : (
              <p className="luxury-panel-body mt-2 text-xs">Optional — JPEG, PNG, or PDF.</p>
            )}
          </div>

          <div className="text-sm">
            <p className="eyebrow luxury-panel-label mb-2">Company registration (optional)</p>
            <input
              ref={registrationInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              className="sr-only"
              onChange={(e) => void handleRegistrationSelect(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="luxury-btn-sm dashboard-chrome-btn"
              disabled={uploadingRegistration}
              onClick={() => registrationInputRef.current?.click()}
            >
              {uploadingRegistration
                ? "Uploading…"
                : companyRegistrationUrl
                  ? "Replace registration"
                  : "Upload registration"}
            </button>
            {companyRegistrationUrl ? (
              <p className="luxury-panel-body mt-2 text-xs">Company registration uploaded.</p>
            ) : (
              <p className="luxury-panel-body mt-2 text-xs">Optional — registration or incorporation document.</p>
            )}
          </div>
        </div>
      </LuxuryCheckoutPanel>

      {error ? (
        <LuxuryCheckoutPanel>
          <p className="text-sm text-red-700">{error}</p>
        </LuxuryCheckoutPanel>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="luxury-btn"
          disabled={submitting || uploadingPassport || uploadingGst || uploadingRegistration}
        >
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
