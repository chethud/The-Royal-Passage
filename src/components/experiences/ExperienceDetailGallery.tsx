import { useState } from "react";
import type { Experience } from "@/data/experiences";
import { categoryIconForLabel } from "@/lib/experience-category-icons";

type ExperienceDetailGalleryProps = {
  exp: Experience;
};

export function ExperienceDetailGallery({ exp }: ExperienceDetailGalleryProps) {
  const gallery = exp.galleryUrls?.length ? exp.galleryUrls : exp.image ? [exp.image] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const CategoryIcon = categoryIconForLabel(exp.category);

  if (gallery.length === 0) return null;

  const active = gallery[activeIndex] ?? gallery[0];

  return (
    <div className="space-y-4">
      <div className="experience-detail-gallery-main relative w-full overflow-hidden rounded-md border border-[rgb(200_162_90/0.32)] bg-[rgb(0_0_0/0.2)] shadow-[0_24px_56px_-28px_rgb(0_0_0/0.65)]">
        <img
          src={active}
          alt={exp.title}
          className="aspect-[4/5] w-full object-cover md:aspect-auto md:h-[min(70vh,640px)]"
          width={1200}
          height={1500}
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute left-3.5 top-3.5 z-10">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-[#D4AF6A] backdrop-blur-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
            aria-label={exp.category}
            title={exp.category}
          >
            <CategoryIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
        </div>
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
                  ? "border-[#D4AF6A] ring-1 ring-[#D4AF6A]/35"
                  : "border-[rgb(200_162_90/0.22)] hover:border-[#D4AF6A]/50"
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
