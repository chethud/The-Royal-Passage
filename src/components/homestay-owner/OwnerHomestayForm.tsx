import { useRef, useState } from "react";
import { ExperiencePhotoGallery } from "@/components/experience/ExperiencePhotoGallery";
import { PercentAmountInput } from "@/components/host/PercentAmountInput";
import { RupeeAmountInput } from "@/components/host/RupeeAmountInput";
import type { CitySummary } from "@/lib/cities";
import {
  HOMESTAY_PROPERTY_TYPES,
  type CreateOwnerHomestayPayload,
  type OwnerHomestayDetail,
  type UpdateOwnerHomestayPayload,
} from "@/lib/api/owner-homestays";
import { majorToMinor, minorToMajor } from "@/lib/money";
import { uploadHomestayLicenseCertificate } from "@/lib/homestay-license-upload";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/browser";

type OwnerHomestayFormProps = {
  cities: CitySummary[];
  initial?: OwnerHomestayDetail;
  disabled?: boolean;
  saving?: boolean;
  onSubmit: (payload: CreateOwnerHomestayPayload | UpdateOwnerHomestayPayload) => Promise<void>;
};

const labelClass = "eyebrow luxury-panel-label block text-xs uppercase tracking-[0.12em]";
const inputClass = "luxury-input mt-1 w-full";
const numberInputClass = `${inputClass} input-no-spin`;
const sectionHeadingClass = "eyebrow luxury-panel-label text-xs uppercase tracking-[0.12em]";
const sectionClass = "space-y-5";
const checkboxClass = "rounded border-[rgb(74_0_0/0.3)]";

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function OwnerHomestayForm({
  cities,
  initial,
  disabled = false,
  saving = false,
  onSubmit,
}: OwnerHomestayFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [propertyType, setPropertyType] = useState(() => {
    const initialType = initial?.propertyType;
    return HOMESTAY_PROPERTY_TYPES.includes(initialType as (typeof HOMESTAY_PROPERTY_TYPES)[number])
      ? (initialType as (typeof HOMESTAY_PROPERTY_TYPES)[number])
      : "Home Stay";
  });
  const [citySlug, setCitySlug] = useState(initial?.citySlug ?? cities[0]?.slug ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [priceMajor, setPriceMajor] = useState(
    Math.round(minorToMajor(initial?.pricePerNightMinor ?? 0)) || 0,
  );
  const [weekendPriceMajor, setWeekendPriceMajor] = useState(
    Math.round(minorToMajor(initial?.weekendPricePerNightMinor ?? initial?.pricePerNightMinor ?? 0)) ||
      0,
  );
  const [compareAtWeekdayMajor, setCompareAtWeekdayMajor] = useState(
    Math.round(minorToMajor(initial?.compareAtPricePerNightMinor ?? 0)) || 0,
  );
  const [compareAtWeekendMajor, setCompareAtWeekendMajor] = useState(
    Math.round(minorToMajor(initial?.compareAtWeekendPricePerNightMinor ?? 0)) || 0,
  );
  const [gstPercent, setGstPercent] = useState(Number(initial?.gstPercent ?? 0));
  const [gstNumber, setGstNumber] = useState(initial?.gstNumber ?? "");
  const [photoUrls, setPhotoUrls] = useState<string[]>(() => {
    const existing = initial?.galleryUrls?.length
      ? initial.galleryUrls
      : initial?.heroImageUrl
        ? [initial.heroImageUrl]
        : [];
    return existing;
  });
  const [amenitiesText, setAmenitiesText] = useState((initial?.amenities ?? []).join("\n"));
  const [houseRulesText, setHouseRulesText] = useState((initial?.houseRules ?? []).join("\n"));
  const [bedrooms, setBedrooms] = useState(String(initial?.bedrooms ?? 1));
  const [bathrooms, setBathrooms] = useState(String(initial?.bathrooms ?? 1));
  const [maxGuests, setMaxGuests] = useState(String(initial?.maxGuests ?? 2));
  const [checkInTime, setCheckInTime] = useState(initial?.checkInTime ?? "14:00");
  const [checkOutTime, setCheckOutTime] = useState(initial?.checkOutTime ?? "11:00");
  const [extraBedAvailable, setExtraBedAvailable] = useState(initial?.extraBedAvailable ?? false);
  const [extraBedPriceMajor, setExtraBedPriceMajor] = useState(
    Math.round(minorToMajor(initial?.extraBedPricePerNightMinor ?? 0)) || 0,
  );
  const [extraBedWeekendPriceMajor, setExtraBedWeekendPriceMajor] = useState(
    Math.round(
      minorToMajor(
        initial?.extraBedWeekendPricePerNightMinor ?? initial?.extraBedPricePerNightMinor ?? 0,
      ),
    ) || 0,
  );
  const [extraBedsPerRoom, setExtraBedsPerRoom] = useState<1 | 2>(
    (initial?.extraBedsPerRoom ?? 1) >= 2 ? 2 : 1,
  );
  const [licenseCertificateUrl, setLicenseCertificateUrl] = useState(
    initial?.licenseCertificateUrl ?? "",
  );
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitForReview, setSubmitForReview] = useState(false);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const bedroomCount = Number.parseInt(bedrooms, 10) || 1;
  const canSubmitForReview = Boolean(initial) && bedroomCount > 0;
  const uploadAvailable = isSupabaseBrowserConfigured();

  const handleLicenseSelect = async (file: File) => {
    setLicenseError(null);
    setUploadingLicense(true);
    try {
      const url = await uploadHomestayLicenseCertificate(file);
      setLicenseCertificateUrl(url);
    } catch (err) {
      setLicenseError(err instanceof Error ? err.message : "Failed to upload certificate.");
    } finally {
      setUploadingLicense(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!licenseCertificateUrl.trim()) {
      setLicenseError("Upload a certificate or license for this property.");
      return;
    }
    if (gstPercent < 0 || gstPercent > 100 || !Number.isFinite(gstPercent)) {
      setFormError("GST must be between 0% and 100%.");
      return;
    }
    if (gstPercent > 0) {
      const gstin = gstNumber.trim().toUpperCase();
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) {
        setFormError("Enter a valid 15-character GST number when GST is greater than 0%.");
        return;
      }
    }
    const galleryUrls = photoUrls.map((url) => url.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim(),
      propertyType,
      citySlug,
      region: region.trim() || undefined,
      address: address.trim() || undefined,
      pricePerNightMinor: majorToMinor(priceMajor),
      weekendPricePerNightMinor: majorToMinor(weekendPriceMajor),
      compareAtPricePerNightMinor: compareAtWeekdayMajor > 0 ? majorToMinor(compareAtWeekdayMajor) : null,
      compareAtWeekendPricePerNightMinor:
        compareAtWeekendMajor > 0 ? majorToMinor(compareAtWeekendMajor) : null,
      gstPercent,
      gstNumber: gstPercent > 0 ? gstNumber.trim().toUpperCase() : null,
      heroImageUrl: galleryUrls[0],
      galleryUrls,
      amenities: splitLines(amenitiesText),
      houseRules: splitLines(houseRulesText),
      bedrooms: Number.parseInt(bedrooms, 10) || 1,
      bathrooms: Number.parseInt(bathrooms, 10) || 1,
      maxGuests: Number.parseInt(maxGuests, 10) || 2,
      checkInTime,
      checkOutTime,
      extraBedAvailable,
      extraBedPricePerNightMinor: extraBedAvailable ? majorToMinor(extraBedPriceMajor) : 0,
      extraBedWeekendPricePerNightMinor: extraBedAvailable
        ? majorToMinor(extraBedWeekendPriceMajor)
        : 0,
      extraBedsPerRoom: extraBedAvailable ? extraBedsPerRoom : 1,
      licenseCertificateUrl: licenseCertificateUrl.trim(),
      submitForReview: canSubmitForReview && submitForReview,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
      <section className={sectionClass}>
        <h2 className={sectionHeadingClass}>Property details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Title</span>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={disabled || saving}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Property type</span>
            <select
              className={inputClass}
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              disabled={disabled || saving}
            >
              {HOMESTAY_PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>Tagline</span>
          <input
            className={inputClass}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            disabled={disabled || saving}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Description</span>
          <textarea
            className={`${inputClass} min-h-32`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={disabled || saving}
          />
        </label>
      </section>

      <div className="hairline" />

      <section className={sectionClass}>
        <h2 className={sectionHeadingClass}>Location & pricing</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className={labelClass}>City</span>
            <select
              className={inputClass}
              value={citySlug}
              onChange={(e) => setCitySlug(e.target.value)}
              disabled={disabled || saving}
            >
              {cities.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Region</span>
            <input
              className={inputClass}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={disabled || saving}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Weekday price / night (₹)</span>
            <p className="luxury-panel-body mb-2 text-xs">Monday through Friday</p>
            <RupeeAmountInput
              className={inputClass}
              value={priceMajor}
              onChange={setPriceMajor}
              disabled={disabled || saving}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Weekend price / night (₹)</span>
            <p className="luxury-panel-body mb-2 text-xs">Saturday and Sunday</p>
            <RupeeAmountInput
              className={inputClass}
              value={weekendPriceMajor}
              onChange={setWeekendPriceMajor}
              disabled={disabled || saving}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Weekday original / was (₹)</span>
            <p className="luxury-panel-body mb-2 text-xs">Optional offer list price</p>
            <RupeeAmountInput
              className={inputClass}
              value={compareAtWeekdayMajor}
              onChange={setCompareAtWeekdayMajor}
              disabled={disabled || saving}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Weekend original / was (₹)</span>
            <p className="luxury-panel-body mb-2 text-xs">Optional · leave blank for no offer</p>
            <RupeeAmountInput
              className={inputClass}
              value={compareAtWeekendMajor}
              onChange={setCompareAtWeekendMajor}
              disabled={disabled || saving}
            />
          </label>
          <label className="block">
            <span className={labelClass}>GST (%)</span>
            <p className="luxury-panel-body mb-2 text-xs">
              Added on top of the stay total at checkout. Enter 0 if you do not charge GST.
            </p>
            <PercentAmountInput
              className={inputClass}
              value={gstPercent}
              onChange={setGstPercent}
              disabled={disabled || saving}
            />
          </label>
          {gstPercent > 0 ? (
            <label className="block">
              <span className={labelClass}>GST number</span>
              <input
                className={inputClass}
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                autoComplete="off"
                disabled={disabled || saving}
              />
            </label>
          ) : null}
        </div>

        <label className="block">
          <span className={labelClass}>Address</span>
          <input
            className={inputClass}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={disabled || saving}
          />
        </label>
      </section>

      <div className="hairline" />

      <section className={sectionClass}>
        <h2 className={sectionHeadingClass}>Capacity</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className={labelClass}>Number of rooms</span>
            <input
              className={numberInputClass}
              type="number"
              min={1}
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              disabled={disabled || saving}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Bathrooms</span>
            <input
              className={numberInputClass}
              type="number"
              min={1}
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              disabled={disabled || saving}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Max guests</span>
            <input
              className={numberInputClass}
              type="number"
              min={1}
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              disabled={disabled || saving}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Check-in time</span>
            <input
              className={inputClass}
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              disabled={disabled || saving}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Check-out time</span>
            <input
              className={inputClass}
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              disabled={disabled || saving}
            />
          </label>
        </div>
      </section>

      <div className="hairline" />

      <section className={sectionClass}>
        <h2 className={sectionHeadingClass}>Extra beds</h2>
        <div className="space-y-3 rounded-sm border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.25)] p-4">
          <label className="flex items-center gap-2 text-sm luxury-panel-body">
            <input
              type="checkbox"
              checked={extraBedAvailable}
              onChange={(e) => setExtraBedAvailable(e.target.checked)}
              disabled={disabled || saving}
              className={checkboxClass}
            />
            Extra bed available
          </label>
          {extraBedAvailable ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className={labelClass}>Extra bed weekday price (₹)</span>
                  <RupeeAmountInput
                    className={inputClass}
                    value={extraBedPriceMajor}
                    onChange={setExtraBedPriceMajor}
                    disabled={disabled || saving}
                    required
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Extra bed weekend price (₹)</span>
                  <RupeeAmountInput
                    className={inputClass}
                    value={extraBedWeekendPriceMajor}
                    onChange={setExtraBedWeekendPriceMajor}
                    disabled={disabled || saving}
                    required
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Extra beds allowed</span>
                  <select
                    className={inputClass}
                    value={extraBedsPerRoom}
                    onChange={(e) => setExtraBedsPerRoom(Number(e.target.value) === 2 ? 2 : 1)}
                    disabled={disabled || saving}
                  >
                    <option value={1}>1 per bedroom</option>
                    <option value={2}>2 per bedroom</option>
                  </select>
                </label>
              </div>
              <p className="luxury-panel-body text-xs leading-relaxed">
                Guests can add up to {extraBedsPerRoom} extra bed{extraBedsPerRoom === 1 ? "" : "s"} per
                bedroom ({bedroomCount * extraBedsPerRoom} max for this property).
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <div className="hairline" />

      <section className={sectionClass}>
        <div>
          <h2 className={sectionHeadingClass}>Photos</h2>
          <p className="luxury-panel-body mt-2 text-xs leading-relaxed">
            Upload photos from your device. The first image is the cover; additional images appear in the
            gallery.
          </p>
        </div>
        <div className="dashboard-panel-card p-4 sm:p-5">
          <ExperiencePhotoGallery
            photoUrls={photoUrls}
            onChange={setPhotoUrls}
            readOnly={disabled || saving}
            inputClass={inputClass}
            label=""
            hint=""
            photoAltPrefix="Homestay photo"
          />
        </div>
      </section>

      <div className="hairline" />

      <section className={sectionClass}>
        <div>
          <h2 className={sectionHeadingClass}>Certificate / license</h2>
          <p className="luxury-panel-body mt-2 text-xs leading-relaxed">
            Upload a clear photo of your property registration certificate, trade license, or hotel
            license. Required for every listing.
          </p>
        </div>
        <div className="dashboard-panel-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={disabled || saving || uploadingLicense || !uploadAvailable}
              onClick={() => licenseInputRef.current?.click()}
              className="luxury-btn-sm luxury-btn-panel-outline"
            >
              {uploadingLicense
                ? "Uploading…"
                : licenseCertificateUrl
                  ? "Replace certificate"
                  : "Upload certificate / license"}
            </button>
            {licenseCertificateUrl ? (
              <a
                href={licenseCertificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-panel-link text-sm hover:underline"
              >
                Preview uploaded document
              </a>
            ) : null}
          </div>
          <input
            ref={licenseInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void handleLicenseSelect(file);
            }}
          />
          {!uploadAvailable ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Document upload requires Supabase configuration.
            </p>
          ) : null}
          {licenseError ? <p className="mt-2 text-xs text-destructive">{licenseError}</p> : null}
          {formError ? <p className="mt-2 text-sm text-destructive">{formError}</p> : null}
        </div>
      </section>

      <div className="hairline" />

      <section className={sectionClass}>
        <h2 className={sectionHeadingClass}>Rules & amenities</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Amenities (one per line)</span>
            <textarea
              className={`${inputClass} min-h-24`}
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              disabled={disabled || saving}
            />
          </label>
          <label className="block">
            <span className={labelClass}>House rules (one per line)</span>
            <textarea
              className={`${inputClass} min-h-24`}
              value={houseRulesText}
              onChange={(e) => setHouseRulesText(e.target.value)}
              disabled={disabled || saving}
            />
          </label>
        </div>
      </section>

      {!disabled ? (
        <div className="space-y-4 border-t luxury-panel-divider pt-6">
          {initial ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={submitForReview}
                onChange={(e) => setSubmitForReview(e.target.checked)}
                disabled={saving || !canSubmitForReview}
              />
              Submit for Royal Passage review after saving
            </label>
          ) : (
            <p className="luxury-panel-body text-sm">
              Save your property details to create a draft, then submit for review from the property
              page.
            </p>
          )}
          {!canSubmitForReview && initial ? (
            <p className="luxury-panel-body text-xs">
              Enter your number of rooms before submitting for review.
            </p>
          ) : null}
          <button type="submit" className="luxury-btn-primary" disabled={saving}>
            {saving ? "Saving…" : initial ? "Save property" : "Create property"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
