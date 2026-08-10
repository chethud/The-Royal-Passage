import type { TrailStop } from "@/data/mysore-trail-journey";
import { getPlace } from "@/data/mysore-trail-journey";

const CATEGORY_LABEL: Record<string, string> = {
  heritage: "Heritage",
  architecture: "Architecture",
  food: "Food",
  culture: "Culture",
  nature: "Nature",
  photography: "Photography",
  shopping: "Shopping",
  spiritual: "Spiritual",
  hidden: "Hidden",
  family: "Family",
  luxury: "Royal",
};

type ItineraryStopCardProps = {
  stop: TrailStop;
  indexInDay: number;
  dayStopCount: number;
  globalIndex: number;
  active: boolean;
  nextStop?: TrailStop;
  showTripDetails?: boolean;
};

/**
 * One stop = one photo card. Place name, one short line, and category pills on the image.
 */
export function ItineraryStopCard({
  stop,
  globalIndex,
  active,
  showTripDetails = false,
}: ItineraryStopCardProps) {
  const place = getPlace(stop.placeId);
  const tags = place.categories.slice(0, 3).map((c) => CATEGORY_LABEL[c] ?? c);

  return (
    <article
      id={place.id}
      data-stop-id={stop.id}
      data-stop-index={globalIndex}
      className={`mt-stop-photo${active ? " is-active" : ""}`}
    >
      <div className="mt-stop-photo-card">
        <img
          className="mt-stop-photo-img"
          src={place.image}
          alt={place.imageAlt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        <div className="mt-stop-photo-gradient" aria-hidden />

        <div className="mt-stop-photo-overlay">
          {showTripDetails ? (
            <p className="mt-stop-photo-time">{stop.timeLabel}</p>
          ) : null}
          <h3 className="mt-stop-photo-title">{place.name}</h3>
          <p className="mt-stop-photo-tagline">{place.tagline}</p>
          <ul className="mt-stop-photo-tags">
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
