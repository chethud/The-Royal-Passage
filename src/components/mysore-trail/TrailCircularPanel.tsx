import { useMemo } from "react";
import CircularGallery from "@/components/mysore-trail/CircularGallery";
import type { WheelDestination } from "@/components/mysore-trail/ImageWheel3D";

type TrailCircularPanelProps = {
  items: WheelDestination[];
  activeIndex: number;
  totalDays: number;
  showTripDetails?: boolean;
};

export function TrailCircularPanel({
  items,
  activeIndex,
  totalDays,
  showTripDetails = false,
}: TrailCircularPanelProps) {
  const active = items[activeIndex] ?? items[0];
  const galleryItems = useMemo(
    () =>
      items.map((item) => ({
        image: item.image,
        text: item.shortName.toUpperCase(),
      })),
    [items],
  );

  if (!active || items.length === 0) return null;

  return (
    <div className="trail-collage trail-circular-panel">
      {showTripDetails ? (
        <div className="trail-collage-head">
          <p className="trail-collage-eyebrow">
            DAY {String(active.day).padStart(2, "0")} / {String(totalDays).padStart(2, "0")}
          </p>
        </div>
      ) : null}

      <div className="trail-circular-stage">
        <CircularGallery
          items={galleryItems}
          activeIndex={activeIndex}
          bend={-0.28}
          borderRadius={0.02}
          scrollEase={0.04}
          scrollSpeed={1}
        />
      </div>
    </div>
  );
}
