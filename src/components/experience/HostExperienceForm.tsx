import { useState } from "react";
import { ExperiencePartyPricingFields } from "@/components/experience/ExperiencePartyPricingFields";
import { ExperiencePhotoGallery } from "@/components/experience/ExperiencePhotoGallery";
import type { CategoryOption, HostExperienceDetail } from "@/lib/api/host-experiences";
import type { CitySummary } from "@/lib/cities";
import { HOST_CITY_SLUG } from "@/lib/host-form-data";
import {
  groupTotalMajorFromPerPersonMinor,
  inferExperiencePartyKind,
  perPersonMinorFromGroupTotal,
  resolveExperiencePartyPricing,
  type ExperiencePartyKind,
} from "@/lib/experience-party-pricing";

type HostExperienceFormProps = {
  categories: CategoryOption[];
  cities: CitySummary[];
  initial?: HostExperienceDetail;
  readOnly?: boolean;
  saving: boolean;
  /** Bookable (non-blocked) slots already saved on this listing. */
  bookableSlotCount?: number;
  onSubmit: (payload: {
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
    compareAtPricePerPersonMinor?: number | null;
    heroImageUrl?: string;
    galleryUrls?: string[];
    inclusions: string[];
    exclusions: string[];
    requirements: string[];
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
  bookableSlotCount,
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
  const [mapLink, setMapLink] = useState(initial?.mapLink ?? "");
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 120);
  const initialPartyKind = initial
    ? inferExperiencePartyKind(
        initial.minGuestsPerBooking ?? 1,
        initial.maxGuestsPerBooking ?? 10,
      )
    : null;
  const [partyKind, setPartyKind] = useState<ExperiencePartyKind | null>(initialPartyKind);
  const [priceMajor, setPriceMajor] = useState(
    initial ? Math.round(initial.pricePerPersonMinor / 100) : 0,
  );
  const [compareAtMajor, setCompareAtMajor] = useState(() => {
    if (!initial?.compareAtPricePerPersonMinor) return 0;
    if (initialPartyKind === "group") {
      return groupTotalMajorFromPerPersonMinor(
        initial.compareAtPricePerPersonMinor,
        initial.minGuestsPerBooking,
      );
    }
    return Math.round(initial.compareAtPricePerPersonMinor / 100);
  });
  const [photoUrls, setPhotoUrls] = useState(() => {
    const existing = initial?.galleryUrls?.length
      ? initial.galleryUrls
      : initial?.heroImageUrl
        ? [initial.heroImageUrl]
        : [];
    return existing;
  });
  const [groupMembers, setGroupMembers] = useState(
    initialPartyKind === "group" ? (initial?.minGuestsPerBooking ?? 2) : 2,
  );
  const [groupTotalMajor, setGroupTotalMajor] = useState(
    initialPartyKind === "group" && initial
      ? groupTotalMajorFromPerPersonMinor(
          initial.pricePerPersonMinor,
          initial.minGuestsPerBooking,
        )
      : 0,
  );
  const [inclusions, setInclusions] = useState(joinLines(initial?.inclusions ?? []));
  const [exclusions, setExclusions] = useState(joinLines(initial?.exclusions ?? []));
  const [requirements, setRequirements] = useState(joinLines(initial?.requirements ?? []));
  const [maxGuests, setMaxGuests] = useState(
    initialPartyKind === "group" ? 10 : (initial?.maxGuestsPerBooking ?? 10),
  );
  const [submitForReview, setSubmitForReview] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  const status = initial?.status ?? "draft";
  const canSubmitForReview = status === "draft" || status === "rejected";
  const resolvedSlotCount =
    bookableSlotCount ??
    (initial?.slots?.filter((slot) => !slot.isBlocked).length ?? 0);
  const canSubmitWithSlots = resolvedSlotCount > 0;

  const cityName =
    cities.find((city) => city.slug === citySlug)?.name ??
    cities[0]?.name ??
    "Mysuru";

  const inputClass =
    "mt-1 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm";
  const numberInputClass = `${inputClass} input-no-spin`;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitForReview && !canSubmitWithSlots) {
      return;
    }
    const galleryUrls = photoUrls.map((url) => url.trim()).filter(Boolean);
    const pricing = resolveExperiencePartyPricing({
      partyKind,
      priceMajor,
      maxGuests,
      groupMembers,
      groupTotalMajor,
    });
    if (!pricing.ok) {
      setPricingError(pricing.error);
      return;
    }
    setPricingError(null);
    const compareAtPricePerPersonMinor =
      compareAtMajor > 0
        ? partyKind === "group"
          ? perPersonMinorFromGroupTotal(compareAtMajor, groupMembers)
          : compareAtMajor * 100
        : null;
    onSubmit({
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
      pricePerPersonMinor: pricing.pricePerPersonMinor,
      compareAtPricePerPersonMinor,
      heroImageUrl: galleryUrls[0],
      galleryUrls,
      inclusions: splitLines(inclusions),
      exclusions: splitLines(exclusions),
      requirements: splitLines(requirements),
      minGuestsPerBooking: pricing.minGuests,
      maxGuestsPerBooking: pricing.maxGuests,
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
          <label className="sm:col-span-2 text-sm">
            <span className="eyebrow text-muted-foreground">Map link</span>
            <input
              type="url"
              disabled={readOnly}
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.google.com/..."
              className={inputClass}
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Google Maps or Apple Maps link so guests can get directions.
            </span>
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
              className={numberInputClass}
            />
          </label>
          <ExperiencePartyPricingFields
            partyKind={partyKind}
            onPartyKindChange={setPartyKind}
            priceMajor={priceMajor}
            onPriceMajorChange={setPriceMajor}
            maxGuests={maxGuests}
            onMaxGuestsChange={setMaxGuests}
            groupMembers={groupMembers}
            onGroupMembersChange={setGroupMembers}
            groupTotalMajor={groupTotalMajor}
            onGroupTotalMajorChange={setGroupTotalMajor}
            compareAtMajor={compareAtMajor}
            onCompareAtMajorChange={setCompareAtMajor}
            showCompareAt
            disabled={readOnly}
            labelClass="text-muted-foreground"
            inputClass={inputClass}
            numberInputClass={numberInputClass}
            hintClass="mt-1 block text-xs text-muted-foreground"
            optionClass="border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 text-foreground"
            optionActiveClass="border-ember bg-ember/10 text-foreground"
          />
        </div>
      </div>

      <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8 space-y-5">
        <h3 className="font-display text-xl">Photos</h3>
        <p className="text-sm text-muted-foreground">
          Upload multiple images. The first photo is the cover; guests can browse all photos on the
          experience page.
        </p>
        <ExperiencePhotoGallery
          photoUrls={photoUrls}
          onChange={setPhotoUrls}
          readOnly={readOnly}
          inputClass={inputClass}
        />
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
      </div>

      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-4">
          {pricingError ? (
            <p className="w-full text-sm text-destructive">{pricingError}</p>
          ) : null}
          {canSubmitForReview ? (
            <div className="w-full space-y-2 sm:w-auto sm:flex-1">
              <label
                className={`flex items-center gap-2 text-sm ${!canSubmitWithSlots ? "opacity-70" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={submitForReview && canSubmitWithSlots}
                  disabled={!canSubmitWithSlots}
                  onChange={(e) => setSubmitForReview(e.target.checked)}
                />
                Submit for admin review after saving
              </label>
              {!canSubmitWithSlots ? (
                <p className="text-xs text-muted-foreground">
                  Add at least one bookable session under Session timings before submitting for review.
                </p>
              ) : null}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={saving || (submitForReview && !canSubmitWithSlots)}
            className="rounded-sm bg-ember px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-60"
          >
            {saving ? "Saving…" : initial ? "Save changes" : "Create experience"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
