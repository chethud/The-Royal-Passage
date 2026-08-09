import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { TrailPlace } from "@/data/mysore-trail-journey";

type StickyImagePanelProps = {
  place: TrailPlace;
  index: number;
  total: number;
  dayLabel: string;
  /** Trip schedule meta — only after Plan my trip */
  showTripDetails?: boolean;
  /** 1 = scrolling down (next stop), -1 = scrolling up */
  direction?: 1 | -1;
};

/**
 * Planar spin (rotateZ), not a 3D flip.
 * Forward: clockwise. Back: counter-clockwise.
 */
const slideVariants = {
  enter: (dir: 1 | -1) => ({
    opacity: 0,
    rotate: dir > 0 ? -160 : 160,
    scale: 0.9,
  }),
  center: {
    opacity: 1,
    rotate: 0,
    scale: 1,
  },
  exit: (dir: 1 | -1) => ({
    opacity: 0,
    rotate: dir > 0 ? 160 : -160,
    scale: 0.9,
  }),
};

export function StickyImagePanel({
  place,
  index,
  total,
  dayLabel,
  showTripDetails = false,
  direction = 1,
}: StickyImagePanelProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="trail-sticky-panel">
      <div className="trail-sticky-orb">
        <div className="trail-sticky-frame">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={place.id}
              className="trail-sticky-slide"
              custom={direction}
              variants={slideVariants}
              initial={reduced ? { opacity: 0 } : "enter"}
              animate={reduced ? { opacity: 1 } : "center"}
              exit={reduced ? { opacity: 0 } : "exit"}
              transition={{
                duration: reduced ? 0.2 : 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <img
                src={place.image}
                alt={place.imageAlt}
                className="trail-sticky-img"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                draggable={false}
              />
              <div className="trail-sticky-grain" aria-hidden />
              <div className="trail-sticky-vignette" aria-hidden />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="trail-sticky-caption">
        {showTripDetails ? (
          <p className="trail-sticky-num">
            {String(index + 1).padStart(2, "0")}
            <span> / {String(total).padStart(2, "0")}</span>
          </p>
        ) : null}
        <p className="trail-sticky-name">{place.shortName}</p>
        <p className="trail-sticky-city">{place.cityLabel}</p>
      </div>

      <div className="trail-sticky-meta">
        <p className="trail-sticky-tagline">“{place.tagline}”</p>
        {!showTripDetails && place.whyItMatters ? (
          <p className="trail-sticky-why">{place.whyItMatters}</p>
        ) : null}
        {showTripDetails ? (
          <dl className="trail-sticky-stats">
            <div>
              <dt>From centre</dt>
              <dd>{place.distanceFromCentreKm} km</dd>
            </div>
            <div>
              <dt>Recommended</dt>
              <dd>{place.durationLabel}</dd>
            </div>
            <div>
              <dt>Best</dt>
              <dd>{place.bestTime}</dd>
            </div>
            <div>
              <dt>Day</dt>
              <dd>{dayLabel}</dd>
            </div>
          </dl>
        ) : null}
      </div>
    </div>
  );
}
