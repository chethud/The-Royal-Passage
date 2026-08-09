import { useEffect, useRef } from "react";
import type { TrailStop } from "@/data/mysore-trail-journey";
import { getPlace } from "@/data/mysore-trail-journey";

type ItineraryStopCardProps = {
  stop: TrailStop;
  indexInDay: number;
  dayStopCount: number;
  active: boolean;
  nextStop?: TrailStop;
  /** Trip schedule (times, travel) — only after Plan my trip */
  showTripDetails?: boolean;
  onVisible: (stopId: string) => void;
};

export function ItineraryStopCard({
  stop,
  indexInDay,
  dayStopCount,
  active,
  nextStop,
  showTripDetails = false,
  onVisible,
}: ItineraryStopCardProps) {
  const ref = useRef<HTMLElement>(null);
  const place = getPlace(stop.placeId);
  const nextPlace = nextStop ? getPlace(nextStop.placeId) : null;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onVisible(stop.id);
      },
      { root: null, rootMargin: "-32% 0px -48% 0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onVisible, stop.id]);

  return (
    <article
      ref={ref}
      id={place.id}
      data-stop-id={stop.id}
      className={`trail-stop${active ? " is-active" : ""}`}
    >
      <div className="trail-stop-rail" aria-hidden>
        <span className="trail-stop-dot" />
        {indexInDay < dayStopCount - 1 ? <span className="trail-stop-line" /> : null}
      </div>

      <div className="trail-stop-body">
        {showTripDetails ? (
          <header className="trail-stop-head">
            <p className="trail-stop-time">{stop.timeLabel}</p>
            <p className="trail-stop-index">
              {String(indexInDay + 1).padStart(2, "0")}
              {active ? <span className="trail-stop-live"> Active</span> : null}
            </p>
          </header>
        ) : (
          <header className="trail-stop-head">
            <p className="trail-stop-index">
              {String(indexInDay + 1).padStart(2, "0")}
              {active ? <span className="trail-stop-live"> Active</span> : null}
            </p>
          </header>
        )}

        <h3 className="trail-stop-title">{place.name}</h3>
        <p className="trail-stop-tagline">{place.tagline}</p>

        {showTripDetails && stop.travelFromPrevious ? (
          <p className="trail-stop-travel">
            {stop.travelFromPrevious.mode} · {stop.travelFromPrevious.distanceKm} km · ~
            {stop.travelFromPrevious.minutes} min
          </p>
        ) : null}

        <div className="trail-stop-mobile-media lg:hidden">
          <img
            src={place.image}
            alt={place.imageAlt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </div>

        <p className="trail-stop-desc">{place.description}</p>

        {place.whatToSee.length > 0 ? (
          <ul className="trail-stop-highlights">
            {place.whatToSee.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {place.localTip ? (
          <p className="trail-stop-tip">
            <span>Local tip</span> {place.localTip}
          </p>
        ) : null}

        {showTripDetails ? (
          <>
            <p className="trail-stop-facts-inline">
              {place.durationLabel} · {place.bestTime}
            </p>
            {nextPlace ? (
              <p className="trail-stop-next">
                Next · {nextStop?.timeLabel} · {nextPlace.name}
              </p>
            ) : (
              <p className="trail-stop-next">End of this day</p>
            )}
          </>
        ) : null}
      </div>
    </article>
  );
}
