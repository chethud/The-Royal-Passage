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
          <p className="trail-collage-chapter">The Royal Mysuru Journey</p>
        </div>
      ) : (
        <div className="trail-collage-head">
          <p className="trail-collage-chapter">The Royal Mysuru Journey</p>
        </div>
      )}

      <div className="trail-circular-stage">
        <CircularGallery
          items={galleryItems}
          activeIndex={activeIndex}
          bend={-0.45}
          borderRadius={0.035}
          scrollEase={0.04}
          scrollSpeed={1}
        />
      </div>

      <div className="trail-collage-caption">
        <p className="trail-collage-caption-num">
          {String(activeIndex + 1).padStart(2, "0")}
          <span> / {String(items.length).padStart(2, "0")} destinations</span>
        </p>
        <p className="trail-collage-caption-name">{active.shortName}</p>
        <p className="trail-collage-caption-city">{active.cityLabel}</p>
      </div>
    </div>
  );
}
