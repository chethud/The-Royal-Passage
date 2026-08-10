import { useRef } from "react";
import type { TrailStop } from "@/data/mysore-trail-journey";
import { getPlace } from "@/data/mysore-trail-journey";

export type StopFocus = "active" | "prev" | "next" | "far";

type ItineraryStopCardProps = {
  stop: TrailStop;
  indexInDay: number;
  dayStopCount: number;
  globalIndex: number;
  active: boolean;
  focus?: StopFocus;
  nextStop?: TrailStop;
  showTripDetails?: boolean;
};

export function ItineraryStopCard({
  stop,
  indexInDay,
  dayStopCount,
  globalIndex,
  active,
  focus = "active",
  nextStop,
  showTripDetails = false,
}: ItineraryStopCardProps) {
  const articleRef = useRef<HTMLElement>(null);
  const place = getPlace(stop.placeId);
  const nextPlace = nextStop ? getPlace(nextStop.placeId) : null;

  const mode: StopFocus | "idle" = showTripDetails
    ? active
      ? "active"
      : "idle"
    : focus;

  return (
    <article
      ref={articleRef}
      id={place.id}
      data-stop-id={stop.id}
      data-stop-index={globalIndex}
      className={`trail-stop is-${mode}${active ? " is-active" : ""}`}
    >
      <span className="trail-stop-spy" aria-hidden />

      <div className="trail-stop-rail" aria-hidden>
        <span className="trail-stop-dot" />
        {indexInDay < dayStopCount - 1 ? <span className="trail-stop-line" /> : null}
      </div>

      <div className="trail-stop-body">
        {showTripDetails ? (
          <header className="trail-stop-head">
            <p className="trail-stop-time">{stop.timeLabel}</p>
            <p className="trail-stop-index">
              {String(globalIndex + 1).padStart(2, "0")}
              {active ? <span className="trail-stop-live"> Active</span> : null}
            </p>
          </header>
        ) : (
          <header className="trail-stop-head">
            <p className="trail-stop-index">{String(globalIndex + 1).padStart(2, "0")}</p>
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

        <p className="trail-stop-desc">{place.description}</p>

        {showTripDetails && place.whatToSee.length > 0 ? (
          <div className="trail-stop-block">
            <p className="trail-stop-block-label">See</p>
            <ul className="trail-stop-highlights">
              {place.whatToSee.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {showTripDetails && place.whatToDo.length > 0 ? (
          <div className="trail-stop-block">
            <p className="trail-stop-block-label">Do</p>
            <ul className="trail-stop-highlights">
              {place.whatToDo.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {showTripDetails && place.localTip ? (
          <p className="trail-stop-tip">
            <span>Local tip</span> {place.localTip}
          </p>
        ) : null}

        {showTripDetails ? (
          <>
            <p className="trail-stop-facts-inline">
              {place.durationLabel} · Best {place.bestTime}
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
