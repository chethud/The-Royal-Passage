import { useEffect, useMemo, useState } from "react";
import type { WheelDestination } from "@/components/mysore-trail/ImageWheel3D";

type StickyDestinationPanelProps = {
  items: WheelDestination[];
  activeIndex: number;
  totalDays: number;
  showTripDetails?: boolean;
  /** Optional tagline shown in the photo overlay */
  tagline?: string;
};

/**
 * Right-side destination card.
 * Hierarchy (all children of the same relative container):
 *   .destination-image-card
 *     ├── img.destination-image
 *     ├── .destination-gradient
 *     └── .destination-overlay-content  (absolute — sits ON the photo)
 */
export function StickyDestinationPanel({
  items,
  activeIndex,
  totalDays,
  showTripDetails = false,
  tagline,
}: StickyDestinationPanelProps) {
  const safeIndex = Math.min(Math.max(0, activeIndex), Math.max(0, items.length - 1));
  const active = items[safeIndex] ?? items[0];

  const [shown, setShown] = useState(active);
  const [incoming, setIncoming] = useState<WheelDestination | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!active || active.id === shown?.id) return;
    setIncoming(active);
    setFading(true);
    const t = window.setTimeout(() => {
      setShown(active);
      setIncoming(null);
      setFading(false);
    }, 320);
    return () => window.clearTimeout(t);
  }, [active, shown?.id]);

  const overlay = incoming ?? shown;
  const overlayIndex = useMemo(() => {
    if (!overlay) return safeIndex;
    const idx = items.findIndex((item) => item.id === overlay.id);
    return idx >= 0 ? idx : safeIndex;
  }, [items, overlay, safeIndex]);

  if (!shown || items.length === 0) return null;

  return (
    <div className="mt-sticky-panel">
      {showTripDetails ? (
        <div className="mt-sticky-meta">
          <span>
            Day {String(overlay?.day ?? shown.day).padStart(2, "0")} /{" "}
            {String(totalDays).padStart(2, "0")}
          </span>
          <span>{overlay?.dayTitle ?? shown.dayTitle}</span>
        </div>
      ) : null}

      <div className="destination-image-card" data-destination-card>
        {/* Base photograph — fills the card */}
        <img
          className={`destination-image${fading ? " is-exit" : ""}`}
          src={shown.image}
          alt={shown.imageAlt}
          decoding="async"
          referrerPolicy="no-referrer"
        />

        {/* Incoming photograph (crossfade) */}
        {incoming ? (
          <img
            className="destination-image destination-image--enter"
            src={incoming.image}
            alt={incoming.imageAlt}
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : null}

        {/* Dark bottom gradient — sibling of img, inside card */}
        <div className="destination-gradient" aria-hidden />

        {/* Destination copy — absolute child of card, painted ON the photo */}
        <div className={`destination-overlay-content${fading ? " is-swap" : ""}`}>
          <span className="destination-number">
            {String(overlayIndex + 1).padStart(2, "0")}
          </span>
          <h2 className="destination-title">{overlay?.name}</h2>
          {tagline ? <p className="destination-tagline">{tagline}</p> : null}
          <span className="destination-location">{overlay?.cityLabel}</span>
        </div>
      </div>
    </div>
  );
}
