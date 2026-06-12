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
  "mt-1 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm";

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
              className={`rounded-sm border px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] ${
                active
                  ? "border-ember/70 bg-ember/10 text-ember"
                  : done
                    ? "border-ember/30 text-ember/80"
                    : "border-[oklch(0.88_0.08_86_/_0.25)] text-muted-foreground"
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
        <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8 space-y-5">
          <h3 className="font-display text-xl">Basics</h3>
          <p className="text-sm text-muted-foreground">
            Give your experience a clear title and description. Guests see this on the listing page.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2 text-sm">
              <span className="eyebrow text-muted-foreground">Title</span>
              <input
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow text-muted-foreground">URL slug</span>
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
              <span className="eyebrow text-muted-foreground">Category</span>
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
              <span className="eyebrow text-muted-foreground">Tagline</span>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} />
            </label>
            <label className="sm:col-span-2 text-sm">
              <span className="eyebrow text-muted-foreground">Description</span>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                {description.trim().length}/50 characters minimum
              </span>
            </label>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
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
              <span className="mt-1 block text-xs text-muted-foreground">
                The Royal Passage currently lists experiences in Mysuru only.
              </span>
            </label>
            <label className="text-sm">
              <span className="eyebrow text-muted-foreground">Region</span>
              <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass} />
            </label>
            <label className="sm:col-span-2 text-sm">
              <span className="eyebrow text-muted-foreground">Address</span>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
            </label>
            <label className="text-sm">
              <span className="eyebrow text-muted-foreground">Duration (minutes)</span>
              <input
                type="number"
                min={30}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className={inputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow text-muted-foreground">Price per person (₹)</span>
              <RupeeAmountInput
                value={priceMajor}
                onChange={setPriceMajor}
                className={inputClass}
              />
            </label>
            <label className="text-sm">
              <span className="eyebrow text-muted-foreground">Min guests / booking</span>
              <input
                type="number"
                min={1}
                max={50}
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
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className={inputClass}
              />
            </label>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8 space-y-5">
          <h3 className="font-display text-xl">Photos & details</h3>
          <ExperiencePhotoGallery
            photoUrls={photoUrls}
            onChange={setPhotoUrls}
            inputClass={inputClass}
          />
          <label className="block text-sm">
            <span className="eyebrow text-muted-foreground">Inclusions (one per line)</span>
            <textarea
              rows={4}
              value={inclusions}
              onChange={(e) => setInclusions(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="eyebrow text-muted-foreground">Exclusions (one per line)</span>
            <textarea
              rows={3}
              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="eyebrow text-muted-foreground">Requirements (one per line)</span>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="eyebrow text-muted-foreground">Cancellation policy</span>
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
          <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8 space-y-5">
            <h3 className="font-display text-xl">Bookable slots</h3>
            <p className="text-sm text-muted-foreground">
              Create when guests can book your experience: choose weekdays, a date range, session
              times, and capacity. You can skip this step and add schedules later from your
              experience page.
            </p>
            <WeekdaySlotBuilder onAddSlots={addWeeklySlots} />
          </div>

          {sortedDraftSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sessions added yet — optional for now. Use the builder above to generate your
              weekly schedule.
            </p>
          ) : (
            <div>
              <p className="mb-3 text-sm font-medium text-ink">
                {sortedDraftSlots.length} session{sortedDraftSlots.length === 1 ? "" : "s"} ready to
                publish
              </p>
              <ul className="max-h-72 divide-y divide-[oklch(0.88_0.08_86_/_0.15)] overflow-y-auto rounded-md border border-[oklch(0.88_0.08_86_/_0.15)]">
                {sortedDraftSlots.map((slot) => (
                  <li
                    key={slot.key}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
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
        <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8 space-y-6">
          <h3 className="font-display text-xl">Review & submit</h3>
          <p className="text-sm text-muted-foreground">
            Check everything below. Your listing is saved as a draft unless you submit for Royal
            Passage review.
          </p>

          {reviewPhotos.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {reviewPhotos.slice(0, 3).map((url) => (
                <div
                  key={url}
                  className="overflow-hidden rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)]"
                >
                  <img src={url} alt={title} className="aspect-[4/3] w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="eyebrow text-muted-foreground">Title</dt>
              <dd className="mt-1 font-medium">{title || "—"}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Category</dt>
              <dd className="mt-1">{categoryLabel}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow text-muted-foreground">Description</dt>
              <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{description}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Location</dt>
              <dd className="mt-1">
                {cityName}
                {region ? `, ${region}` : ""}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Price</dt>
              <dd className="mt-1">{formatMoney(priceMajor * 100)} per person</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Duration</dt>
              <dd className="mt-1">{durationMinutes} minutes</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Guests per booking</dt>
              <dd className="mt-1">
                {minGuests}–{maxGuests}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow text-muted-foreground">Photos</dt>
              <dd className="mt-1">
                {validPhotoUrls.length === 0
                  ? "None added"
                  : `${validPhotoUrls.length} photo${validPhotoUrls.length === 1 ? "" : "s"}`}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow text-muted-foreground">Bookable slots</dt>
              <dd className="mt-1">
                {sortedDraftSlots.length === 0
                  ? "None — add later from your experience page"
                  : `${sortedDraftSlots.length} slot${sortedDraftSlots.length === 1 ? "" : "s"}`}
              </dd>
            </div>
          </dl>

          <label className="flex items-start gap-3 rounded-sm border border-ember/30 bg-ember/5 p-4 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={submitForReview}
              onChange={(e) => setSubmitForReview(e.target.checked)}
            />
            <span>
              <strong className="font-medium">Submit for admin review</strong>
              <span className="mt-1 block text-muted-foreground">
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
            className="rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-5 py-3 text-sm disabled:opacity-60"
          >
            Back
          </button>
        ) : null}
        {step < 5 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-sm bg-ember px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)]"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={handleFinalSubmit}
            className="rounded-sm bg-ember px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-60"
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
