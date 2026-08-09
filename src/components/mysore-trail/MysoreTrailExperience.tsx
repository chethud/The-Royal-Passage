import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ItineraryStopCard } from "@/components/mysore-trail/ItineraryStopCard";
import { StickyImagePanel } from "@/components/mysore-trail/StickyImagePanel";
import {
  TripConfigurator,
} from "@/components/mysore-trail/TripConfigurator";
import {
  DEFAULT_PREFERENCES,
  getPlace,
  type TrailDay,
  type TrailStop,
  type TripPreferences,
} from "@/data/mysore-trail-journey";
import {
  buildPersonalizedTrail,
  getDefaultTrail,
  getRecommendationsForStop,
  summarizeTrail,
} from "@/lib/mysore-trail-personalize";

/** Mysuru street — Devaraja Market heritage façade */
const MYSORE_STREET_HERO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Devaraja_Market_1.jpg/1280px-Devaraja_Market_1.jpg";

type MysoreTrailExperienceProps = {
  canEdit?: boolean;
  initialPlaceId?: string;
};

export function MysoreTrailExperience({
  canEdit = false,
  initialPlaceId,
}: MysoreTrailExperienceProps) {
  const defaults = useMemo(() => getDefaultTrail(), []);
  const [prefs, setPrefs] = useState<TripPreferences>(DEFAULT_PREFERENCES);
  const [days, setDays] = useState<TrailDay[]>(defaults.days);
  const [stops, setStops] = useState<TrailStop[]>(defaults.stops);
  const [activeStopId, setActiveStopId] = useState(defaults.stops[0]?.id ?? "");
  const [imageDirection, setImageDirection] = useState<1 | -1>(1);
  const [planning, setPlanning] = useState(false);
  const [customized, setCustomized] = useState(false);
  const activeStopIdRef = useRef(activeStopId);
  const stopsRef = useRef(stops);
  activeStopIdRef.current = activeStopId;
  stopsRef.current = stops;

  const applyPrefs = useCallback((next: TripPreferences) => {
    const built = buildPersonalizedTrail(next);
    setPrefs(next);
    setDays(built.days);
    setStops(built.stops);
    setActiveStopId(built.stops[0]?.id ?? "");
    setCustomized(true);
    setPlanning(true);
    toast.message("Your Royal Trail is ready", {
      description: `${next.days}-day passage shaped around your interests.`,
    });
    requestAnimationFrame(() => {
      document.getElementById("trail-map")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const resetDefault = useCallback(() => {
    const fresh = getDefaultTrail();
    setPrefs(DEFAULT_PREFERENCES);
    setDays(fresh.days);
    setStops(fresh.stops);
    setActiveStopId(fresh.stops[0]?.id ?? "");
    setCustomized(false);
    setPlanning(false);
    toast.message("Curated Mysore Trail restored");
  }, []);

  const selectPlannedStop = useCallback((stopId: string, placeId: string) => {
    setActiveStopId(stopId);
    requestAnimationFrame(() => {
      document.getElementById(placeId)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, []);

  useEffect(() => {
    if (!initialPlaceId) return;
    const match = stops.find((s) => s.placeId === initialPlaceId);
    if (match) {
      setActiveStopId(match.id);
      requestAnimationFrame(() => {
        document.getElementById(initialPlaceId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [initialPlaceId, stops]);

  useEffect(() => {
    if (!planning) return;
    const id = window.setTimeout(() => {
      document.getElementById("trail-config")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(id);
  }, [planning]);

  const activeStop = stops.find((s) => s.id === activeStopId) ?? stops[0];
  const activePlace = getPlace(activeStop?.placeId ?? "mysuru-palace");
  const activeDay = days.find((d) => d.day === activeStop?.day);
  const dayStops = stops.filter((s) => s.day === activeStop?.day);
  const activeIndexInAll = Math.max(0, stops.findIndex((s) => s.id === activeStop?.id));
  const dayProgress = dayStops.length
    ? Math.round(
        ((dayStops.findIndex((s) => s.id === activeStop?.id) + 1) / dayStops.length) * 100,
      )
    : 0;

  const visited = useMemo(() => {
    const idx = stops.findIndex((s) => s.id === activeStopId);
    return new Set(stops.slice(0, Math.max(0, idx)).map((s) => s.placeId));
  }, [activeStopId, stops]);

  const recommendations = useMemo(
    () => getRecommendationsForStop(activePlace.id, visited, prefs, 4),
    [activePlace.id, visited, prefs],
  );

  const summary = useMemo(() => summarizeTrail(stops), [stops]);

  const onVisible = useCallback((stopId: string) => {
    if (stopId === activeStopIdRef.current) return;
    const prevIdx = stopsRef.current.findIndex((s) => s.id === activeStopIdRef.current);
    const nextIdx = stopsRef.current.findIndex((s) => s.id === stopId);
    if (nextIdx >= 0 && prevIdx >= 0) {
      setImageDirection(nextIdx >= prevIdx ? 1 : -1);
    }
    setActiveStopId(stopId);
  }, []);

  const addToTrail = (placeId: string) => {
    if (stops.some((s) => s.placeId === placeId)) {
      toast.message("Already on your trail");
      return;
    }
    const last = stops[stops.length - 1];
    const day = last?.day ?? 1;
    const place = getPlace(placeId);
    const newStop: TrailStop = {
      id: `extra-${placeId}-${Date.now()}`,
      placeId,
      day,
      time: "18:00",
      timeLabel: "06:00 PM",
      travelFromPrevious: {
        minutes: 25,
        distanceKm: Math.max(1, place.distanceFromCentreKm / 2),
        mode: "Auto",
      },
    };
    setStops((prev) => [...prev, newStop]);
    setDays((prev) =>
      prev.map((d) =>
        d.day === day ? { ...d, stopIds: [...d.stopIds, newStop.id] } : d,
      ),
    );
    toast.success("Added to your Royal Trail.");
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/mysore-trail?place=${activePlace.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Trail link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const saveTrail = () => {
    try {
      localStorage.setItem(
        "trp.mysore-trail.journey.v2",
        JSON.stringify({ prefs, days, stops }),
      );
      toast.success("Trail saved on this device");
    } catch {
      toast.error("Could not save trail");
    }
  };

  return (
    <div className="trail-page">
      {/* Hero */}
      <section className="trail-hero">
        <img
          src={MYSORE_STREET_HERO}
          alt="Devaraja Market street, Mysuru"
          className="trail-hero-bg"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <div className="trail-hero-veil" />
        <div className="trail-hero-inner trail-container">
          <p className="eyebrow text-[#C9A45C]">The Royal Passage</p>
          <h1 className="trail-hero-title">
            Mysore <em>Trail</em>
          </h1>
          <p className="trail-hero-sub">A Royal Journey Through Mysuru</p>
          <p className="trail-hero-desc">
            Follow the stories, palaces, markets, temples and hidden corners that make Mysuru one of
            India’s most captivating heritage cities.
          </p>
          <div className="trail-hero-actions">
            <a href="#trail-journey" className="trail-btn-primary">
              Explore the trail
            </a>
            <button
              type="button"
              className="trail-btn-ghost"
              onClick={() => setPlanning(true)}
            >
              Plan my trip
            </button>
            {canEdit ? (
              <Link to="/admin/mysore-trail" className="trail-btn-ghost">
                Edit trail
              </Link>
            ) : null}
          </div>
          <p className="trail-hero-scroll">↓ Scroll to begin</p>
        </div>
      </section>

      <TripConfigurator
        value={prefs}
        planning={planning}
        customized={customized}
        stops={stops}
        onCancelPlanning={() => setPlanning(false)}
        onApplyPlan={applyPrefs}
        onResetDefault={resetDefault}
        onSelectStop={selectPlannedStop}
      />

      {/* Day nav — only on trip plan */}
      {planning ? (
        <nav className="trail-day-nav" aria-label="Days">
          <div className="trail-container trail-day-nav-inner">
            {days.map((d) => (
              <a key={d.day} href={`#day-${d.day}`} className="trail-day-pill">
                Day {String(d.day).padStart(2, "0")}
              </a>
            ))}
          </div>
        </nav>
      ) : null}

      {/* Journey split */}
      <section className="trail-journey" id="trail-journey">
        <div className="trail-journey-left">
          {planning ? (
            <div className="trail-progress-card">
              <p>
                {dayStops.findIndex((s) => s.id === activeStop?.id) + 1} / {dayStops.length} stops
              </p>
              <p>{dayProgress}% of day completed</p>
              <div className="trail-progress-bar">
                <span style={{ width: `${dayProgress}%` }} />
              </div>
            </div>
          ) : null}

          {days.map((day) => {
            const list = day.stopIds
              .map((id) => stops.find((s) => s.id === id))
              .filter(Boolean) as TrailStop[];
            return (
              <div key={day.day} id={`day-${day.day}`} className="trail-day-block">
                <header className="trail-day-head">
                  {planning ? (
                    <p className="eyebrow text-[#C9A45C]">Day {String(day.day).padStart(2, "0")}</p>
                  ) : (
                    <p className="eyebrow text-[#C9A45C]">Along the trail</p>
                  )}
                  <h2>{day.title}</h2>
                  <p>{day.theme}</p>
                </header>
                {list.map((stop, i) => (
                  <ItineraryStopCard
                    key={stop.id}
                    stop={stop}
                    indexInDay={i}
                    dayStopCount={list.length}
                    active={stop.id === activeStopId}
                    nextStop={list[i + 1]}
                    showTripDetails={planning}
                    onVisible={onVisible}
                  />
                ))}
              </div>
            );
          })}

          {/* Recommendations */}
          <aside className="trail-recs">
            <p className="eyebrow text-[#C9A45C]">You may also like</p>
            <h3 className="font-display text-2xl text-[#F4EBDD]">While you are at {activePlace.shortName}</h3>
            <div className="trail-recs-grid">
              {recommendations.map((rec) => (
                <article key={rec.placeId} className="trail-rec-card">
                  <img
                    src={rec.place.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="trail-rec-cat">{rec.category}</p>
                    <h4>{rec.place.name}</h4>
                    <p>{rec.reason}</p>
                    {planning ? (
                      <p className="trail-rec-meta">{rec.place.distanceFromCentreKm} km from centre</p>
                    ) : null}
                    {planning ? (
                      <button type="button" onClick={() => addToTrail(rec.placeId)}>
                        Add to my trail
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>

        <aside className="trail-journey-right">
          <StickyImagePanel
            place={activePlace}
            index={activeIndexInAll}
            total={stops.length}
            dayLabel={activeDay ? `Day ${String(activeDay.day).padStart(2, "0")}` : "—"}
            showTripDetails={planning}
            direction={imageDirection}
          />
        </aside>
      </section>

      {/* Summary + share — trip plan page only */}
      {planning ? (
        <section className="trail-summary">
          <p className="eyebrow text-[#C9A45C]">Your Royal Trail</p>
          <h2 className="font-display text-3xl text-[#F4EBDD] sm:text-5xl">
            {summary.days} days · {summary.experiences}+ experiences
          </h2>
          <dl className="trail-summary-stats">
            <div>
              <dt>Distance</dt>
              <dd>{summary.km} km</dd>
            </div>
            <div>
              <dt>Experience hours</dt>
              <dd>~{summary.hours} hrs</dd>
            </div>
            <div>
              <dt>Best for</dt>
              <dd>{summary.bestFor.join(" · ")}</dd>
            </div>
          </dl>
          <div className="trail-share-card">
            <p className="eyebrow text-[#C9A45C]">The Royal Passage</p>
            <h3 className="font-display text-2xl">Mysore Trail</h3>
            <p>A {summary.days}-Day Journey Through the City of Palaces</p>
            <div className="trail-share-actions">
              <button type="button" className="trail-btn-primary" onClick={saveTrail}>
                Save my trail
              </button>
              <button type="button" className="trail-btn-ghost" onClick={() => void copyLink()}>
                Copy link
              </button>
              <button
                type="button"
                className="trail-btn-ghost"
                onClick={() => {
                  if (navigator.share) {
                    void navigator.share({
                      title: "Mysore Trail — The Royal Passage",
                      url: window.location.href,
                    });
                  } else {
                    void copyLink();
                  }
                }}
              >
                Share trail
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Finale */}
      <section className="trail-finale">
        <img
          src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=2000&q=85&auto=format&fit=crop"
          alt=""
          className="trail-finale-bg"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <div className="trail-finale-veil" />
        <div className="trail-finale-inner">
          <h2 className="font-display text-4xl sm:text-6xl">Your royal journey awaits</h2>
          <p>Some cities are visited. Mysuru is experienced.</p>
          <div className="trail-hero-actions">
            <a href="#trail-journey" className="trail-btn-primary">
              Start your Royal Trail
            </a>
            <button
              type="button"
              className="trail-btn-ghost"
              onClick={() => setPlanning(true)}
            >
              Plan my trip
            </button>
            <Link to="/experiences" className="trail-btn-ghost">
              Explore experiences
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
