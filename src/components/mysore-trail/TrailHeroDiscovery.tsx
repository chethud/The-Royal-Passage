import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  HERO_DESTINATIONS,
  type HeroDestination,
} from "@/data/mysore-trail-hero-destinations";
import { getPlace } from "@/data/mysore-trail-journey";

const AUTOPLAY_MS = 4000;
const TRANSITION_MS = 1250;
const EASE = [0.16, 1, 0.3, 1] as const;
const VISIBLE_CARDS = 3;

type TrailHeroDiscoveryProps = {
  destinations?: HeroDestination[];
  onExploreTrail?: () => void;
  onPlanTrip?: () => void;
};

type Direction = 1 | -1;

type ExpandFlight = {
  toIndex: number;
  src: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

function padIndex(n: number) {
  return String(n).padStart(2, "0");
}

function preloadImage(src: string) {
  if (typeof window === "undefined") return Promise.resolve();
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img.decode?.().catch(() => undefined) ?? Promise.resolve();
}

function HeroCopy({
  eyebrow,
  location,
  titleLines,
  description,
}: {
  eyebrow: string;
  location: string;
  titleLines: string[];
  description: string;
}) {
  return (
    <>
      <p className="mt-disco-eyebrow">{eyebrow}</p>
      <p className="mt-disco-location">{location}</p>
      <h1 className="mt-disco-title">
        {titleLines.map((line) => (
          <span key={line} className="mt-disco-title-line">
            {line}
          </span>
        ))}
      </h1>
      <p className="mt-disco-desc">{description}</p>
    </>
  );
}

function flightFromCard(
  section: HTMLElement,
  card: Element | null,
): Omit<ExpandFlight, "toIndex" | "src"> {
  const root = section.getBoundingClientRect();
  let top: number;
  let left: number;
  let width: number;
  let height: number;

  if (card) {
    const box = card.getBoundingClientRect();
    top = box.top - root.top;
    left = box.left - root.left;
    width = box.width;
    height = box.height;
  } else {
    width = Math.min(200, root.width * 0.28);
    height = Math.min(140, root.height * 0.2);
    top = root.height * 0.58;
    left = root.width * 0.38;
  }

  return {
    x: left,
    y: top,
    scaleX: Math.max(0.04, width / Math.max(root.width, 1)),
    scaleY: Math.max(0.04, height / Math.max(root.height, 1)),
  };
}

function withItineraryPhoto(dest: HeroDestination): HeroDestination {
  if (!dest.placeId) return dest;
  const place = getPlace(dest.placeId);
  if (place.id !== dest.placeId || !place.image) return dest;
  return { ...dest, image: place.image, imageAlt: place.imageAlt || dest.imageAlt };
}

export function TrailHeroDiscovery({
  destinations: destinationsProp,
  onExploreTrail,
  onPlanTrip,
}: TrailHeroDiscoveryProps) {
  const destinations = useMemo(() => {
    const list = destinationsProp?.length ? destinationsProp : HERO_DESTINATIONS;
    return list.map(withItineraryPhoto);
  }, [destinationsProp]);
  const total = destinations.length;
  const reduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [railIndex, setRailIndex] = useState(0);
  const [copyIndex, setCopyIndex] = useState(0);
  const [flight, setFlight] = useState<ExpandFlight | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const dragRef = useRef<{ startX: number; delta: number; active: boolean }>({
    startX: 0,
    delta: 0,
    active: false,
  });
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const unlockTimerRef = useRef<number | null>(null);
  const flightDoneRef = useRef(false);

  const active = destinations[activeIndex]!;
  const copy = destinations[copyIndex]!;

  /**
   * Rail follows railIndex (advances as soon as expand starts)
   * so the expanding card slot is replaced by the following image — no black gap.
   */
  const upcoming = useMemo(() => {
    const list = [];
    for (let offset = 1; offset <= VISIBLE_CARDS; offset++) {
      list.push(destinations[(railIndex + offset) % total]!);
    }
    return list;
  }, [railIndex, destinations, total]);

  useEffect(() => {
    railRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [railIndex]);

  const finishFlight = useCallback((toIndex: number) => {
    if (flightDoneRef.current) return;
    flightDoneRef.current = true;
    if (unlockTimerRef.current) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
    setActiveIndex(toIndex);
    setRailIndex(toIndex);
    setCopyIndex(toIndex);
    setFlight(null);
    setIsTransitioning(false);
  }, []);

  const goTo = useCallback(
    (nextIndex: number, options?: { fromUser?: boolean; dir?: Direction }) => {
      const wrapped = ((nextIndex % total) + total) % total;
      if (wrapped === activeIndexRef.current || isTransitioning) return;

      if (options?.fromUser) setPaused(true);

      const dest = destinations[wrapped]!;
      const section = sectionRef.current;

      if (reduceMotion || !section) {
        setActiveIndex(wrapped);
        setRailIndex(wrapped);
        setCopyIndex(wrapped);
        return;
      }

      // Measure the card BEFORE removing it from the rail
      const card = section.querySelector(`[data-dest-index="${wrapped}"]`);
      const origin = flightFromCard(section, card);

      flightDoneRef.current = false;
      setIsTransitioning(true);
      setCopyIndex(wrapped);

      void preloadImage(dest.image).then(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Start expand and advance rail together — next photo fills the slot
            setFlight({
              toIndex: wrapped,
              src: dest.image,
              ...origin,
            });
            setRailIndex(wrapped);
          });
        });
      });

      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = window.setTimeout(() => {
        finishFlight(wrapped);
      }, TRANSITION_MS + 320);
    },
    [destinations, finishFlight, isTransitioning, reduceMotion, total],
  );

  const goNext = useCallback(
    (fromUser = false) => goTo(activeIndexRef.current + 1, { fromUser, dir: 1 }),
    [goTo],
  );
  const goPrev = useCallback(
    (fromUser = false) => goTo(activeIndexRef.current - 1, { fromUser, dir: -1 }),
    [goTo],
  );

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
    };
  }, []);

  useEffect(() => {
    void preloadImage(active.image);
    for (const d of upcoming) void preloadImage(d.image);
  }, [active.image, upcoming]);

  useEffect(() => {
    if (paused || reduceMotion || isTransitioning) return;
    const id = window.setInterval(() => goNext(false), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, isTransitioning, goNext]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const root = sectionRef.current;
      if (!root) return;
      if (
        !root.contains(document.activeElement) &&
        document.activeElement !== document.body
      ) {
        if (!root.matches(":hover")) return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext(true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 || isTransitioning) return;
    dragRef.current = { startX: e.clientX, delta: 0, active: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setPaused(true);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragRef.current.active) return;
    dragRef.current.delta = e.clientX - dragRef.current.startX;
  };

  const onPointerUp = () => {
    if (!dragRef.current.active) return;
    const { delta } = dragRef.current;
    dragRef.current.active = false;
    if (Math.abs(delta) > 56) {
      if (delta < 0) goNext(true);
      else goPrev(true);
    }
  };

  const scrollToJourney = () => {
    onExploreTrail?.();
    document
      .getElementById("trail-journey")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const planTrip = () => {
    onPlanTrip?.();
  };

  const textEnter = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.5, ease: EASE, delay: 0.45 };
  const textExit = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.32, ease: EASE };

  const expandTransition = {
    duration: TRANSITION_MS / 1000,
    ease: EASE,
  };

  return (
    <section
      ref={sectionRef}
      className={`mt-disco${reduceMotion ? " mt-disco--reduced" : ""}`}
      aria-label="Mysore Trail destination discovery"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      {/* Current background stays put — no zoom out */}
      <div className="mt-disco-bg" aria-hidden="true">
        <img
          className="mt-disco-bg-img"
          src={active.image}
          alt=""
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* GPU transform expand: card frame → full hero overlay */}
      <AnimatePresence>
        {flight ? (
          <motion.div
            key={`expand-${flight.toIndex}`}
            className="mt-disco-expand"
            initial={{
              x: flight.x,
              y: flight.y,
              scaleX: flight.scaleX,
              scaleY: flight.scaleY,
              borderRadius: 12,
            }}
            animate={{
              x: 0,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              borderRadius: 0,
            }}
            transition={expandTransition}
            onAnimationComplete={() => finishFlight(flight.toIndex)}
          >
            <img
              className="mt-disco-expand-img"
              src={flight.src}
              alt=""
              decoding="async"
              referrerPolicy="no-referrer"
              draggable={false}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-disco-veil" aria-hidden="true" />

      <div className="mt-disco-stage">
        <div className="mt-disco-copy-slot">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={copy.id}
              className="mt-disco-copy"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, transition: textEnter }}
              exit={{ opacity: 0, y: -14, transition: textExit }}
            >
              <HeroCopy
                eyebrow={copy.eyebrow}
                location={copy.location}
                titleLines={copy.titleLines}
                description={copy.description}
              />
              <div className="mt-disco-actions">
                <button type="button" className="mt-disco-cta" onClick={scrollToJourney}>
                  Explore this trail
                  <span aria-hidden="true"> →</span>
                </button>
                <button
                  type="button"
                  className="mt-disco-cta mt-disco-cta--ghost"
                  onClick={planTrip}
                >
                  Plan trip
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-disco-lower">
          <div className="mt-disco-rail-wrap">
            <div className="mt-disco-rail-controls">
              <button
                type="button"
                className="mt-disco-arrow"
                aria-label="Previous destination"
                disabled={isTransitioning}
                onClick={() => goPrev(true)}
              >
                ←
              </button>
              <button
                type="button"
                className="mt-disco-arrow"
                aria-label="Next destination"
                disabled={isTransitioning}
                onClick={() => goNext(true)}
              >
                →
              </button>
            </div>

            <div
              ref={railRef}
              className="mt-disco-rail"
              role="listbox"
              aria-label="Upcoming destinations"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {upcoming.map((dest, i) => {
                  const destIndex = destinations.findIndex((d) => d.id === dest.id);
                  const isNext = i === 0;
                  return (
                    <motion.button
                      key={dest.id}
                      type="button"
                      role="option"
                      aria-selected={isNext}
                      aria-label={isNext ? `Next: ${dest.name}` : dest.name}
                      data-dest-index={destIndex}
                      layout="position"
                      className={`mt-disco-card${isNext ? " is-next" : ""}`}
                      disabled={isTransitioning}
                      onClick={() => goTo(destIndex, { fromUser: true })}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, x: 170, scale: 0.98 }
                      }
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: isNext ? 1.04 : 1,
                        y: isNext ? -4 : 0,
                      }}
                      exit={
                        // Expanding card leaves via hero overlay — hide rail copy instantly.
                        // Other exits (rare) slide left.
                        reduceMotion || flight
                          ? { opacity: 0, transition: { duration: 0 } }
                          : { opacity: 0, x: -120, scale: 0.98 }
                      }
                      transition={{
                        layout: {
                          duration: reduceMotion ? 0.01 : 0.9,
                          ease: EASE,
                        },
                        opacity: { duration: 0.4, ease: EASE },
                        x: { duration: 0.9, ease: EASE },
                        scale: { duration: 0.55, ease: EASE },
                        y: { duration: 0.55, ease: EASE },
                      }}
                    >
                      <img
                        className="mt-disco-card-photo"
                        src={dest.image}
                        alt={dest.imageAlt}
                        loading={i < 3 ? "eager" : "lazy"}
                        decoding="async"
                        referrerPolicy="no-referrer"
                        draggable={false}
                      />
                      <span className="mt-disco-card-veil" aria-hidden="true" />
                      <span className="mt-disco-card-meta">
                        <span className="mt-disco-card-num">{padIndex(destIndex + 1)}</span>
                        <span className="mt-disco-card-name">
                          {dest.cardLines.map((line) => (
                            <span key={line}>{line}</span>
                          ))}
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
