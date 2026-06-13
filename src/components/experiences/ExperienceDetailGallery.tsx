import { useState } from "react";
import type { Experience } from "@/data/experiences";

type ExperienceDetailGalleryProps = {
  exp: Experience;
};

export function ExperienceDetailGallery({ exp }: ExperienceDetailGalleryProps) {
  const gallery = exp.galleryUrls?.length ? exp.galleryUrls : exp.image ? [exp.image] : [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (gallery.length === 0) return null;

  const active = gallery[activeIndex] ?? gallery[0];

  return (
    <div className="space-y-4">
      <div className="aspect-[4/5] overflow-hidden rounded-md bg-muted ring-1 ring-[oklch(0.78_0.1_78_/_0.35)] ring-offset-2 ring-offset-background">
        <img
          src={active}
          alt={exp.title}
          className="h-full w-full object-cover"
          width={1200}
          height={1500}
          decoding="async"
          fetchPriority="high"
        />
      </div>
      {gallery.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {gallery.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`aspect-square overflow-hidden rounded-sm border transition-colors ${
                index === activeIndex
                  ? "border-ember ring-1 ring-ember/40"
                  : "border-[oklch(0.88_0.08_86_/_0.2)] hover:border-ember/50"
              }`}
              aria-label={`Show photo ${index + 1} of ${gallery.length}`}
              aria-pressed={index === activeIndex}
            >
              <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
