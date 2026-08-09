import { Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createEmptyDay,
  createEmptyStop,
  DEFAULT_MYSORE_TRAIL,
  MYSORE_TRAIL_STORAGE_KEY,
  normalizeMysoreTrail,
  type MysoreTrailItinerary,
  type TrailDay,
  type TrailStop,
} from "@/data/mysore-trail";
import { saveMysoreTrail } from "@/lib/mysore-trail-fns";

export type MysoreTrailBuilderMode = "view" | "guest" | "publish";

type MysoreTrailBuilderProps = {
  /** Published trail from the server (or default). */
  initial: MysoreTrailItinerary;
  /**
   * view — read-only published trail
   * guest — personal draft on this device
   * publish — editor/admin CMS edit (saves to platform for everyone)
   */
  mode: MysoreTrailBuilderMode;
  accessToken?: string | null;
  onPublished?: (itinerary: MysoreTrailItinerary) => void;
};

function loadGuestDraft(fallback: MysoreTrailItinerary): MysoreTrailItinerary {
  if (typeof window === "undefined") return structuredClone(fallback);
  try {
    const raw = window.localStorage.getItem(MYSORE_TRAIL_STORAGE_KEY);
    if (!raw) return structuredClone(fallback);
    return normalizeMysoreTrail(JSON.parse(raw));
  } catch {
    return structuredClone(fallback);
  }
}

export function MysoreTrailBuilder({
  initial,
  mode,
  accessToken,
  onPublished,
}: MysoreTrailBuilderProps) {
  const editable = mode !== "view";
  const [itinerary, setItinerary] = useState<MysoreTrailItinerary>(() =>
    structuredClone(initial),
  );
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "guest") {
      setItinerary(loadGuestDraft(initial));
    } else {
      setItinerary(structuredClone(initial));
    }
    setHydrated(true);
  }, [initial, mode]);

  useEffect(() => {
    if (!hydrated || mode !== "guest") return;
    window.localStorage.setItem(MYSORE_TRAIL_STORAGE_KEY, JSON.stringify(itinerary));
  }, [itinerary, hydrated, mode]);

  const updateDay = (dayId: string, patch: Partial<TrailDay>) => {
    if (!editable) return;
    setItinerary((prev) => ({
      ...prev,
      days: prev.days.map((day) => (day.id === dayId ? { ...day, ...patch } : day)),
    }));
  };

  const updateStop = (dayId: string, stopId: string, patch: Partial<TrailStop>) => {
    if (!editable) return;
    setItinerary((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id !== dayId
          ? day
          : {
              ...day,
              stops: day.stops.map((stop) =>
                stop.id === stopId ? { ...stop, ...patch } : stop,
              ),
            },
      ),
    }));
  };

  const addDay = () => {
    if (!editable) return;
    setItinerary((prev) => ({
      ...prev,
      days: [...prev.days, createEmptyDay(prev.days.length + 1)],
    }));
  };

  const removeDay = (dayId: string) => {
    if (!editable) return;
    setItinerary((prev) => ({
      ...prev,
      days: prev.days
        .filter((day) => day.id !== dayId)
        .map((day, index) => ({
          ...day,
          label: day.label.startsWith("Day ") ? `Day ${index + 1}` : day.label,
        })),
    }));
  };

  const addStop = (dayId: string) => {
    if (!editable) return;
    setItinerary((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id === dayId ? { ...day, stops: [...day.stops, createEmptyStop()] } : day,
      ),
    }));
  };

  const removeStop = (dayId: string, stopId: string) => {
    if (!editable) return;
    setItinerary((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id !== dayId
          ? day
          : { ...day, stops: day.stops.filter((stop) => stop.id !== stopId) },
      ),
    }));
  };

  const resetTrail = () => {
    if (!editable) return;
    setItinerary(structuredClone(mode === "guest" ? initial : DEFAULT_MYSORE_TRAIL));
  };

  const markSavedLocal = () => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  };

  const publishTrail = async () => {
    if (mode !== "publish" || !accessToken) {
      setError("Sign in as an editor or admin to publish.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveMysoreTrail({ data: { accessToken, itinerary } });
      onPublished?.(itinerary);
      markSavedLocal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish trail.");
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = editable
    ? "border-0 bg-transparent outline-none"
    : "border-0 bg-transparent outline-none pointer-events-none";

  return (
    <div className="mt-10 space-y-10 sm:mt-14">
      {mode === "publish" ? (
        <p className="max-w-2xl text-sm text-muted-foreground">
          You are editing the <strong className="font-medium text-ink">published</strong> Mysore
          Trail. Changes go live for every visitor when you publish.
        </p>
      ) : null}
      {mode === "guest" ? (
        <p className="max-w-2xl text-sm text-muted-foreground">
          This is your personal draft on this device. The published trail above is curated by Royal
          Passage — browse it, then shape your own days here.
        </p>
      ) : null}

      <div className="max-w-2xl space-y-4">
        <label className="block">
          <span className="eyebrow text-muted-foreground">Trail name</span>
          {editable ? (
            <input
              value={itinerary.title}
              onChange={(e) => setItinerary((prev) => ({ ...prev, title: e.target.value }))}
              className={`mt-2 w-full border-b border-ink/15 pb-2 font-display text-3xl text-ink transition-colors placeholder:text-ink/25 focus:border-ember sm:text-4xl ${fieldClass}`}
              placeholder="Mysore Trail"
            />
          ) : (
            <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{itinerary.title}</h2>
          )}
        </label>
        {editable ? (
          <label className="block">
            <span className="sr-only">Subtitle</span>
            <textarea
              value={itinerary.subtitle}
              onChange={(e) => setItinerary((prev) => ({ ...prev, subtitle: e.target.value }))}
              rows={2}
              className={`w-full resize-none text-sm leading-relaxed text-muted-foreground placeholder:text-muted-foreground/50 focus:text-ink sm:text-base ${fieldClass}`}
              placeholder="A short line about the pace of this trail…"
            />
          </label>
        ) : itinerary.subtitle ? (
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {itinerary.subtitle}
          </p>
        ) : null}
      </div>

      <ol className="space-y-12">
        {itinerary.days.map((day, dayIndex) => (
          <li key={day.id} className="relative border-t border-ink/10 pt-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-ember text-sm tracking-[0.18em] uppercase">
                    {String(dayIndex + 1).padStart(2, "0")}
                  </span>
                  {editable ? (
                    <input
                      value={day.label}
                      onChange={(e) => updateDay(day.id, { label: e.target.value })}
                      className={`min-w-0 flex-1 font-display text-2xl text-ink sm:text-3xl ${fieldClass}`}
                      aria-label="Day label"
                    />
                  ) : (
                    <h3 className="font-display text-2xl text-ink sm:text-3xl">{day.label}</h3>
                  )}
                </div>
                {editable ? (
                  <input
                    value={day.theme}
                    onChange={(e) => updateDay(day.id, { theme: e.target.value })}
                    className={`w-full max-w-md text-sm text-muted-foreground placeholder:text-muted-foreground/40 ${fieldClass}`}
                    placeholder="Theme — e.g. Royal heart, Hills & craft"
                    aria-label="Day theme"
                  />
                ) : day.theme ? (
                  <p className="text-sm text-muted-foreground">{day.theme}</p>
                ) : null}
              </div>
              {editable && itinerary.days.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeDay(day.id)}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`Remove ${day.label}`}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Remove day
                </button>
              ) : null}
            </div>

            <ul className="mt-6 space-y-5">
              {day.stops.map((stop) => (
                <li
                  key={stop.id}
                  className="grid gap-3 border-l-2 border-ember/35 pl-4 sm:grid-cols-[5.5rem_1fr_auto] sm:items-start sm:gap-4"
                >
                  {editable ? (
                    <input
                      type="time"
                      value={stop.time}
                      onChange={(e) => updateStop(day.id, stop.id, { time: e.target.value })}
                      className={`w-full text-sm font-medium tabular-nums text-ink sm:pt-1 ${fieldClass}`}
                      aria-label="Stop time"
                    />
                  ) : (
                    <span className="text-sm font-medium tabular-nums text-ink sm:pt-1">
                      {stop.time}
                    </span>
                  )}
                  <div className="min-w-0 space-y-2">
                    {editable ? (
                      <>
                        <input
                          value={stop.title}
                          onChange={(e) => updateStop(day.id, stop.id, { title: e.target.value })}
                          className={`w-full font-medium text-ink placeholder:text-ink/30 ${fieldClass}`}
                          placeholder="Place or experience"
                          aria-label="Stop title"
                        />
                        <textarea
                          value={stop.note}
                          onChange={(e) => updateStop(day.id, stop.id, { note: e.target.value })}
                          rows={2}
                          className={`w-full resize-none text-sm leading-relaxed text-muted-foreground placeholder:text-muted-foreground/40 ${fieldClass}`}
                          placeholder="A note for this stop…"
                          aria-label="Stop note"
                        />
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-ink">{stop.title || "Untitled stop"}</p>
                        {stop.note ? (
                          <p className="text-sm leading-relaxed text-muted-foreground">{stop.note}</p>
                        ) : null}
                      </>
                    )}
                  </div>
                  {editable && day.stops.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeStop(day.id, stop.id)}
                      className="justify-self-end text-muted-foreground transition-colors hover:text-destructive sm:pt-1"
                      aria-label="Remove stop"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>

            {editable ? (
              <button
                type="button"
                onClick={() => addStop(day.id)}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ember transition-colors hover:text-ink"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Add stop
              </button>
            ) : null}
          </li>
        ))}
      </ol>

      {editable ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 pt-8">
          <button
            type="button"
            onClick={addDay}
            className="inline-flex items-center gap-2 rounded-sm bg-ember px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add day
          </button>
          {mode === "publish" ? (
            <button
              type="button"
              onClick={() => {
                void publishTrail();
              }}
              disabled={saving || !accessToken}
              className="inline-flex items-center rounded-sm border border-ink/15 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:border-ember/50 hover:text-ember disabled:opacity-50"
            >
              {saving ? "Publishing…" : savedFlash ? "Published" : "Publish trail"}
            </button>
          ) : (
            <button
              type="button"
              onClick={markSavedLocal}
              className="inline-flex items-center rounded-sm border border-ink/15 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:border-ember/50 hover:text-ember"
            >
              {savedFlash ? "Saved on this device" : "Save draft"}
            </button>
          )}
          <button
            type="button"
            onClick={resetTrail}
            className="text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-ink"
          >
            Reset
          </button>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <p className="max-w-xl text-sm text-muted-foreground">
        Ready to book a stop? Browse{" "}
        <Link to="/experiences" className="text-ember underline-offset-2 hover:underline">
          experiences
        </Link>{" "}
        and{" "}
        <Link to="/homestays" className="text-ember underline-offset-2 hover:underline">
          homestays
        </Link>
        .
      </p>
    </div>
  );
}
