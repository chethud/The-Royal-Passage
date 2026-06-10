import { useState } from "react";
import type { CategoryOption, HostExperienceDetail } from "@/lib/api/host-experiences";
import type { CitySummary } from "@/lib/cities";
import { HOST_CITY_SLUG } from "@/lib/host-form-data";

type HostExperienceFormProps = {
  categories: CategoryOption[];
  cities: CitySummary[];
  initial?: HostExperienceDetail;
  readOnly?: boolean;
  saving: boolean;
  onSubmit: (payload: {
    title: string;
    slug?: string;
    tagline?: string;
    description: string;
    categorySlug: string;
    citySlug: string;
    region?: string;
    address?: string;
    durationMinutes: number;
    pricePerPersonMinor: number;
    heroImageUrl?: string;
    galleryUrls?: string[];
    inclusions: string[];
    exclusions: string[];
    requirements: string[];
    cancellationPolicy?: string;
    minGuestsPerBooking: number;
    maxGuestsPerBooking: number;
    submitForReview: boolean;
  }) => void;
};

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(values: string[]) {
  return values.join("\n");
}

export function HostExperienceForm({
  categories,
  cities,
  initial,
  readOnly = false,
  saving,
  onSubmit,
}: HostExperienceFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? categories[0]?.slug ?? "");
  const [citySlug] = useState(initial?.citySlug ?? HOST_CITY_SLUG);
  const [region, setRegion] = useState(initial?.region ?? "Karnataka");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 120);
  const [priceMajor, setPriceMajor] = useState(
    initial ? Math.round(initial.pricePerPersonMinor / 100) : 0,
  );
  const [photoUrls, setPhotoUrls] = useState<string[]>(() => {
    const existing = initial?.galleryUrls?.length
      ? initial.galleryUrls
      : initial?.heroImageUrl
        ? [initial.heroImageUrl]
        : [""];
    return existing.length > 0 ? existing : [""];
  });
  const [inclusions, setInclusions] = useState(joinLines(initial?.inclusions ?? []));
  const [exclusions, setExclusions] = useState(joinLines(initial?.exclusions ?? []));
  const [requirements, setRequirements] = useState(joinLines(initial?.requirements ?? []));
  const [cancellationPolicy, setCancellationPolicy] = useState(initial?.cancellationPolicy ?? "");
  const [minGuests, setMinGuests] = useState(initial?.minGuestsPerBooking ?? 1);
  const [maxGuests, setMaxGuests] = useState(initial?.maxGuestsPerBooking ?? 10);
  const [submitForReview, setSubmitForReview] = useState(false);

  const cityName =
    cities.find((city) => city.slug === citySlug)?.name ??
    cities[0]?.name ??
    "Mysuru";

  const inputClass =
    "mt-1 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const galleryUrls = photoUrls.map((url) => url.trim()).filter(Boolean);
    onSubmit({
      title: title.trim(),
      slug: slug.trim() || undefined,
      tagline: tagline.trim() || undefined,
      description: description.trim(),
      categorySlug,
      citySlug,
      region: region.trim() || undefined,
      address: address.trim() || undefined,
      durationMinutes,
      pricePerPersonMinor: priceMajor * 100,
      heroImageUrl: galleryUrls[0],
      galleryUrls,
      inclusions: splitLines(inclusions),
      exclusions: splitLines(exclusions),
      requirements: splitLines(requirements),
      cancellationPolicy: cancellationPolicy.trim() || undefined,
      minGuestsPerBooking: minGuests,
      maxGuestsPerBooking: maxGuests,
      submitForReview,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8 space-y-5">
        <h3 className="font-display text-xl">Basics</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm">
            <span className="eyebrow text-muted-foreground">Title</span>
            <input
              required
              disabled={readOnly}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            <span className="eyebrow text-muted-foreground">URL slug</span>
            <input
              disabled={readOnly}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated if empty"
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            <span className="eyebrow text-muted-foreground">Category</span>
            <select
              required
              disabled={readOnly}
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className={inputClass}
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2 text-sm">
            <span className="eyebrow text-muted-foreground">Tagline</span>
            <input
              disabled={readOnly}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2 text-sm">
            <span className="eyebrow text-muted-foreground">Description</span>
            <textarea
              required
              disabled={readOnly}
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8 space-y-5">
        <h3 className="font-display text-xl">Location & pricing</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm">
            <span className="eyebrow text-muted-foreground">City</span>
            <input
              readOnly
              value={cityName}
              className={`${inputClass} bg-muted/30 text-muted-foreground`}
            />
          </label>
          <label className="text-sm">
            <span className="eyebrow text-muted-foreground">Region</span>
            <input
              disabled={readOnly}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2 text-sm">
            <span className="eyebrow text-muted-foreground">Address</span>
            <input
              disabled={readOnly}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            <span className="eyebrow text-muted-foreground">Duration (minutes)</span>
            <input
              type="number"
              min={30}
              max={480}
              disabled={readOnly}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            <span className="eyebrow text-muted-foreground">Price per person (₹)</span>
            <input
              type="number"
              min={0}
              disabled={readOnly}
              value={priceMajor}
              onChange={(e) => setPriceMajor(Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            <span className="eyebrow text-muted-foreground">Min guests / booking</span>
            <input
              type="number"
              min={1}
              max={50}
              disabled={readOnly}
              value={minGuests}
              onChange={(e) => setMinGuests(Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            <span className="eyebrow text-muted-foreground">Max guests / booking</span>
            <input
              type="number"
              min={1}
              max={50}
              disabled={readOnly}
              value={maxGuests}
              onChange={(e) => setMaxGuests(Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <div className="sm:col-span-2 space-y-3">
            <span className="eyebrow text-muted-foreground">Experience photos</span>
            {photoUrls.map((url, index) => (
              <div key={`photo-${index}`} className="flex flex-wrap items-start gap-2">
                <input
                  disabled={readOnly}
                  value={url}
                  onChange={(e) => {
                    const next = [...photoUrls];
                    next[index] = e.target.value;
                    setPhotoUrls(next);
                  }}
                  placeholder={`https://… photo ${index + 1}`}
                  className={`${inputClass} min-w-[240px] flex-1`}
                />
                {!readOnly && photoUrls.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoUrls((prev) => prev.filter((_, rowIndex) => rowIndex !== index))
                    }
                    className="rounded-sm border border-destructive/40 px-3 py-2 text-xs text-destructive"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
            {!readOnly ? (
              <button
                type="button"
                onClick={() => setPhotoUrls((prev) => [...prev, ""])}
                className="rounded-sm border border-ember/50 px-4 py-2 text-sm hover:bg-ember/10"
              >
                Add another photo
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8 space-y-5">
        <h3 className="font-display text-xl">Details</h3>
        <label className="block text-sm">
          <span className="eyebrow text-muted-foreground">Inclusions (one per line)</span>
          <textarea
            disabled={readOnly}
            rows={4}
            value={inclusions}
            onChange={(e) => setInclusions(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="eyebrow text-muted-foreground">Exclusions (one per line)</span>
          <textarea
            disabled={readOnly}
            rows={3}
            value={exclusions}
            onChange={(e) => setExclusions(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="eyebrow text-muted-foreground">Requirements (one per line)</span>
          <textarea
            disabled={readOnly}
            rows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="eyebrow text-muted-foreground">Cancellation policy</span>
          <textarea
            disabled={readOnly}
            rows={3}
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={submitForReview}
              onChange={(e) => setSubmitForReview(e.target.checked)}
            />
            Submit for admin review after saving
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-ember px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-60"
          >
            {saving ? "Saving…" : initial ? "Save changes" : "Create experience"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
