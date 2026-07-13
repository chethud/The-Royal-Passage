import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Experience } from "@/data/experiences";
import { categoryIconForLabel } from "@/lib/experience-category-icons";
import { getExperienceGalleryImages } from "@/lib/experience-cover-image";
import { cn } from "@/lib/utils";

type ExperienceDetailGalleryProps = {
  exp: Experience;
  showTitleOnHover?: boolean;
};

export function ExperienceDetailGallery({
  exp,
  showTitleOnHover = false,
}: ExperienceDetailGalleryProps) {
  const photos = getExperienceGalleryImages(exp);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const CategoryIcon = categoryIconForLabel(exp.category);

  if (photos.length === 0) return null;

  const activePhoto = photos[activeIndex] ?? photos[0];
  const hasMultiple = photos.length > 1;

  const goTo = (index: number, direction: "next" | "prev") => {
    setSlideDirection(direction);
    setActiveIndex(index);
  };

  return (
    <div className="flex items-start gap-2.5 sm:gap-3">
      {hasMultiple ? (
        <div
          className="flex shrink-0 flex-col gap-2"
          role="tablist"
          aria-label={`${exp.title} photo thumbnails`}
        >
          {photos.map((url, index) => (
            <button
              key={url}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show photo ${index + 1}`}
              onClick={() => goTo(index, index >= activeIndex ? "next" : "prev")}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-sm border transition-colors sm:h-20 sm:w-24",
                index === activeIndex
                  ? "border-[#D4AF6A] ring-1 ring-[#D4AF6A]/60"
                  : "border-[rgb(200_162_90/0.25)] opacity-80 hover:opacity-100",
              )}
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div
        className="experience-detail-gallery-main relative min-w-0 flex-1 overflow-hidden rounded-md border border-[rgb(200_162_90/0.32)] bg-[rgb(0_0_0/0.2)] shadow-[0_24px_56px_-28px_rgb(0_0_0/0.65)]"
        aria-label={`${exp.title} photos`}
      >
        {/* Hover target is only the photo — not arrows / counter / category chip */}
        <div className="group/photo relative h-full">
          <div className="experience-detail-gallery__frame h-full">
            <div
              key={activePhoto}
              className={cn(
                "experience-detail-gallery__slide h-full",
                slideDirection === "prev" && "experience-detail-gallery__slide--prev",
              )}
            >
              <img
                src={activePhoto}
                alt={`${exp.title} photo ${activeIndex + 1} of ${photos.length}`}
                className="experience-detail-gallery__image aspect-[3/4] h-full w-full object-cover sm:aspect-[3/4] md:aspect-auto md:h-[min(78vh,720px)]"
                width={1200}
                height={1600}
                decoding="async"
                fetchPriority={activeIndex === 0 ? "high" : "auto"}
              />
            </div>
          </div>

          {showTitleOnHover ? (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-[oklch(0.12_0.06_22_/_0.92)] via-[oklch(0.12_0.06_22_/_0.55)] to-transparent px-4 pb-5 pt-16 opacity-0 transition-opacity duration-200 group-hover/photo:opacity-100 sm:pb-6"
              aria-hidden
            >
              <p className="font-display text-[1.15rem] uppercase leading-[1.08] tracking-[0.03em] text-[#F7F1E8] drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] sm:text-2xl md:text-[1.85rem]">
                {exp.title}
              </p>
            </div>
          ) : null}
        </div>

        <div className="pointer-events-none absolute left-3.5 top-3.5 z-10">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-[#D4AF6A] backdrop-blur-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
            aria-label={exp.category}
            title={exp.category}
          >
            <CategoryIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
        </div>

        {hasMultiple ? (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgb(200_162_90/0.35)] bg-black/45 text-[#E8DCC8] backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label="Previous photo"
              onClick={() =>
                goTo(activeIndex <= 0 ? photos.length - 1 : activeIndex - 1, "prev")
              }
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgb(200_162_90/0.35)] bg-black/45 text-[#E8DCC8] backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label="Next photo"
              onClick={() =>
                goTo(activeIndex >= photos.length - 1 ? 0 : activeIndex + 1, "next")
              }
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <div className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-full bg-black/50 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[#E8DCC8] backdrop-blur-sm">
              {activeIndex + 1} / {photos.length}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
