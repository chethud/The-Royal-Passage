import { useState } from "react";
import type { CitySummary } from "@/lib/cities";
import {
  HOMESTAY_PROPERTY_TYPES,
  type CreateOwnerHomestayPayload,
  type OwnerHomestayDetail,
  type UpdateOwnerHomestayPayload,
} from "@/lib/api/owner-homestays";
import { parseRupeeMajorInput } from "@/lib/money";

type OwnerHomestayFormProps = {
  cities: CitySummary[];
  initial?: OwnerHomestayDetail;
  disabled?: boolean;
  saving?: boolean;
  onSubmit: (payload: CreateOwnerHomestayPayload | UpdateOwnerHomestayPayload) => Promise<void>;
};

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
    String(Math.round((initial?.pricePerNightMinor ?? 0) / 100) || ""),
  );
  const [heroImageUrl, setHeroImageUrl] = useState(initial?.heroImageUrl ?? "");
  const [galleryText, setGalleryText] = useState((initial?.galleryUrls ?? []).join("\n"));
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
    const payload = {
      title: title.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim(),
      propertyType,
      citySlug,
      region: region.trim() || undefined,
      address: address.trim() || undefined,
      pricePerNightMinor: parseRupeeMajorInput(priceMajor) * 100,
      heroImageUrl: heroImageUrl.trim() || undefined,
      galleryUrls: splitLines(galleryText),
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
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Title</span>
          <input
            className="luxury-input mt-2 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={disabled || saving}
          />
        </label>
        <label className="block">
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Property type</span>
          <select
            className="luxury-input mt-2 w-full"
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
        <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Tagline</span>
        <input
          className="luxury-input mt-2 w-full"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          disabled={disabled || saving}
        />
      </label>

      <label className="block">
        <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Description</span>
        <textarea
          className="luxury-input mt-2 min-h-32 w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={disabled || saving}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">City</span>
          <select
            className="luxury-input mt-2 w-full"
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
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Region</span>
          <input
            className="luxury-input mt-2 w-full"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={disabled || saving}
          />
        </label>
        <label className="block">
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Price / night (₹)</span>
          <input
            className="luxury-input mt-2 w-full"
            value={priceMajor}
            onChange={(e) => setPriceMajor(e.target.value)}
            required
            disabled={disabled || saving}
          />
        </label>
      </div>

      <label className="block">
        <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Address</span>
        <input
          className="luxury-input mt-2 w-full"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={disabled || saving}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Bedrooms</span>
          <input
            className="luxury-input mt-2 w-full"
            type="number"
            min={1}
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            disabled={disabled || saving}
          />
        </label>
        <label className="block">
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Bathrooms</span>
          <input
            className="luxury-input mt-2 w-full"
            type="number"
            min={1}
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            disabled={disabled || saving}
          />
        </label>
        <label className="block">
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Max guests</span>
          <input
            className="luxury-input mt-2 w-full"
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
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Check-in time</span>
          <input
            className="luxury-input mt-2 w-full"
            type="time"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            disabled={disabled || saving}
          />
        </label>
        <label className="block">
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Check-out time</span>
          <input
            className="luxury-input mt-2 w-full"
            type="time"
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            disabled={disabled || saving}
          />
        </label>
      </div>

      <label className="block">
        <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Hero image URL</span>
        <input
          className="luxury-input mt-2 w-full"
          value={heroImageUrl}
          onChange={(e) => setHeroImageUrl(e.target.value)}
          disabled={disabled || saving}
        />
      </label>

      <label className="block">
        <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Gallery URLs (one per line)</span>
        <textarea
          className="luxury-input mt-2 min-h-24 w-full"
          value={galleryText}
          onChange={(e) => setGalleryText(e.target.value)}
          disabled={disabled || saving}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">Amenities (one per line)</span>
          <textarea
            className="luxury-input mt-2 min-h-24 w-full"
            value={amenitiesText}
            onChange={(e) => setAmenitiesText(e.target.value)}
            disabled={disabled || saving}
          />
        </label>
        <label className="block">
          <span className="luxury-panel-label text-xs uppercase tracking-[0.12em]">House rules (one per line)</span>
          <textarea
            className="luxury-input mt-2 min-h-24 w-full"
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
        <button type="submit" className="luxury-btn luxury-btn-primary" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save property" : "Create property"}
        </button>
      ) : null}
    </form>
  );
}
