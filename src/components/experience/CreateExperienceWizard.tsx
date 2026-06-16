import { useMemo, useState } from "react";
import { ExperiencePhotoGallery } from "@/components/experience/ExperiencePhotoGallery";
import { WeekdaySlotBuilder } from "@/components/experience/WeekdaySlotBuilder";
import { RupeeAmountInput } from "@/components/host/RupeeAmountInput";
import type { CategoryOption, CreateHostSlotPayload } from "@/lib/api/host-experiences";
import type { CitySummary } from "@/lib/cities";
import { isPublicImageUrl } from "@/lib/experience-photo-upload";
import { HOST_CITY_SLUG } from "@/lib/host-form-data";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { mergeUniqueSlots, formatTime12h } from "@/lib/weekday-slots";

type CreateExperienceWizardProps = {
  categories: CategoryOption[];
  cities: CitySummary[];
  saving: boolean;
  onSubmit: (payload: {
    experience: {
      title: string;
      slug?: string;
      tagline?: string;
      description: string;
      categorySlug: string;
      citySlug: string;
      region?: string;
      address?: string;
      mapLink?: string;
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
    };
    slots: CreateHostSlotPayload[];
  }) => void;
};

type DraftSlot = CreateHostSlotPayload & { key: string };

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Location & pricing" },
  { id: 3, label: "Photos & details" },
  { id: 4, label: "Bookable slots" },
  { id: 5, label: "Review" },
] as const;

const inputClass =
  "mt-1 w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-3 py-2 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";
const numberInputClass = `${inputClass} input-no-spin`;

const labelClass = "eyebrow luxury-panel-label";
const hintClass = "luxury-panel-body mt-1 block text-xs";
const sectionTitleClass = "luxury-panel-heading font-display text-xl";

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function slugFromTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateExperienceWizard({
  categories,
  cities,
  saving,
  onSubmit,
}: CreateExperienceWizardProps) {
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const citySlug = HOST_CITY_SLUG;
  const [region, setRegion] = useState("Karnataka");
  const [address, setAddress] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [priceMajor, setPriceMajor] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [requirements, setRequirements] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [minGuests, setMinGuests] = useState(1);
  const [maxGuests, setMaxGuests] = useState(10);
  const [submitForReview, setSubmitForReview] = useState(false);

  const [draftSlots, setDraftSlots] = useState<DraftSlot[]>([]);

  const categoryLabel = categories.find((c) => c.slug === categorySlug)?.label ?? categorySlug;
  const cityName =
    cities.find((c) => c.slug === citySlug)?.name ??
    cities[0]?.name ??
    "Mysuru";
  const validPhotoUrls = photoUrls.map((url) => url.trim()).filter(Boolean);
  const reviewPhotos = useMemo(
    () => validPhotoUrls.filter(isPublicImageUrl),
    [validPhotoUrls],
  );

  const sortedDraftSlots = useMemo(
    () =>
      [...draftSlots].sort((a, b) =>
        a.slotDate === b.slotDate
          ? a.startTime.localeCompare(b.startTime)
          : a.slotDate.localeCompare(b.slotDate),
      ),
    [draftSlots],
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugFromTitle(value));
    }
  };

  const validateStep = (current: number): string | null => {
    if (current === 1) {
      if (title.trim().length < 5) return "Title must be at least 5 characters.";
      if (!categorySlug) return "Select a category.";
      if (description.trim().length < 50) return "Description must be at least 50 characters.";
      return null;
    }
    if (current === 2) {
      if (!citySlug) return "Select a city.";
      const trimmedMapLink = mapLink.trim();
      if (trimmedMapLink) {
        try {
          const url = new URL(trimmedMapLink);
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            return "Map link must start with http:// or https://.";
          }
        } catch {
          return "Map link must be a valid URL (e.g. Google Maps share link).";
        }
      }
      if (durationMinutes < 30) return "Duration must be at least 30 minutes.";
      if (priceMajor < 0) return "Price cannot be negative.";
      if (minGuests < 1) return "Minimum guests must be at least 1.";
      if (maxGuests < minGuests) return "Max guests must be at least the minimum.";
      return null;
    }
    if (current === 3) {
      for (const url of validPhotoUrls) {
        if (!isPublicImageUrl(url)) return "Each photo must be a valid http(s) URL.";
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
    setStep((s) => Math.min(5, s + 1));
  };

  const goBack = () => {
    setStepError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const addWeeklySlots = (slots: CreateHostSlotPayload[]) => {
    setStepError(null);
    setDraftSlots((prev) => {
      const merged = mergeUniqueSlots(
        prev.map(({ slotDate: d, startTime: s, endTime: e, capacity }) => ({
          slotDate: d,
          startTime: s,
          endTime: e,
          capacity,
        })),
        slots,
      );
      return merged.map((slot, index) => ({
        key: `${slot.slotDate}-${slot.startTime}-${slot.endTime}-${index}`,
        ...slot,
      }));
    });
  };

  const removeDraftSlot = (key: string) => {
    setDraftSlots((prev) => prev.filter((slot) => slot.key !== key));
  };

  const handleFinalSubmit = () => {
    const error = validateStep(1) ?? validateStep(2) ?? validateStep(3);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    const galleryUrls = validPhotoUrls.filter(isPublicImageUrl);
    onSubmit({
      experience: {
        title: title.trim(),
        slug: slug.trim() || undefined,
        tagline: tagline.trim() || undefined,
        description: description.trim(),
        categorySlug,
        citySlug,
        region: region.trim() || undefined,
        address: address.trim() || undefined,
        mapLink: mapLink.trim() || undefined,
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
      },
      slots: draftSlots.map(({ slotDate: d, startTime: s, endTime: e, capacity }) => ({
        slotDate: d,
        startTime: s,
        endTime: e,
        capacity,
      })),
    });
  };

  return (
    <div className="space-y-8">
      <nav aria-label="Create experience steps" className="flex flex-wrap gap-2">
        {STEPS.map((item) => {
          const done = step > item.id;
          const active = step === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-sm px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] ${
                active
                  ? "luxury-panel-step-active"
                  : done
                    ? "luxury-panel-step-done"
                    : "luxury-panel-step-idle"
              }`}
            >
              <span className="mr-1.5 opacity-70">{item.id}.</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {stepError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {stepError}
        </p>
      ) : null}

      {step === 1 ? (
        <div className="space-y-5 border-t luxury-panel-divider pt-6">
          <h3 className={sectionTitleClass}>Basics</h3>
          <p className="luxury-panel-body text-sm">
            Give your experience a clear title and description. Guests see this on the listing page.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2 text-sm">
              <span className="eyebrow luxury-panel-label">Title</span>
              <input
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">URL slug</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="auto-generated from title"
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
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2 text-sm">
              <span className="eyebrow luxury-panel-label">Tagline</span>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} />
            </label>
            <label className="sm:col-span-2 text-sm">
              <span className="eyebrow luxury-panel-label">Description</span>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
              <span className={hintClass}>
                {description.trim().length}/50 characters minimum
              </span>
            </label>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5 border-t luxury-panel-divider pt-6">
          <h3 className={sectionTitleClass}>Location & pricing</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">City</span>
              <input
                readOnly
                value={cityName}
                className={`${inputClass} bg-[rgb(255_255_255/0.35)]`}
              />
              <span className={hintClass}>
                The Royal Passage currently lists experiences in Mysuru only.
              </span>
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Region</span>
              <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass} />
            </label>
            <label className="sm:col-span-2 text-sm">
              <span className="eyebrow luxury-panel-label">Address</span>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
            </label>
            <label className="sm:col-span-2 text-sm">
              <span className="eyebrow luxury-panel-label">Map link</span>
              <input
                type="url"
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                placeholder="https://maps.google.com/..."
                className={inputClass}
              />
              <span className={hintClass}>
                Paste a Google Maps or Apple Maps link so guests can navigate to your meeting point.
              </span>
            </label>
            <label className="text-sm">
              <span className="eyebrow luxury-panel-label">Duration (minutes)</span>
              <input
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
                type="number"
                min={1}
                max={50}
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className={numberInputClass}
              />
            </label>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5 border-t luxury-panel-divider pt-6">
          <h3 className={sectionTitleClass}>Photos & details</h3>
          <p className="luxury-panel-body text-sm">
            Add multiple photos — the first image becomes the cover. Guests can browse the full
            gallery on your experience page.
          </p>
          <ExperiencePhotoGallery
            photoUrls={photoUrls}
            onChange={setPhotoUrls}
            inputClass={inputClass}
          />
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
          <label className="block text-sm">
            <span className="eyebrow luxury-panel-label">Cancellation policy</span>
            <textarea
              rows={3}
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-6">
          <div className="space-y-5 border-t luxury-panel-divider pt-6">
            <h3 className={sectionTitleClass}>Bookable slots</h3>
            <p className="luxury-panel-body text-sm">
              Create when guests can book your experience: choose weekdays, a date range, session
              times, and capacity. You can skip this step and add schedules later from your
              experience page.
            </p>
            <WeekdaySlotBuilder surface="light" onAddSlots={addWeeklySlots} />
          </div>

          {sortedDraftSlots.length === 0 ? (
            <p className="luxury-panel-body text-sm">
              No sessions added yet — optional for now. Use the builder above to generate your
              weekly schedule.
            </p>
          ) : (
            <div>
              <p className="luxury-panel-heading mb-3 text-sm font-medium">
                {sortedDraftSlots.length} session{sortedDraftSlots.length === 1 ? "" : "s"} ready to
                publish
              </p>
              <ul className="max-h-72 divide-y divide-[rgb(74_0_0/0.12)] overflow-y-auto rounded-md border border-[rgb(74_0_0/0.14)]">
                {sortedDraftSlots.map((slot) => (
                  <li
                    key={slot.key}
                    className="luxury-panel-body flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <span>
                      {formatDateLong(slot.slotDate)} · {formatTime12h(slot.startTime)} –{" "}
                      {formatTime12h(slot.endTime)} · {slot.capacity} guest
                      {slot.capacity === 1 ? "" : "s"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDraftSlot(slot.key)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-6 border-t luxury-panel-divider pt-6">
          <h3 className={sectionTitleClass}>Review & submit</h3>
          <p className="luxury-panel-body text-sm">
            Check everything below. Your listing is saved as a draft unless you submit for Royal
            Passage review.
          </p>

          {reviewPhotos.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {reviewPhotos.slice(0, 3).map((url) => (
                <div
                  key={url}
                  className="luxury-panel-image overflow-hidden rounded-sm"
                >
                  <img src={url} alt={title} className="aspect-[4/3] w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="eyebrow luxury-panel-label">Title</dt>
              <dd className="mt-1 font-medium">{title || "—"}</dd>
            </div>
            <div>
              <dt className="eyebrow luxury-panel-label">Category</dt>
              <dd className="mt-1">{categoryLabel}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow luxury-panel-label">Description</dt>
              <dd className="luxury-panel-body mt-1 whitespace-pre-wrap">{description}</dd>
            </div>
            <div>
              <dt className="eyebrow luxury-panel-label">Location</dt>
              <dd className="mt-1">
                {cityName}
                {region ? `, ${region}` : ""}
              </dd>
            </div>
            <div>
              <dt className="eyebrow luxury-panel-label">Price</dt>
              <dd className="mt-1">{formatMoney(priceMajor * 100)} per person</dd>
            </div>
            <div>
              <dt className="eyebrow luxury-panel-label">Duration</dt>
              <dd className="mt-1">{durationMinutes} minutes</dd>
            </div>
            <div>
              <dt className="eyebrow luxury-panel-label">Guests per booking</dt>
              <dd className="mt-1">
                {minGuests}–{maxGuests}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow luxury-panel-label">Photos</dt>
              <dd className="mt-1">
                {validPhotoUrls.length === 0
                  ? "None added"
                  : `${validPhotoUrls.length} photo${validPhotoUrls.length === 1 ? "" : "s"}`}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow luxury-panel-label">Bookable slots</dt>
              <dd className="mt-1">
                {sortedDraftSlots.length === 0
                  ? "None — add later from your experience page"
                  : `${sortedDraftSlots.length} slot${sortedDraftSlots.length === 1 ? "" : "s"}`}
              </dd>
            </div>
          </dl>

          <label className="flex items-start gap-3 rounded-md border border-[rgb(74_0_0/0.14)] bg-[rgb(255_255_255/0.35)] p-4 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={submitForReview}
              onChange={(e) => setSubmitForReview(e.target.checked)}
            />
            <span>
              <strong className="luxury-panel-heading font-medium">Submit for admin review</strong>
              <span className={hintClass}>
                Royal Passage will review your listing before it goes live on the marketplace.
              </span>
            </span>
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            disabled={saving}
            className="luxury-btn-sm luxury-btn-panel-outline disabled:opacity-60"
          >
            Back
          </button>
        ) : null}
        {step < 5 ? (
          <button
            type="button"
            onClick={goNext}
            className="luxury-btn-sm luxury-btn-primary"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={handleFinalSubmit}
            className="luxury-btn-sm luxury-btn-primary disabled:opacity-60"
          >
            {saving
              ? "Creating…"
              : submitForReview
                ? "Create & submit for review"
                : "Save as draft"}
          </button>
        )}
      </div>
    </div>
  );
}
