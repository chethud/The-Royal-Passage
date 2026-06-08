import { useMemo, useState } from "react";
import type { CategoryOption, CreateHostSlotPayload } from "@/lib/api/host-experiences";
import type { CitySummary } from "@/lib/cities";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

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

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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
  const [citySlug, setCitySlug] = useState(cities[0]?.slug ?? "mysuru");
  const [region, setRegion] = useState("Karnataka");
  const [address, setAddress] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [priceMajor, setPriceMajor] = useState(0);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroPreviewFailed, setHeroPreviewFailed] = useState(false);
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [requirements, setRequirements] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [minGuests, setMinGuests] = useState(1);
  const [maxGuests, setMaxGuests] = useState(10);
  const [submitForReview, setSubmitForReview] = useState(false);

  const [draftSlots, setDraftSlots] = useState<DraftSlot[]>([]);
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [slotCapacity, setSlotCapacity] = useState(8);

  const categoryLabel = categories.find((c) => c.slug === categorySlug)?.label ?? categorySlug;
  const cityName = cities.find((c) => c.slug === citySlug)?.name ?? citySlug;
  const showHeroPreview = heroImageUrl.trim() && isValidUrl(heroImageUrl.trim()) && !heroPreviewFailed;

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
      const hero = heroImageUrl.trim();
      if (hero && !isValidUrl(hero)) return "Hero image must be a valid http(s) URL.";
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

  const addDraftSlot = () => {
    if (!slotDate) {
      setStepError("Pick a date for the slot.");
      return;
    }
    if (startTime >= endTime) {
      setStepError("End time must be after start time.");
      return;
    }
    setStepError(null);
    setDraftSlots((prev) => [
      ...prev,
      {
        key: `${slotDate}-${startTime}-${endTime}-${Date.now()}`,
        slotDate,
        startTime,
        endTime,
        capacity: slotCapacity,
      },
    ]);
    setSlotDate("");
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
        heroImageUrl: heroImageUrl.trim() || undefined,
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
              <select
                required
                value={citySlug}
                onChange={(e) => setCitySlug(e.target.value)}
                className={inputClass}
              >
                {cities.map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
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
              <input
                type="number"
                min={0}
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
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="text-sm lg:col-span-2">
              <span className="eyebrow text-muted-foreground">Hero image URL</span>
              <input
                value={heroImageUrl}
                onChange={(e) => {
                  setHeroPreviewFailed(false);
                  setHeroImageUrl(e.target.value);
                }}
                placeholder="https://…"
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                Paste a public image link. File upload can be added later.
              </span>
            </label>
            {showHeroPreview ? (
              <div className="lg:col-span-2 overflow-hidden rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)]">
                <img
                  src={heroImageUrl.trim()}
                  alt="Hero preview"
                  className="aspect-[16/9] w-full object-cover"
                  onError={() => setHeroPreviewFailed(true)}
                />
              </div>
            ) : null}
          </div>
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
              Add session dates guests can book. You can skip this and add slots later from your
              experience page.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm">
                <span className="eyebrow text-muted-foreground">Date</span>
                <input
                  type="date"
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm">
                <span className="eyebrow text-muted-foreground">Start</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm">
                <span className="eyebrow text-muted-foreground">End</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm">
                <span className="eyebrow text-muted-foreground">Capacity</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={slotCapacity}
                  onChange={(e) => setSlotCapacity(Number(e.target.value))}
                  className={inputClass}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={addDraftSlot}
              className="rounded-sm border border-ember/50 px-4 py-2 text-sm hover:bg-ember/10"
            >
              Add slot to list
            </button>
          </div>

          {sortedDraftSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No slots added yet — optional for now.</p>
          ) : (
            <ul className="divide-y divide-[oklch(0.88_0.08_86_/_0.15)] rounded-md border border-[oklch(0.88_0.08_86_/_0.15)]">
              {sortedDraftSlots.map((slot) => (
                <li
                  key={slot.key}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span>
                    {formatDateLong(slot.slotDate)} · {slot.startTime}–{slot.endTime} ·{" "}
                    {slot.capacity} seats
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

          {showHeroPreview ? (
            <div className="overflow-hidden rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)]">
              <img
                src={heroImageUrl.trim()}
                alt={title}
                className="aspect-[16/9] w-full object-cover"
              />
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
