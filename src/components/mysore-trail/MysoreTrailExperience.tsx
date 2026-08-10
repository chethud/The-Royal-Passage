import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { WheelDestination } from "@/components/mysore-trail/ImageWheel3D";
import { TrailCircularPanel } from "@/components/mysore-trail/TrailCircularPanel";
import { ItineraryStopCard } from "@/components/mysore-trail/ItineraryStopCard";
import { TripConfigurator } from "@/components/mysore-trail/TripConfigurator";
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
  const [planning, setPlanning] = useState(false);
  const [customized, setCustomized] = useState(false);
  const [journeyLocked, setJourneyLocked] = useState(false);
  const activeStopIdRef = useRef(activeStopId);
  const stopsRef = useRef(stops);
  const journeyLockedRef = useRef(false);
  activeStopIdRef.current = activeStopId;
  stopsRef.current = stops;
  journeyLockedRef.current = journeyLocked;

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

  const wheelItems: WheelDestination[] = useMemo(() => {
    return stops.map((stop) => {
      const place = getPlace(stop.placeId);
      const dayMeta = days.find((d) => d.day === stop.day);
      return {
        id: `${stop.id}-${place.id}`,
        stopId: stop.id,
        image: place.image,
        imageAlt: place.imageAlt,
        name: place.name,
        shortName: place.shortName,
        cityLabel: place.cityLabel,
        day: stop.day,
        dayTitle: dayMeta?.title ?? "Royal Mysuru",
      };
    });
  }, [stops, days]);

  /**
   * Soft-lock the hero visually once the journey docks — never clamp scroll.
   */
  useEffect(() => {
    const journey = document.getElementById("trail-journey");
    if (!journey) return;

    const headerH = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-height");
      const n = Number.parseFloat(raw);
      return Number.isFinite(n) ? n : 80;
    };

    const onScroll = () => {
      const h = headerH();
      const jTop = journey.getBoundingClientRect().top;
      if (jTop <= h + 10) {
        if (!journeyLockedRef.current) setJourneyLocked(true);
      } else if (jTop > h + 120) {
        if (journeyLockedRef.current) setJourneyLocked(false);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /**
   * Scroll-spy: stop whose center is nearest the viewport middle
   * (matches centered text + centered photo).
   */
  useEffect(() => {
    const pickActiveFromScroll = () => {
      const list = stopsRef.current;
      if (list.length === 0) return;

      const headerRaw = getComputedStyle(document.documentElement).getPropertyValue(
        "--header-height",
      );
      const headerH = Number.parseFloat(headerRaw) || 80;
      const focusY = headerH + (window.innerHeight - headerH) * 0.5;

      let bestId: string | null = null;
      let bestDist = Number.POSITIVE_INFINITY;

      for (const stop of list) {
        const article = document.querySelector<HTMLElement>(`[data-stop-id="${stop.id}"]`);
        if (!article) continue;
        const rect = article.getBoundingClientRect();
        const mid = rect.top + rect.height * 0.5;
        const dist = Math.abs(mid - focusY);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = stop.id;
        }
      }

      const nextId = bestId ?? list[0]?.id ?? null;
      if (nextId && nextId !== activeStopIdRef.current) {
        setActiveStopId(nextId);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        pickActiveFromScroll();
      });
    };

    pickActiveFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [stops]);

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

  let globalStopIndex = 0;

  return (
    <div
      className={`trail-page${journeyLocked ? " trail-page--journey-locked" : ""}${planning ? " trail-page--planning" : ""}`}
    >
      <section className={`trail-hero${journeyLocked ? " is-locked" : ""}`} aria-hidden={journeyLocked || undefined}>
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
            <button type="button" className="trail-btn-ghost" onClick={() => setPlanning(true)}>
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

      <div className="trail-collage-mobile lg:hidden">
        <TrailCircularPanel
          items={wheelItems}
          activeIndex={activeIndexInAll}
          totalDays={days.length}
          showTripDetails={planning}
        />
      </div>

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
            const isActiveDay = day.day === activeStop?.day;
            return (
              <div
                key={day.day}
                id={`day-${day.day}`}
                className={`trail-day-block${isActiveDay ? " is-active-day" : " is-other-day"}`}
              >
                {planning && isActiveDay ? (
                  <header className="trail-day-head">
                    <p className="eyebrow text-[#C9A45C]">
                      Day {String(day.day).padStart(2, "0")}
                    </p>
                    <h2>{day.title}</h2>
                    <p>{day.theme}</p>
                  </header>
                ) : null}
                {list.map((stop, i) => {
                  const gIdx = globalStopIndex;
                  globalStopIndex += 1;
                  const focus =
                    gIdx === activeIndexInAll
                      ? "active"
                      : gIdx === activeIndexInAll - 1
                        ? "prev"
                        : gIdx === activeIndexInAll + 1
                          ? "next"
                          : "far";
                  return (
                    <ItineraryStopCard
                      key={stop.id}
                      stop={stop}
                      indexInDay={i}
                      dayStopCount={list.length}
                      globalIndex={gIdx}
                      active={stop.id === activeStopId}
                      focus={focus}
                      nextStop={list[i + 1]}
                      showTripDetails={planning}
                    />
                  );
                })}
              </div>
            );
          })}

          <aside className="trail-recs">
            <p className="eyebrow text-[#C9A45C]">You may also like</p>
            <h3 className="font-display text-2xl text-[#F4EBDD]">
              While you are at {activePlace.shortName}
            </h3>
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
          <TrailCircularPanel
            items={wheelItems}
            activeIndex={activeIndexInAll}
            totalDays={days.length}
            showTripDetails={planning}
          />
        </aside>
      </section>

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
            <button type="button" className="trail-btn-ghost" onClick={() => setPlanning(true)}>
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
