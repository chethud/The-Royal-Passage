import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { ExperiencePhotoGallery } from "@/components/experience/ExperiencePhotoGallery";
import { RupeeAmountInput } from "@/components/host/RupeeAmountInput";
import { toErrorMessage } from "@/lib/api/client";
import { FALLBACK_CATEGORIES } from "@/lib/experience-categories";
import { validateExperiencePhotoFile } from "@/lib/experience-photo-upload";
import {
  submitPartnerExperienceApplication,
  uploadPartnerExperiencePhoto,
} from "@/lib/partner-experience-fns";

const inputClass =
  "mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-3 py-2 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";
const numberInputClass = `${inputClass} input-no-spin`;

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

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

async function uploadPartnerPhotos(files: File[]): Promise<string[]> {
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

export function PartnerExperienceApplicationForm() {
  const passportInputRef = useRef<HTMLInputElement>(null);
  const tradeLicenseInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [applicantCity, setApplicantCity] = useState("Mysuru");
  const [bio, setBio] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [passportPhotoUrl, setPassportPhotoUrl] = useState("");
  const [tradeLicenseUrl, setTradeLicenseUrl] = useState("");
  const [uploadingPassport, setUploadingPassport] = useState(false);
  const [uploadingTradeLicense, setUploadingTradeLicense] = useState(false);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState(FALLBACK_CATEGORIES[0]?.slug ?? "cultural_heritage");
  const [region, setRegion] = useState("Karnataka");
  const [address, setAddress] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [priceMajor, setPriceMajor] = useState(0);
  const [minGuests, setMinGuests] = useState(1);
  const [maxGuests, setMaxGuests] = useState(10);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [requirements, setRequirements] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const uploadOne = async (file: File) => {
    const [url] = await uploadPartnerPhotos([file]);
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

  const handleTradeLicenseSelect = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploadingTradeLicense(true);
    try {
      setTradeLicenseUrl(await uploadOne(file));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to upload trade licence."));
    } finally {
      setUploadingTradeLicense(false);
      if (tradeLicenseInputRef.current) tradeLicenseInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (priceMajor <= 0) {
      setError("Please enter a price per person.");
      return;
    }
    if (maxGuests < minGuests) {
      setError("Maximum guests must be at least the minimum.");
      return;
    }
    if (!passportPhotoUrl.trim()) {
      setError("Upload a passport-size photo.");
      return;
    }
    if (!tradeLicenseUrl.trim()) {
      setError("Upload your trade licence.");
      return;
    }

    const galleryUrls = photoUrls.map((url) => url.trim()).filter(Boolean);

    setSubmitting(true);
    try {
      await submitPartnerExperienceApplication({
        data: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          bio: bio.trim() || undefined,
          city: applicantCity.trim(),
          panNumber: panNumber.trim().toUpperCase(),
          passportPhotoUrl: passportPhotoUrl.trim(),
          tradeLicenseUrl: tradeLicenseUrl.trim(),
          title: title.trim(),
          tagline: tagline.trim() || undefined,
          description: description.trim(),
          categorySlug,
          region: region.trim() || undefined,
          address: address.trim(),
          mapLink: mapLink.trim() || undefined,
          durationMinutes,
          pricePerPersonMinor: priceMajor * 100,
          minGuests,
          maxGuests,
          heroImageUrl: galleryUrls[0],
          galleryUrls,
          inclusions: splitLines(inclusions),
          exclusions: splitLines(exclusions),
          requirements: splitLines(requirements),
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError(toErrorMessage(err, "Could not submit your application. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <LuxuryCheckoutPanel>
        <p className="eyebrow luxury-panel-label mb-3">Application received</p>
        <h2 className="font-display text-3xl luxury-panel-heading sm:text-4xl">Thank you.</h2>
        <p className="luxury-panel-body mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
          Your partner application is with our team. We’ll review the experience details and
          follow up by email if we’d like to take the next step.
        </p>
        <Link
          to="/experiences"
          className="luxury-btn luxury-btn-primary mt-8 inline-flex no-underline"
        >
          Browse experiences
        </Link>
      </LuxuryCheckoutPanel>
    );
  }

  return (
    <LuxuryCheckoutPanel>
      <p className="eyebrow luxury-panel-label mb-3">Partner with us</p>
      <h1 className="font-display text-3xl luxury-panel-heading sm:text-4xl">
        Become an experience host
      </h1>
      <p className="luxury-panel-body mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
        Share your details and the full experience listing — the same information hosts fill in when
        creating an experience. Our team will review and follow up if it’s a fit.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="space-y-5 rounded-md border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.35)] p-5 sm:p-6">
          <h2 className="font-display text-xl luxury-panel-heading">Your details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              <span className="eyebrow luxury-panel-label">Full name</span>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                autoComplete="name"
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Phone</span>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                autoComplete="tel"
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Your city</span>
              <input
                required
                value={applicantCity}
                onChange={(e) => setApplicantCity(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">PAN</span>
              <input
                required
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                className={inputClass}
                placeholder="ABCDE1234F"
                maxLength={10}
                autoComplete="off"
              />
            </label>
            <div className="text-sm sm:col-span-2">
              <p className="eyebrow luxury-panel-label mb-2">Passport-size photo</p>
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
                  {uploadingPassport ? "Uploading…" : "Upload passport photo"}
                </button>
                {passportPhotoUrl ? (
                  <img
                    src={passportPhotoUrl}
                    alt="Passport photo"
                    className="h-20 w-16 rounded-sm border border-[rgb(74_0_0/0.15)] object-cover"
                  />
                ) : null}
              </div>
            </div>
            <div className="text-sm sm:col-span-2">
              <p className="eyebrow luxury-panel-label mb-2">Trade licence</p>
              <input
                ref={tradeLicenseInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => void handleTradeLicenseSelect(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="luxury-btn-sm dashboard-chrome-btn"
                disabled={uploadingTradeLicense}
                onClick={() => tradeLicenseInputRef.current?.click()}
              >
                {uploadingTradeLicense ? "Uploading…" : "Upload trade licence"}
              </button>
              {tradeLicenseUrl ? (
                <p className="luxury-panel-body mt-2 text-xs">Trade licence uploaded.</p>
              ) : (
                <p className="luxury-panel-body mt-2 text-xs">Required — your trade licence document.</p>
              )}
            </div>
            <label className="text-sm sm:col-span-2">
              <span className="eyebrow luxury-panel-label">Short bio (optional)</span>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={inputClass}
                placeholder="A few lines about you as a host or craftsperson."
              />
            </label>
          </div>
        </section>

        <section className="space-y-5 rounded-md border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.35)] p-5 sm:p-6">
          <h2 className="font-display text-xl luxury-panel-heading">Basics</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              <span className="eyebrow luxury-panel-label">Title</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Category</span>
              <select
                required
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className={inputClass}
              >
                {FALLBACK_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="eyebrow luxury-panel-label">Tagline</span>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="eyebrow luxury-panel-label">Description</span>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className="space-y-5 rounded-md border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.35)] p-5 sm:p-6">
          <h2 className="font-display text-xl luxury-panel-heading">Location & pricing</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">City</span>
              <input
                readOnly
                value="Mysuru"
                className={`${inputClass} bg-[rgb(74_0_0/0.06)] text-[rgb(58_0_0/0.65)]`}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Region</span>
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="eyebrow luxury-panel-label">Address</span>
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="eyebrow luxury-panel-label">Map link</span>
              <input
                type="url"
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                placeholder="https://maps.google.com/..."
                className={inputClass}
              />
              <span className="mt-1 block text-xs luxury-panel-body opacity-80">
                Google Maps or Apple Maps link so guests can get directions.
              </span>
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Duration (minutes)</span>
              <input
                required
                type="number"
                min={30}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className={numberInputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Price per person (₹)</span>
              <RupeeAmountInput
                value={priceMajor}
                onChange={setPriceMajor}
                className={inputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Min guests / booking</span>
              <input
                required
                type="number"
                min={1}
                max={50}
                value={minGuests}
                onChange={(e) => setMinGuests(Number(e.target.value))}
                className={numberInputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Max guests / booking</span>
              <input
                required
                type="number"
                min={1}
                max={50}
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className={numberInputClass}
              />
            </label>
          </div>
        </section>

        <section className="space-y-5 rounded-md border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.35)] p-5 sm:p-6">
          <h2 className="font-display text-xl luxury-panel-heading">Photos</h2>
          <p className="text-sm luxury-panel-body">
            Upload multiple images. The first photo is the cover; guests can browse all photos on the
            experience page.
          </p>
          <ExperiencePhotoGallery
            photoUrls={photoUrls}
            onChange={setPhotoUrls}
            uploadFiles={uploadPartnerPhotos}
            uploadRequiresAuthHint={false}
            inputClass={inputClass}
            label=""
            hint=""
          />
        </section>

        <section className="space-y-5 rounded-md border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.35)] p-5 sm:p-6">
          <h2 className="font-display text-xl luxury-panel-heading">Details</h2>
          <label className="block text-sm">
            <span className="eyebrow luxury-panel-label">Inclusions (one per line)</span>
            <textarea
              rows={4}
              value={inclusions}
              onChange={(e) => setInclusions(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="eyebrow luxury-panel-label">Exclusions (one per line)</span>
            <textarea
              rows={3}
              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="eyebrow luxury-panel-label">Requirements (one per line)</span>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className={inputClass}
            />
          </label>
        </section>

        {error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || uploadingPassport || uploadingTradeLicense}
          className="luxury-btn luxury-btn-primary disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </LuxuryCheckoutPanel>
  );
}
