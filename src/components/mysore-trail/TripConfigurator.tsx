import { useEffect, useMemo, useState } from "react";
import type {
  TrailCategory,
  TravellerType,
  TripPace,
  TripPreferences,
} from "@/data/mysore-trail-journey";

const DAY_OPTIONS = [1, 2, 3, 4, 5] as const;

const TRAVELLER_OPTIONS: { id: TravellerType; label: string }[] = [
  { id: "solo", label: "Solo" },
  { id: "couple", label: "Couple" },
  { id: "family", label: "Family" },
  { id: "friends", label: "Friends" },
];

const STYLE_OPTIONS: { id: TrailCategory; label: string }[] = [
  { id: "heritage", label: "Heritage" },
  { id: "luxury", label: "Royal" },
  { id: "food", label: "Food" },
  { id: "nature", label: "Nature" },
  { id: "culture", label: "Culture" },
  { id: "photography", label: "Photography" },
  { id: "spiritual", label: "Spiritual" },
];

const PACE_OPTIONS: { id: TripPace; label: string }[] = [
  { id: "relaxed", label: "Relaxed" },
  { id: "balanced", label: "Balanced" },
  { id: "explorer", label: "Explorer" },
];

type TripConfiguratorProps = {
  value: TripPreferences;
  planning: boolean;
  onApply: (next: TripPreferences) => void;
  onReset: () => void;
  onCancel: () => void;
  customized: boolean;
};

export function TripConfigurator({
  value,
  planning,
  onApply,
  onReset,
  onCancel,
  customized,
}: TripConfiguratorProps) {
  const [draft, setDraft] = useState(value);
  const interestSet = useMemo(() => new Set(draft.interests), [draft.interests]);

  useEffect(() => {
    if (planning) setDraft(value);
  }, [planning, value]);

  const toggleStyle = (id: TrailCategory) => {
    const next = interestSet.has(id)
      ? draft.interests.filter((i) => i !== id)
      : [...draft.interests, id];
    setDraft({ ...draft, interests: next.length ? next : draft.interests });
  };

  if (!planning) return null;

  return (
    <section className="mt-planner" id="trail-config">
      <div className="mt-wrap">
        <header className="mt-section-head">
          <p className="mt-eyebrow">Plan your journey</p>
          <h2 className="mt-h2">Shape a trail around how you travel</h2>
          <p className="mt-lead">
            Choose length, company, and style — then generate a paced Mysuru itinerary.
          </p>
        </header>

        <div className="mt-planner-grid">
          <fieldset className="mt-field">
            <legend>Trip length</legend>
            <div className="mt-pills" role="radiogroup" aria-label="Trip length">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={draft.days === d}
                  className={`mt-pill${draft.days === d ? " is-on" : ""}`}
                  onClick={() => setDraft({ ...draft, days: d })}
                >
                  {d} Day{d > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-field">
            <legend>Traveller type</legend>
            <div className="mt-pills" role="radiogroup" aria-label="Traveller type">
              {TRAVELLER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={draft.traveller === opt.id}
                  className={`mt-pill${draft.traveller === opt.id ? " is-on" : ""}`}
                  onClick={() => setDraft({ ...draft, traveller: opt.id })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-field mt-field--wide">
            <legend>Travel style</legend>
            <div className="mt-pills" role="group" aria-label="Travel style">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={interestSet.has(opt.id)}
                  className={`mt-pill${interestSet.has(opt.id) ? " is-on" : ""}`}
                  onClick={() => toggleStyle(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-field">
            <legend>Pace</legend>
            <div className="mt-pills" role="radiogroup" aria-label="Pace">
              {PACE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={draft.pace === opt.id}
                  className={`mt-pill${draft.pace === opt.id ? " is-on" : ""}`}
                  onClick={() => setDraft({ ...draft, pace: opt.id })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-planner-actions">
          <button type="button" className="mt-btn-primary" onClick={() => onApply(draft)}>
            {customized ? "Update my trail" : "Generate my trail"}
          </button>
          <button type="button" className="mt-btn-ghost" onClick={onCancel}>
            {customized ? "Back to itinerary" : "Cancel"}
          </button>
          {customized ? (
            <button type="button" className="mt-btn-ghost" onClick={onReset}>
              Reset curated trail
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
