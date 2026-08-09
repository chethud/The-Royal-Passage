import { useEffect, useMemo, useState } from "react";
import type {
  TrailCategory,
  TrailStop,
  TravellerType,
  TripPace,
  TripPreferences,
} from "@/data/mysore-trail-journey";
import { getPlace } from "@/data/mysore-trail-journey";

const DAY_OPTIONS = [1, 2, 3, 4, 5] as const;

const TRAVELLER_OPTIONS: { id: TravellerType; label: string }[] = [
  { id: "solo", label: "Solo" },
  { id: "couple", label: "Couple" },
  { id: "family", label: "Family" },
  { id: "friends", label: "Friends" },
  { id: "luxury", label: "Luxury" },
  { id: "heritage", label: "Heritage" },
  { id: "photography", label: "Photography" },
  { id: "food", label: "Food lover" },
];

const INTEREST_OPTIONS: { id: TrailCategory; label: string }[] = [
  { id: "heritage", label: "Royal Heritage" },
  { id: "architecture", label: "Architecture" },
  { id: "food", label: "Food" },
  { id: "culture", label: "Culture" },
  { id: "nature", label: "Nature" },
  { id: "photography", label: "Photography" },
  { id: "shopping", label: "Shopping" },
  { id: "spiritual", label: "Spiritual" },
  { id: "hidden", label: "Hidden Gems" },
  { id: "family", label: "Family" },
];

const PACE_OPTIONS: { id: TripPace; label: string }[] = [
  { id: "relaxed", label: "Relaxed" },
  { id: "balanced", label: "Balanced" },
  { id: "explorer", label: "Explorer" },
];

type TripPlannerFieldsProps = {
  value: TripPreferences;
  onChange: (next: TripPreferences) => void;
};

function TripPlannerFields({ value, onChange }: TripPlannerFieldsProps) {
  const interestSet = useMemo(() => new Set(value.interests), [value.interests]);

  const toggleInterest = (id: TrailCategory) => {
    const next = interestSet.has(id)
      ? value.interests.filter((i) => i !== id)
      : [...value.interests, id];
    onChange({ ...value, interests: next.length ? next : value.interests });
  };

  return (
    <>
      <div className="trail-config-block">
        <h3>Trip length</h3>
        <div className="trail-chip-row">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={`trail-chip${value.days === d ? " is-on" : ""}`}
              onClick={() => onChange({ ...value, days: d })}
            >
              {d} Day{d > 1 ? "s" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="trail-config-block">
        <h3>Traveller type</h3>
        <div className="trail-chip-row">
          {TRAVELLER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`trail-chip${value.traveller === opt.id ? " is-on" : ""}`}
              onClick={() => onChange({ ...value, traveller: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="trail-config-block">
        <h3>Interests</h3>
        <div className="trail-chip-row">
          {INTEREST_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`trail-chip${interestSet.has(opt.id) ? " is-on" : ""}`}
              onClick={() => toggleInterest(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="trail-config-block">
        <h3>Pace</h3>
        <div className="trail-chip-row">
          {PACE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`trail-chip${value.pace === opt.id ? " is-on" : ""}`}
              onClick={() => onChange({ ...value, pace: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

type TripRouteListProps = {
  stops: TrailStop[];
  onSelectStop: (stopId: string, placeId: string) => void;
};

function TripRouteList({ stops, onSelectStop }: TripRouteListProps) {
  return (
    <section className="trail-map trail-map--in-plan" id="trail-map">
      <p className="eyebrow text-[#C9A45C]">Your trip plan</p>
      <h3 className="font-display text-2xl text-[#F4EBDD] sm:text-3xl">Route through Mysuru</h3>
      <ol className="trail-map-list">
        {stops.map((stop, i) => {
          const place = getPlace(stop.placeId);
          return (
            <li key={stop.id}>
              <button type="button" onClick={() => onSelectStop(stop.id, place.id)}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{place.name}</span>
                <span>{stop.timeLabel}</span>
              </button>
              {i < stops.length - 1 ? (
                <span className="trail-map-arrow" aria-hidden>
                  ↓
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

type TripConfiguratorProps = {
  value: TripPreferences;
  planning: boolean;
  customized: boolean;
  stops: TrailStop[];
  onCancelPlanning: () => void;
  onApplyPlan: (next: TripPreferences) => void;
  onResetDefault: () => void;
  onSelectStop: (stopId: string, placeId: string) => void;
};

/** Plan my trip page only — itinerary uses hero CTAs. */
export function TripConfigurator({
  value,
  planning,
  customized,
  stops,
  onCancelPlanning,
  onApplyPlan,
  onResetDefault,
  onSelectStop,
}: TripConfiguratorProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (planning) setDraft(value);
  }, [planning, value]);

  if (!planning) return null;

  return (
    <section className="trail-config trail-config--planning" id="trail-config">
      <div className="trail-config-intro">
        <p className="eyebrow text-[#C9A45C]">Plan your trip</p>
        <h2 className="font-display text-3xl text-[#F4EBDD] sm:text-4xl">
          {customized ? "Your trip plan" : "Build your passage"}
        </h2>
        <p className="mt-3 max-w-xl text-sm text-[#F4EBDD]/70">
          {customized
            ? "Your route, times, and days — adjust preferences below anytime, or return to the itinerary."
            : "Choose length, traveller style, and interests — then generate a trail shaped around what you love."}
        </p>
      </div>

      <TripPlannerFields value={draft} onChange={setDraft} />

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="trail-btn-primary" onClick={() => onApplyPlan(draft)}>
          {customized ? "Update my trail" : "Generate my trail"}
        </button>
        <button type="button" className="trail-btn-ghost" onClick={onCancelPlanning}>
          {customized ? "Back to itinerary" : "Cancel"}
        </button>
        {customized ? (
          <button type="button" className="trail-config-cta" onClick={onResetDefault}>
            Reset to curated trail
          </button>
        ) : null}
      </div>

      {customized ? <TripRouteList stops={stops} onSelectStop={onSelectStop} /> : null}
    </section>
  );
}

type PersonalizeModalProps = {
  open: boolean;
  value: TripPreferences;
  onClose: () => void;
  onApply: (next: TripPreferences) => void;
};

export function PersonalizeModal({ open, value, onClose, onApply }: PersonalizeModalProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  if (!open) return null;

  return (
    <div className="trail-modal" role="dialog" aria-modal="true" aria-labelledby="trail-modal-title">
      <button type="button" className="trail-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="trail-modal-panel">
        <p className="eyebrow text-[#C9A45C]">Royal Passage</p>
        <h2 id="trail-modal-title" className="font-display text-3xl text-[#F4EBDD]">
          Plan your trip
        </h2>
        <p className="mt-2 text-sm text-[#F4EBDD]/70">
          How many days? What kind of traveller are you? What do you love?
        </p>

        <div className="trail-config trail-config--modal">
          <TripPlannerFields value={draft} onChange={setDraft} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="trail-btn-primary"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Generate my Royal Mysuru Trail
          </button>
          <button type="button" className="trail-btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
