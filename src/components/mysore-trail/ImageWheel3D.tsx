import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export type WheelDestination = {
  id: string;
  stopId: string;
  image: string;
  imageAlt: string;
  name: string;
  shortName: string;
  cityLabel: string;
  day: number;
  dayTitle: string;
};

type ImageWheel3DProps = {
  items: WheelDestination[];
  activeIndex: number;
  totalDays: number;
  showTripDetails?: boolean;
  onSelectIndex: (index: number) => void;
};

/** Poses as % of the stage. Incoming: bottom → left. Outgoing: left → top. */
const POSE = {
  active: { x: 42, y: 48, scale: 1, opacity: 1, tilt: 0 },
  enter: { x: 52, y: 108, scale: 0.55, opacity: 0.4, tilt: -8 },
  exit: { x: 52, y: -10, scale: 0.5, opacity: 0, tilt: 8 },
} as const;

const TURN_MS = 3000;
const EASE = "cubic-bezier(0.4, 0.0, 0.2, 1)";

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return ((i % len) + len) % len;
}

type TurnState = {
  outgoing: number;
  incoming: number;
};

export function ImageWheel3D({
  items,
  activeIndex,
  totalDays,
  showTripDetails = false,
  onSelectIndex,
}: ImageWheel3DProps) {
  const reduced = usePrefersReducedMotion();
  const count = items.length;

  const [settledIndex, setSettledIndex] = useState(activeIndex);
  const [turn, setTurn] = useState<TurnState | null>(null);
  /** false = start poses, true = end poses (CSS transitions between them) */
  const [run, setRun] = useState(false);

  const turningRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const settledIndexRef = useRef(settledIndex);
  const turnTargetRef = useRef(activeIndex);

  activeIndexRef.current = activeIndex;
  settledIndexRef.current = settledIndex;

  useEffect(() => {
    if (count === 0) return;
    for (const offset of [-1, 0, 1]) {
      const src = items[clampIndex(activeIndex + offset, count)]?.image;
      if (!src) continue;
      const img = new Image();
      img.referrerPolicy = "no-referrer";
      img.src = src;
    }
  }, [activeIndex, count, items]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const finishTurn = useCallback((animatedTo: number) => {
    turningRef.current = false;
    setTurn(null);
    setRun(false);
    setSettledIndex(animatedTo);
    settledIndexRef.current = animatedTo;
    timerRef.current = null;

    const next = activeIndexRef.current;
    if (next !== animatedTo && count >= 2) {
      window.setTimeout(() => beginTurnRef.current(animatedTo, next), 0);
    }
  }, [count]);

  const beginTurnRef = useRef<(from: number, to: number) => void>(() => {});

  const beginTurn = useCallback(
    (from: number, to: number) => {
      if (count < 2) return;
      if (from === to) {
        turningRef.current = false;
        setTurn(null);
        setRun(false);
        setSettledIndex(to);
        settledIndexRef.current = to;
        return;
      }
      if (turningRef.current) {
        // Remember latest text place; finish current wipe first (no restart stutter)
        turnTargetRef.current = to;
        return;
      }

      turningRef.current = true;
      turnTargetRef.current = to;
      setTurn({ outgoing: from, incoming: to });
      setRun(false);

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setRun(true);
        });
      });

      if (timerRef.current) window.clearTimeout(timerRef.current);
      const animatedTo = to;
      timerRef.current = window.setTimeout(() => {
        finishTurn(animatedTo);
      }, TURN_MS + 40);
    },
    [count, finishTurn],
  );

  beginTurnRef.current = beginTurn;

  useEffect(() => {
    if (reduced || count < 2) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      turningRef.current = false;
      setTurn(null);
      setRun(false);
      setSettledIndex(activeIndex);
      settledIndexRef.current = activeIndex;
      return;
    }

    const target = activeIndex;
    if (!turningRef.current && settledIndexRef.current === target) return;

    if (turningRef.current) {
      turnTargetRef.current = target;
      return;
    }

    beginTurn(settledIndexRef.current, target);
  }, [activeIndex, count, reduced, beginTurn]);

  const goTo = useCallback(
    (index: number) => {
      if (count === 0 || turningRef.current) return;
      onSelectIndex(clampIndex(index, count));
    },
    [count, onSelectIndex],
  );

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      goTo(settledIndex + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      goTo(settledIndex - 1);
    }
  };

  // Drag disabled during CSS wipe to avoid fighting the transition
  const onPointerDown = (_e: ReactPointerEvent<HTMLDivElement>) => {};

  const settled = items[settledIndex];
  if (!settled || count === 0) return null;

  if (reduced) {
    const shown = items[activeIndex] ?? settled;
    return (
      <div className="trail-collage trail-collage--reduced">
        {showTripDetails ? (
          <p className="trail-collage-eyebrow">
            DAY {String(shown.day).padStart(2, "0")} / {String(totalDays).padStart(2, "0")}
          </p>
        ) : null}
        <div className="trail-collage-reduced-frame">
          <img src={shown.image} alt={shown.imageAlt} referrerPolicy="no-referrer" decoding="async" />
        </div>
        <div className="trail-collage-caption">
          <p className="trail-collage-caption-num">
            {String(activeIndex + 1).padStart(2, "0")}
            <span> / {String(count).padStart(2, "0")} destinations</span>
          </p>
          <p className="trail-collage-caption-name">{shown.shortName}</p>
        </div>
        <div className="trail-collage-controls">
          <button
            type="button"
            className="trail-collage-nav"
            onClick={() => onSelectIndex(clampIndex(activeIndex - 1, count))}
          >
            ← Previous
          </button>
          <button
            type="button"
            className="trail-collage-nav"
            onClick={() => onSelectIndex(clampIndex(activeIndex + 1, count))}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  type Card = {
    key: string;
    item: WheelDestination;
    index: number;
    x: number;
    y: number;
    scale: number;
    opacity: number;
    tilt: number;
    z: number;
    role: "active" | "incoming" | "outgoing";
    animate: boolean;
  };

  const cards: Card[] = [];
  const transition = run
    ? `left ${TURN_MS}ms ${EASE}, top ${TURN_MS}ms ${EASE}, transform ${TURN_MS}ms ${EASE}, opacity ${TURN_MS}ms ${EASE}`
    : "none";

  if (turn) {
    const outItem = items[turn.outgoing];
    const inItem = items[turn.incoming];
    const outPose = run ? POSE.exit : POSE.active;
    const inPose = run ? POSE.active : POSE.enter;

    if (outItem) {
      cards.push({
        key: outItem.id,
        item: outItem,
        index: turn.outgoing,
        x: outPose.x,
        y: outPose.y,
        scale: outPose.scale,
        opacity: outPose.opacity,
        tilt: outPose.tilt,
        z: 10,
        role: "outgoing",
        animate: true,
      });
    }
    if (inItem && turn.incoming !== turn.outgoing) {
      cards.push({
        key: inItem.id,
        item: inItem,
        index: turn.incoming,
        x: inPose.x,
        y: inPose.y,
        scale: inPose.scale,
        opacity: inPose.opacity,
        tilt: inPose.tilt,
        z: 20,
        role: "incoming",
        animate: true,
      });
    }
  } else {
    cards.push({
      key: settled.id,
      item: settled,
      index: settledIndex,
      x: POSE.active.x,
      y: POSE.active.y,
      scale: POSE.active.scale,
      opacity: POSE.active.opacity,
      tilt: 0,
      z: 20,
      role: "active",
      animate: false,
    });
  }

  const captionItem = items[activeIndex] ?? settled;
  const captionIndex = activeIndex;
  const animating = !!turn;

  return (
    <div
      className="trail-collage"
      role="region"
      aria-roledescription="destination image orbit"
      aria-label="Mysore Trail destinations"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {showTripDetails ? (
        <div className="trail-collage-head">
          <p className="trail-collage-eyebrow">
            DAY {String(captionItem.day).padStart(2, "0")} / {String(totalDays).padStart(2, "0")}
          </p>
          <p className="trail-collage-chapter">The Royal Mysuru Journey</p>
        </div>
      ) : (
        <div className="trail-collage-head">
          <p className="trail-collage-chapter">The Royal Mysuru Journey</p>
        </div>
      )}

      <div
        className={animating ? "trail-collage-stage is-turning" : "trail-collage-stage"}
        onPointerDown={onPointerDown}
      >
        <div className="trail-orbit">
          {cards.map((card) => {
            const emphasize =
              card.role === "active" || (card.role === "incoming" && run);
            return (
              <button
                key={card.key}
                type="button"
                className={emphasize ? "trail-orbit-card is-active" : "trail-orbit-card"}
                style={{
                  left: `${card.x}%`,
                  top: `${card.y}%`,
                  opacity: card.opacity,
                  zIndex: card.z,
                  transform: `translate(-50%, -50%) scale(${card.scale}) rotate(${card.tilt}deg)`,
                  transition: card.animate ? transition : "none",
                }}
                aria-label={card.item.name}
                aria-current={card.role === "active" ? "true" : undefined}
                onClick={() => {
                  if (turn) return;
                  goTo(card.index);
                }}
              >
                <img
                  src={card.item.image}
                  alt={card.item.imageAlt}
                  referrerPolicy="no-referrer"
                  decoding="async"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="trail-collage-caption">
        <p className="trail-collage-caption-num">
          {String(captionIndex + 1).padStart(2, "0")}
          <span> / {String(count).padStart(2, "0")} destinations</span>
        </p>
        <p className="trail-collage-caption-name">{captionItem.shortName}</p>
        <p className="trail-collage-caption-city">{captionItem.cityLabel}</p>
      </div>

      <div className="trail-collage-controls">
        <button
          type="button"
          className="trail-collage-nav"
          onClick={() => goTo(settledIndex - 1)}
          aria-label="Previous destination"
          disabled={!!turn}
        >
          ← Previous
        </button>
        <button
          type="button"
          className="trail-collage-nav"
          onClick={() => goTo(settledIndex + 1)}
          aria-label="Next destination"
          disabled={!!turn}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
