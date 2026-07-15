import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { ExperiencePhotoGallery } from "@/components/experience/ExperiencePhotoGallery";
import { RupeeAmountInput } from "@/components/host/RupeeAmountInput";
import { HOMESTAY_PROPERTY_TYPES } from "@/lib/api/owner-homestays";
import { toErrorMessage } from "@/lib/api/client";
import { validateExperiencePhotoFile } from "@/lib/experience-photo-upload";
import { uploadPartnerExperiencePhoto } from "@/lib/partner-experience-fns";
import { submitPartnerHomestayApplication } from "@/lib/partner-homestay-fns";

const inputClass =
  "mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-3 py-2 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";
const numberInputClass = `${inputClass} input-no-spin`;
const sectionClass =
  "space-y-5 rounded-md border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.35)] p-5 sm:p-6";

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
        reject(new Error("Failed to read file."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
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

export function PartnerHomestayApplicationForm() {
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [applicantCity, setApplicantCity] = useState("Mysuru");
  const [bio, setBio] = useState("");
  const [fssaiId, setFssaiId] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [passportPhotoUrl, setPassportPhotoUrl] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [uploadingPassport, setUploadingPassport] = useState(false);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] =
    useState<(typeof HOMESTAY_PROPERTY_TYPES)[number]>("Home Stay");
  const [region, setRegion] = useState("Karnataka");
  const [address, setAddress] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [priceMajor, setPriceMajor] = useState(0);
  const [weekendPriceMajor, setWeekendPriceMajor] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [amenities, setAmenities] = useState("");
  const [houseRules, setHouseRules] = useState("");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [maxGuests, setMaxGuests] = useState(2);
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [extraBedAvailable, setExtraBedAvailable] = useState(false);
  const [extraBedPriceMajor, setExtraBedPriceMajor] = useState(0);
  const [extraBedWeekendPriceMajor, setExtraBedWeekendPriceMajor] = useState(0);
  const [extraBedsPerRoom, setExtraBedsPerRoom] = useState<1 | 2>(1);
  const [licenseCertificateUrl, setLicenseCertificateUrl] = useState("");
  const [uploadingLicense, setUploadingLicense] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const effectiveWeekend = weekendPriceMajor || priceMajor;
  const needsGst = priceMajor > 8000 || effectiveWeekend > 8000;

  const handleLicenseSelect = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploadingLicense(true);
    try {
      const [url] = await uploadPartnerFiles([file]);
      setLicenseCertificateUrl(url);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to upload homestay license."));
    } finally {
      setUploadingLicense(false);
      if (licenseInputRef.current) licenseInputRef.current.value = "";
    }
  };

  const handlePassportSelect = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploadingPassport(true);
    try {
      const [url] = await uploadPartnerFiles([file]);
      setPassportPhotoUrl(url);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to upload passport photo."));
    } finally {
      setUploadingPassport(false);
      if (passportInputRef.current) passportInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (priceMajor <= 0) {
      setError("Please enter a weekday price per room per day.");
      return;
    }
    if (!licenseCertificateUrl.trim()) {
      setError("Upload your homestay license.");
      return;
    }
    if (!passportPhotoUrl.trim()) {
      setError("Upload a passport-size photo.");
      return;
    }
    if (needsGst && !gstNumber.trim()) {
      setError("GST number is required when price per room per day is above ₹8,000.");
      return;
    }

    const galleryUrls = photoUrls.map((url) => url.trim()).filter(Boolean);

    setSubmitting(true);
    try {
      await submitPartnerHomestayApplication({
        data: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          bio: bio.trim() || undefined,
          city: applicantCity.trim(),
          fssaiId: fssaiId.trim(),
          panNumber: panNumber.trim().toUpperCase(),
          passportPhotoUrl: passportPhotoUrl.trim(),
          gstNumber: needsGst ? gstNumber.trim().toUpperCase() : undefined,
          title: title.trim(),
          tagline: tagline.trim() || undefined,
          description: description.trim(),
          propertyType,
          region: region.trim() || undefined,
          address: address.trim(),
          mapLink: mapLink.trim() || undefined,
          pricePerNightMinor: priceMajor * 100,
          weekendPricePerNightMinor: effectiveWeekend * 100,
          heroImageUrl: galleryUrls[0],
          galleryUrls,
          amenities: splitLines(amenities),
          houseRules: splitLines(houseRules),
          bedrooms,
          bathrooms,
          maxGuests,
          checkInTime,
          checkOutTime,
          extraBedAvailable,
          extraBedPricePerNightMinor: extraBedAvailable ? extraBedPriceMajor * 100 : 0,
          weekendExtraBedPricePerNightMinor: extraBedAvailable
            ? extraBedWeekendPriceMajor * 100
            : 0,
          extraBedsPerRoom: extraBedAvailable ? extraBedsPerRoom : 1,
          licenseCertificateUrl: licenseCertificateUrl.trim(),
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
          Your property application is with our team. We’ll review the details and follow up by
          email if we’d like to take the next step.
        </p>
        <Link
          to="/homestays/browse"
          className="luxury-btn luxury-btn-primary mt-8 inline-flex no-underline"
        >
          Browse homestays
        </Link>
      </LuxuryCheckoutPanel>
    );
  }

  return (
    <LuxuryCheckoutPanel>
      <p className="eyebrow luxury-panel-label mb-3">List your property</p>
      <h1 className="font-display text-3xl luxury-panel-heading sm:text-4xl">
        Become a Homestay Host
      </h1>
      <p className="luxury-panel-body mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
        Share your details and full property listing — the same information owners fill in when
        creating a homestay. Our team will review and follow up if it’s a fit.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className={sectionClass}>
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
              <span className="eyebrow luxury-panel-label">FSSAI ID</span>
              <input
                required
                value={fssaiId}
                onChange={(e) => setFssaiId(e.target.value)}
                className={inputClass}
                placeholder="Food licence / FSSAI number"
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
              <p className="eyebrow luxury-panel-label mb-2">Homestay license</p>
              <input
                ref={licenseInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => void handleLicenseSelect(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="luxury-btn-sm dashboard-chrome-btn"
                disabled={uploadingLicense}
                onClick={() => licenseInputRef.current?.click()}
              >
                {uploadingLicense ? "Uploading…" : "Upload homestay license"}
              </button>
              {licenseCertificateUrl ? (
                <p className="luxury-panel-body mt-2 text-xs">License uploaded.</p>
              ) : (
                <p className="luxury-panel-body mt-2 text-xs">Required — property registration / license document.</p>
              )}
            </div>
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
            <label className="text-sm sm:col-span-2">
              <span className="eyebrow luxury-panel-label">Short bio (optional)</span>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-xl luxury-panel-heading">Property details</h2>
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
              <span className="eyebrow luxury-panel-label">Property type</span>
              <select
                required
                value={propertyType}
                onChange={(e) =>
                  setPropertyType(e.target.value as (typeof HOMESTAY_PROPERTY_TYPES)[number])
                }
                className={inputClass}
              >
                {HOMESTAY_PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
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

        <section className={sectionClass}>
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
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Weekday price / room / day (₹)</span>
              <RupeeAmountInput
                value={priceMajor}
                onChange={setPriceMajor}
                className={inputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Weekend price / room / day (₹)</span>
              <RupeeAmountInput
                value={weekendPriceMajor}
                onChange={setWeekendPriceMajor}
                className={inputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Bedrooms</span>
              <input
                type="number"
                min={1}
                max={50}
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value) || 1)}
                className={numberInputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Bathrooms</span>
              <input
                type="number"
                min={1}
                max={50}
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value) || 1)}
                className={numberInputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Max guests</span>
              <input
                type="number"
                min={1}
                max={100}
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value) || 2)}
                className={numberInputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Check-in</span>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Check-out</span>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2 mt-2">
              <input
                type="checkbox"
                checked={extraBedAvailable}
                onChange={(e) => setExtraBedAvailable(e.target.checked)}
              />
              Extra bed available
            </label>
            {extraBedAvailable ? (
              <>
                <label className="text-sm">
                  <span className="eyebrow luxury-panel-label">Extra bed weekday (₹)</span>
                  <RupeeAmountInput
                    value={extraBedPriceMajor}
                    onChange={setExtraBedPriceMajor}
                    className={inputClass}
                  />
                </label>
                <label className="text-sm">
                  <span className="eyebrow luxury-panel-label">Extra bed weekend (₹)</span>
                  <RupeeAmountInput
                    value={extraBedWeekendPriceMajor}
                    onChange={setExtraBedWeekendPriceMajor}
                    className={inputClass}
                  />
                </label>
                <label className="text-sm">
                  <span className="eyebrow luxury-panel-label">Extra beds / room</span>
                  <select
                    value={extraBedsPerRoom}
                    onChange={(e) => setExtraBedsPerRoom(Number(e.target.value) === 2 ? 2 : 1)}
                    className={inputClass}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </label>
              </>
            ) : null}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-xl luxury-panel-heading">Photos</h2>
          <ExperiencePhotoGallery
            photoUrls={photoUrls}
            onChange={setPhotoUrls}
            uploadFiles={uploadPartnerFiles}
            uploadRequiresAuthHint={false}
            inputClass={inputClass}
            label=""
            hint="The first photo is the cover image."
          />
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-xl luxury-panel-heading">Details</h2>
          <label className="block text-sm">
            <span className="eyebrow luxury-panel-label">Amenities (one per line)</span>
            <textarea
              rows={3}
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="eyebrow luxury-panel-label">House rules (one per line)</span>
            <textarea
              rows={3}
              value={houseRules}
              onChange={(e) => setHouseRules(e.target.value)}
              className={inputClass}
            />
          </label>
        </section>

        {needsGst ? (
          <section className={sectionClass}>
            <h2 className="font-display text-xl luxury-panel-heading">GST</h2>
            <p className="luxury-panel-body text-sm">
              Price per room per day is above ₹8,000 — a GST number is required.
            </p>
            <label className="block text-sm">
              <span className="eyebrow luxury-panel-label">GST number</span>
              <input
                required
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                className={inputClass}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                autoComplete="off"
              />
            </label>
          </section>
        ) : null}

        {error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || uploadingLicense || uploadingPassport}
          className="luxury-btn luxury-btn-primary disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </LuxuryCheckoutPanel>
  );
}
