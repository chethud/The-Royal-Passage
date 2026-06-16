import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Experience } from "@/data/experiences";

type ExperienceDetailGalleryProps = {
  exp: Experience;
};

export function ExperienceDetailGallery({ exp }: ExperienceDetailGalleryProps) {
  const gallery = exp.galleryUrls?.length ? exp.galleryUrls : exp.image ? [exp.image] : [];
  const [activeIndex, setActiveIndex] = useState(0);

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
    <figure
      className="experience-detail-gallery"
      aria-roledescription="carousel"
      aria-label={`${exp.title} photo gallery`}
    >
      <div className="experience-detail-gallery__frame group">
        <div className="experience-detail-gallery__inner">
          <img
            key={active}
            src={active}
            alt={`${exp.title} — photo ${activeIndex + 1} of ${gallery.length}`}
            className="experience-detail-gallery__image"
            width={1200}
            height={1500}
            decoding="async"
            fetchPriority="high"
          />
          <div className="experience-detail-gallery__vignette" aria-hidden />

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="experience-detail-gallery__nav experience-detail-gallery__nav--prev"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="experience-detail-gallery__nav experience-detail-gallery__nav--next"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </button>
            </>
          ) : null}
        </div>

        {hasMultiple ? (
          <figcaption className="experience-detail-gallery__caption">
            <span className="experience-detail-gallery__index">
              {String(activeIndex + 1).padStart(2, "0")}
              <span className="experience-detail-gallery__index-sep"> / </span>
              {String(gallery.length).padStart(2, "0")}
            </span>
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}
