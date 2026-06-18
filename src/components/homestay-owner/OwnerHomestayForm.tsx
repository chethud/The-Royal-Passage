import { useState } from "react";
import { ExperiencePhotoGallery } from "@/components/experience/ExperiencePhotoGallery";
import { RupeeAmountInput } from "@/components/host/RupeeAmountInput";
import type { CitySummary } from "@/lib/cities";
import {
  HOMESTAY_PROPERTY_TYPES,
  type CreateOwnerHomestayPayload,
  type OwnerHomestayDetail,
  type UpdateOwnerHomestayPayload,
} from "@/lib/api/owner-homestays";

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
  const [propertyType, setPropertyType] = useState(initial?.propertyType ?? "Home Stay");
  const [citySlug, setCitySlug] = useState(initial?.citySlug ?? cities[0]?.slug ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [priceMajor, setPriceMajor] = useState(
    Math.round((initial?.pricePerNightMinor ?? 0) / 100) || 0,
  );
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
  const [submitForReview, setSubmitForReview] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const galleryUrls = photoUrls.map((url) => url.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim(),
      propertyType,
      citySlug,
      region: region.trim() || undefined,
      address: address.trim() || undefined,
      pricePerNightMinor: priceMajor * 100,
      heroImageUrl: galleryUrls[0],
      galleryUrls,
      amenities: splitLines(amenitiesText),
      houseRules: splitLines(houseRulesText),
      bedrooms: Number.parseInt(bedrooms, 10) || 1,
      bathrooms: Number.parseInt(bathrooms, 10) || 1,
      maxGuests: Number.parseInt(maxGuests, 10) || 2,
      checkInTime,
      checkOutTime,
      submitForReview,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
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
        <label className="block">
          <span className={labelClass}>Price / night (₹)</span>
          <RupeeAmountInput
            className={inputClass}
            value={priceMajor}
            onChange={setPriceMajor}
            disabled={disabled || saving}
          />
        </label>
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

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className={labelClass}>Bedrooms</span>
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

      <div className="rounded-sm border border-[rgb(74_0_0/0.15)] bg-[rgb(255_255_255/0.35)] p-4 sm:p-5">
        <ExperiencePhotoGallery
          photoUrls={photoUrls}
          onChange={setPhotoUrls}
          readOnly={disabled || saving}
          inputClass={inputClass}
          label="Property photos"
          hint="Upload photos from your device. The first image is the cover; additional images appear in the gallery."
          photoAltPrefix="Homestay photo"
        />
      </div>

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

      {!disabled ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={submitForReview}
            onChange={(e) => setSubmitForReview(e.target.checked)}
            disabled={saving}
          />
          Submit for Royal Passage review after saving
        </label>
      ) : null}

      {!disabled ? (
        <button type="submit" className="luxury-btn-primary" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save property" : "Create property"}
        </button>
      ) : null}
    </form>
  );
}
