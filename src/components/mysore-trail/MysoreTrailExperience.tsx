import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ItineraryStopCard } from "@/components/mysore-trail/ItineraryStopCard";
import { TrailHeroDiscovery } from "@/components/mysore-trail/TrailHeroDiscovery";
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

const FINALE_IMAGE =
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=2000&q=85&auto=format&fit=crop";

const CATEGORY_FILTERS = [
  "All",
  "Heritage",
  "Culture",
  "Food",
  "Nature",
  "History",
  "Shopping",
  "Hidden",
] as const;

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
  const [discoverFilter, setDiscoverFilter] = useState<(typeof CATEGORY_FILTERS)[number]>("All");
  const scrollPlannerIntoView = useRef(false);
  const activeStopIdRef = useRef(activeStopId);
  activeStopIdRef.current = activeStopId;

  const startPlanning = useCallback(() => {
    scrollPlannerIntoView.current = true;
    setPlanning(true);
  }, []);

  const applyPrefs = useCallback((next: TripPreferences) => {
    const built = buildPersonalizedTrail(next);
    setPrefs(next);
    setDays(built.days);
    setStops(built.stops);
    setActiveStopId(built.stops[0]?.id ?? "");
    setCustomized(true);
    scrollPlannerIntoView.current = false;
    setPlanning(true);
    toast.message("Your Mysore Trail is ready", {
      description: `${next.days}-day journey shaped around your interests.`,
    });
    requestAnimationFrame(() => {
      document.getElementById("trail-journey")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  useEffect(() => {
    if (!planning || !scrollPlannerIntoView.current) return;
    scrollPlannerIntoView.current = false;
    const id = window.setTimeout(() => {
      document.getElementById("trail-config")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(id);
  }, [planning]);

  /** Pick the stop whose center is nearest the sticky focus line — keeps image in sync */
  useEffect(() => {
    const pickActive = () => {
      const list = stops;
      if (list.length === 0) return;

      const headerRaw = getComputedStyle(document.documentElement).getPropertyValue(
        "--header-height",
      );
      const headerH = Number.parseFloat(headerRaw) || 80;
      const dayNav = document.querySelector(".mt-day-nav");
      const dayNavH = dayNav?.getBoundingClientRect().height ?? 0;
      const focusY = headerH + dayNavH + (window.innerHeight - headerH - dayNavH) * 0.38;

      let bestId: string | null = null;
      let bestDist = Number.POSITIVE_INFINITY;

      for (const stop of list) {
        const article = document.querySelector<HTMLElement>(`[data-stop-id="${stop.id}"]`);
        if (!article) continue;
        const rect = article.getBoundingClientRect();
        if (rect.height === 0) continue;
        const mid = rect.top + rect.height * 0.35;
        const dist = Math.abs(mid - focusY);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = stop.id;
        }
      }

      if (bestId && bestId !== activeStopIdRef.current) {
        setActiveStopId(bestId);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        pickActive();
      });
    };

    pickActive();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [stops]);

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

  const activeStop = stops.find((s) => s.id === activeStopId) ?? stops[0];
  const activePlace = getPlace(activeStop?.placeId ?? "mysuru-palace");

  const visited = useMemo(() => {
    const idx = stops.findIndex((s) => s.id === activeStopId);
    return new Set(stops.slice(0, Math.max(0, idx)).map((s) => s.placeId));
  }, [activeStopId, stops]);

  const recommendations = useMemo(
    () => getRecommendationsForStop(activePlace.id, visited, prefs, 4),
    [activePlace.id, visited, prefs],
  );

  const summary = useMemo(() => summarizeTrail(stops), [stops]);

  const categoryKey = useMemo(() => {
    if (discoverFilter === "All") return null;
    const map: Record<string, string> = {
      heritage: "heritage",
      culture: "culture",
      food: "food",
      nature: "nature",
      history: "heritage",
      shopping: "shopping",
      hidden: "hidden",
    };
    return map[discoverFilter.toLowerCase()] ?? null;
  }, [discoverFilter]);

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
      prev.map((d) => (d.day === day ? { ...d, stopIds: [...d.stopIds, newStop.id] } : d)),
    );
    toast.success("Added to your trail");
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

  const downloadItinerary = () => {
    const lines = stops.map((s, i) => {
      const p = getPlace(s.placeId);
      return `${i + 1}. Day ${s.day} · ${s.timeLabel} · ${p.name}`;
    });
    const blob = new Blob(
      [`Mysore Trail — The Royal Passage\n\n${lines.join("\n")}\n`],
      { type: "text/plain" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mysore-trail-itinerary.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  let globalStopIndex = 0;

  return (
    <div className="mt-page">
      <TrailHeroDiscovery onExploreTrail={() => setPlanning(false)} />

      {/* Planner — only in Plan my journey mode */}
      <TripConfigurator
        value={prefs}
        planning={planning}
        onApply={applyPrefs}
        onReset={resetDefault}
        onCancel={() => setPlanning(false)}
        customized={customized}
      />

      {/* Itinerary — each stop is a photo card with text overlaid on the image */}
      <section className="mt-itinerary" id="trail-journey">
        <div className="mt-wrap">
          <header className="mt-section-head">
            <p className="mt-eyebrow">
              {planning ? "Your journey itinerary" : "The curated trail"}
            </p>
            <h2 className="mt-h2">
              {planning
                ? "A carefully paced route through the best of Mysuru"
                : "Discover Mysuru, one place at a time"}
            </h2>
            {canEdit ? (
              <p className="mt-lead mt-intro-edit">
                <Link to="/admin/mysore-trail" className="mt-text-link">
                  Edit trail
                </Link>
              </p>
            ) : null}
          </header>

          <div className="mt-pills mt-discover-filters" role="toolbar" aria-label="Filter by interest">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`mt-pill${discoverFilter === f ? " is-on" : ""}`}
                onClick={() => setDiscoverFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mt-itinerary-stack">
            {days.map((day) => {
              const list = (
                day.stopIds
                  .map((id) => stops.find((s) => s.id === id))
                  .filter(Boolean) as TrailStop[]
              ).filter((stop) => {
                if (!categoryKey) return true;
                const place = getPlace(stop.placeId);
                return place.categories.includes(categoryKey as never);
              });
              if (list.length === 0) return null;
              return (
                <div key={day.day} id={`day-${day.day}`} className="mt-day-block">
                  {planning ? (
                    <header className="mt-day-head">
                      <p className="mt-eyebrow">Day {String(day.day).padStart(2, "0")}</p>
                      <h3 className="mt-day-title">{day.title}</h3>
                      <p className="mt-day-theme">{day.theme}</p>
                    </header>
                  ) : (
                    <header className="mt-day-head">
                      <h3 className="mt-day-title">{day.title}</h3>
                      <p className="mt-day-theme">{day.theme}</p>
                    </header>
                  )}
                  {list.map((stop, i) => {
                    const gIdx = globalStopIndex;
                    globalStopIndex += 1;
                    return (
                      <ItineraryStopCard
                        key={stop.id}
                        stop={stop}
                        indexInDay={i}
                        dayStopCount={list.length}
                        globalIndex={gIdx}
                        active={stop.id === activeStopId}
                        nextStop={list[i + 1]}
                        showTripDetails={planning}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Suggestions */}
      <section className="mt-recs">
        <div className="mt-wrap">
          <header className="mt-section-head">
            <p className="mt-eyebrow">You may also like</p>
            <h2 className="mt-h2">While you are at {activePlace.shortName}</h2>
          </header>
          <div className="mt-recs-grid">
            {recommendations.map((rec) => (
              <article key={rec.placeId} className="mt-rec-card">
                <img
                  src={rec.place.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-rec-body">
                  <p className="mt-rec-cat">{rec.category}</p>
                  <h3>{rec.place.name}</h3>
                  <p>{rec.reason}</p>
                  <p className="mt-rec-meta">{rec.place.distanceFromCentreKm} km from centre</p>
                  <div className="mt-rec-actions">
                    <a href={`#${rec.placeId}`} className="mt-text-link">
                      View details →
                    </a>
                    <button type="button" className="mt-text-link" onClick={() => addToTrail(rec.placeId)}>
                      Add to trail
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Route map — plan mode only */}
      {planning ? (
        <section className="mt-route" id="trail-route">
          <div className="mt-wrap">
            <header className="mt-section-head">
              <p className="mt-eyebrow">Your journey route</p>
              <h2 className="mt-h2">A stylised path through Mysuru</h2>
            </header>
            <div className="mt-route-board">
              <ol className="mt-route-list">
                {stops.map((stop, i) => {
                  const place = getPlace(stop.placeId);
                  return (
                    <li key={stop.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStopId(stop.id);
                          document.getElementById(place.id)?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }}
                      >
                        <span className="mt-route-marker">{String(i + 1).padStart(2, "0")}</span>
                        <span className="mt-route-name">{place.shortName}</span>
                        <span className="mt-route-time">Day {stop.day}</span>
                      </button>
                      {i < stops.length - 1 ? <span className="mt-route-dash" aria-hidden /> : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>
      ) : null}

      {/* Featured journey */}
      <section className="mt-featured">
        <div className="mt-wrap">
          <article className="mt-featured-card">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mysore_Palace_-_Front_view.jpg/1280px-Mysore_Palace_-_Front_view.jpg"
              alt="Mysuru Palace"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <div className="mt-featured-body">
              <p className="mt-eyebrow">Featured journey</p>
              <h2 className="mt-h2">The Royal Weekend</h2>
              <p className="mt-featured-meta">3 Days / 2 Nights · Palaces · Food · Culture · Nature</p>
              <p className="mt-lead">
                A perfectly paced introduction to Mysuru for travellers who want to experience the
                city&apos;s royal character without rushing.
              </p>
              <a href="#trail-journey" className="mt-btn-primary">
                View journey →
              </a>
            </div>
          </article>
        </div>
      </section>

      {/* Trust */}
      <section className="mt-trust">
        <div className="mt-wrap mt-trust-inner">
          <div>
            <p className="mt-eyebrow">Trusted by travellers</p>
            <p className="mt-trust-stars" aria-label="4.9 out of 5">
              ★★★★★
            </p>
            <p className="mt-trust-score">
              4.9 <span>320+ reviews</span>
            </p>
          </div>
          <blockquote className="mt-trust-quote">
            “Every detail made exploring Mysuru feel effortless.”
            <cite>— Traveller on The Royal Passage</cite>
          </blockquote>
        </div>
      </section>

      {/* Summary — plan mode only */}
      {planning ? (
        <section className="mt-summary">
          <div className="mt-wrap">
            <div className="mt-summary-card">
              <p className="mt-eyebrow">Your Mysore Trail</p>
              <h2 className="mt-h2">
                {summary.days} days · {summary.experiences} stops · {summary.hours}+ hours
              </h2>
              <p className="mt-summary-tags">
                {summary.bestFor.map((c) => c.toUpperCase()).join(" · ")}
              </p>
              <div className="mt-summary-actions">
                <button type="button" className="mt-btn-primary" onClick={saveTrail}>
                  Save my trail
                </button>
                <button type="button" className="mt-btn-ghost" onClick={() => void copyLink()}>
                  Share trail
                </button>
                <button type="button" className="mt-btn-ghost" onClick={downloadItinerary}>
                  Download itinerary
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Finale */}
      <section className="mt-finale">
        <img src={FINALE_IMAGE} alt="" className="mt-finale-bg" decoding="async" referrerPolicy="no-referrer" />
        <div className="mt-finale-veil" />
        <div className="mt-finale-inner">
          <h2 className="mt-finale-title">
            Some places
            <br />
            stay with you
            <br />
            forever.
          </h2>
          <p>Your Mysuru story starts here.</p>
          <div className="mt-hero-actions">
            <a
              href="#trail-journey"
              className="mt-btn-primary"
              onClick={() => setPlanning(false)}
            >
              Start your journey →
            </a>
            <button type="button" className="mt-btn-ghost-light" onClick={startPlanning}>
              Plan my journey
            </button>
            <Link to="/experiences" className="mt-btn-ghost-light">
              Explore experiences
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
