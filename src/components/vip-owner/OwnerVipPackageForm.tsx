import { useState } from "react";
import { ExperiencePhotoGallery } from "@/components/experience/ExperiencePhotoGallery";
import { RupeeAmountInput } from "@/components/host/RupeeAmountInput";
import type { CitySummary } from "@/lib/cities";
import {
  VIP_OWNER_PACKAGE_TYPES,
  type CreateOwnerVipPackagePayload,
  type OwnerVipPackageDetail,
  type UpdateOwnerVipPackagePayload,
} from "@/lib/api/owner-vip-packages";
import { VIP_BOOKING_POLICY_LINE, VIP_CITY, VIP_CITY_SLUG } from "@/lib/vip-filters";

type OwnerVipPackageFormProps = {
  cities: CitySummary[];
  initial?: OwnerVipPackageDetail;
  disabled?: boolean;
  saving?: boolean;
  onSubmit: (payload: CreateOwnerVipPackagePayload | UpdateOwnerVipPackagePayload) => Promise<void>;
};

const labelClass = "eyebrow luxury-panel-label block text-xs uppercase tracking-[0.12em]";
const inputClass = "luxury-input mt-1 w-full";
const numberInputClass = `${inputClass} input-no-spin`;
const sectionHeadingClass = "eyebrow luxury-panel-label text-xs uppercase tracking-[0.12em]";
const sectionClass = "space-y-5";

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function OwnerVipPackageForm({
  cities,
  initial,
  disabled = false,
  saving = false,
  onSubmit,
}: OwnerVipPackageFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [packageType, setPackageType] = useState(
    initial?.packageType ?? VIP_OWNER_PACKAGE_TYPES[0],
  );
  const [citySlug] = useState(initial?.citySlug ?? VIP_CITY_SLUG);
  const [region, setRegion] = useState(initial?.region ?? "");
  const [priceMajor, setPriceMajor] = useState(
    Math.round((initial?.priceFromMinor ?? 0) / 100) || 0,
  );
  const [durationDays, setDurationDays] = useState(String(initial?.durationDays ?? 1));
  const [maxGuests, setMaxGuests] = useState(String(initial?.maxGuests ?? 2));
  const [highlightsText, setHighlightsText] = useState((initial?.highlights ?? []).join("\n"));
  const [conciergeNote, setConciergeNote] = useState(initial?.conciergeNote ?? "");
  const [photoUrls, setPhotoUrls] = useState<string[]>(() => {
    const existing = initial?.galleryUrls?.length
      ? initial.galleryUrls
      : initial?.heroImageUrl
        ? [initial.heroImageUrl]
        : [];
    return existing;
  });
  const [submitForReview, setSubmitForReview] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const galleryUrls = photoUrls.map((url) => url.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim(),
      packageType,
      citySlug,
      region: region.trim() || undefined,
      priceFromMinor: priceMajor * 100,
      heroImageUrl: galleryUrls[0],
      galleryUrls,
      highlights: splitLines(highlightsText),
      conciergeNote: conciergeNote.trim() || undefined,
      durationDays: Number.parseInt(durationDays, 10) || 1,
      maxGuests: Number.parseInt(maxGuests, 10) || 2,
      submitForReview,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
      <section className={sectionClass}>
        <h2 className={sectionHeadingClass}>Package details</h2>
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
            <span className={labelClass}>Package type</span>
            <select
              className={inputClass}
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
              disabled={disabled || saving}
            >
              {VIP_OWNER_PACKAGE_TYPES.map((type) => (
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
            <input className={inputClass} value={VIP_CITY} readOnly disabled={disabled || saving} />
            <span className="luxury-panel-body mt-1 block text-xs">{VIP_BOOKING_POLICY_LINE}</span>
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
            <span className={labelClass}>Starting price (₹)</span>
            <RupeeAmountInput
              className={inputClass}
              value={priceMajor}
              onChange={setPriceMajor}
              disabled={disabled || saving}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Duration (days)</span>
            <input
              type="number"
              min={1}
              max={30}
              className={numberInputClass}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              required
              disabled={disabled || saving}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Max guests</span>
            <input
              type="number"
              min={1}
              max={50}
              className={numberInputClass}
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              required
              disabled={disabled || saving}
            />
          </label>
        </div>
      </section>

      <div className="hairline" />

      <section className={sectionClass}>
        <h2 className={sectionHeadingClass}>Inclusions</h2>
        <label className="block">
          <span className={labelClass}>Highlights (one per line)</span>
          <textarea
            className={`${inputClass} min-h-28`}
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            placeholder="Private palace guide&#10;Heritage lunch&#10;Door-to-door transfers"
            disabled={disabled || saving}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Concierge note</span>
          <textarea
            className={`${inputClass} min-h-20`}
            value={conciergeNote}
            onChange={(e) => setConciergeNote(e.target.value)}
            placeholder="Optional note shown to guests after enquiry."
            disabled={disabled || saving}
          />
        </label>
      </section>

      <div className="hairline" />

      <section className={sectionClass}>
        <div>
          <h2 className={sectionHeadingClass}>Photos</h2>
          <p className="luxury-panel-body mt-2 text-xs leading-relaxed">
            Upload photos from your device. The first image is the cover; additional images appear in
            the gallery.
          </p>
        </div>
        <div className="rounded-sm border border-[rgb(74_0_0/0.15)] bg-[rgb(255_255_255/0.35)] p-4 sm:p-5">
          <ExperiencePhotoGallery
            photoUrls={photoUrls}
            onChange={setPhotoUrls}
            readOnly={disabled || saving}
            inputClass={inputClass}
            label=""
            hint=""
            photoAltPrefix="VIP package photo"
          />
        </div>
      </section>

      {!disabled ? (
        <div className="space-y-4 border-t luxury-panel-divider pt-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={submitForReview}
              onChange={(e) => setSubmitForReview(e.target.checked)}
              disabled={saving}
              className="rounded border-[rgb(74_0_0/0.3)]"
            />
            Submit for Royal Passage review after saving
          </label>
          <button type="submit" className="luxury-btn-sm luxury-btn-primary" disabled={saving}>
            {saving ? "Saving…" : initial ? "Save package" : "Create package"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
