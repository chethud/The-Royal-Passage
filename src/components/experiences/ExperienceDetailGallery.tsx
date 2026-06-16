import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Experience } from "@/data/experiences";
import { categoryIconForLabel } from "@/lib/experience-category-icons";

type ExperienceDetailGalleryProps = {
  exp: Experience;
};

export function ExperienceDetailGallery({ exp }: ExperienceDetailGalleryProps) {
  const gallery = exp.galleryUrls?.length ? exp.galleryUrls : exp.image ? [exp.image] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const CategoryIcon = categoryIconForLabel(exp.category);

  const goTo = useCallback(
    (index: number) => {
      if (gallery.length === 0) return;
      const wrapped = ((index % gallery.length) + gallery.length) % gallery.length;
      setActiveIndex(wrapped);
    },
    [gallery.length],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    if (activeIndex >= gallery.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, gallery.length]);

  useEffect(() => {
    if (gallery.length <= 1) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gallery.length, goNext, goPrev]);

  if (gallery.length === 0) return null;

  const active = gallery[activeIndex] ?? gallery[0];
  const hasMultiple = gallery.length > 1;

  return (
    <div className="space-y-4">
      <div
        className="experience-detail-gallery-main group relative w-full overflow-hidden rounded-md border border-[rgb(200_162_90/0.32)] bg-[rgb(0_0_0/0.2)] shadow-[0_24px_56px_-28px_rgb(0_0_0/0.65)]"
        aria-roledescription="carousel"
        aria-label={`${exp.title} photo gallery`}
      >
        <img
          src={active}
          alt={`${exp.title} — photo ${activeIndex + 1} of ${gallery.length}`}
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

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgb(200_162_90/0.35)] bg-black/45 text-[#F7F1E8] opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgb(200_162_90/0.35)] bg-black/45 text-[#F7F1E8] opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Gallery photos">
                {gallery.map((url, index) => (
                  <button
                    key={`${url}-dot-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={`Show photo ${index + 1} of ${gallery.length}`}
                    onClick={() => goTo(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === activeIndex
                        ? "scale-110 bg-[#D4AF6A]"
                        : "bg-[#F7F1E8]/45 hover:bg-[#F7F1E8]/70"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#F7F1E8]/85">
                {activeIndex + 1}/{gallery.length}
              </span>
            </div>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {gallery.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => goTo(index)}
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
