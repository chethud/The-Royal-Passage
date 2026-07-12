import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  CornerFiligree,
  MaharajaEmblem,
  PalaceArchFrame,
} from "@/components/site/RoyalHeritageDecor";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  HOMESTAY_HIGHLIGHT_SLIDES,
  type HomestayHighlightSlide,
} from "@/lib/homestay-home-content";

const SLIDE_TRANSITION_MS = 420;

const dustParticles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${8 + i * 11}%`,
  top: `${10 + ((i * 19) % 70)}%`,
  delay: `${i * 0.9}s`,
}));

function RoyalMedallion({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`royal-medallion relative flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10 ${active ? "is-active" : ""}`}
    >
      <span className="royal-medallion-ring absolute inset-0 rounded-full border-2 border-[#D4AF37]/35" />
      <span className="royal-medallion-inner absolute inset-1 rounded-full border border-[#D4AF37]/20" />
      <MaharajaEmblem className="relative h-5 w-5 text-[#D4AF37]/70 sm:h-6 sm:w-6" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function SlideContent({ slide, visible }: { slide: HomestayHighlightSlide; visible: boolean }) {
  return (
    <div
      className={`royal-slide-content relative order-2 flex flex-col justify-center px-5 py-8 sm:px-12 sm:py-16 md:order-none md:px-16 md:py-20 ${visible ? "is-visible" : ""}`}
    >
      <PalaceArchFrame className="pointer-events-none absolute top-6 right-8 left-8 z-10 h-8 opacity-70 sm:top-8" />

      <div className="pointer-events-none absolute top-10 right-10 opacity-30">
        <MaharajaEmblem className="h-10 w-10 text-[#D4AF37]/35" />
      </div>

      <p className="royal-slide-eyebrow relative z-10 mb-4 text-[0.62rem] font-medium uppercase tracking-[0.38em] text-[#C9A227] sm:text-[0.68rem]">
        {slide.subtitle}
      </p>

      <div
        className="royal-slide-line royal-slide-line--top relative z-10 mb-5 h-px w-28 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-transparent"
        aria-hidden
      />

      <h2 className="royal-slide-title font-display text-[1.65rem] leading-[1.12] tracking-[0.06em] text-balance sm:text-4xl md:text-[2.65rem]">
        {slide.title}
      </h2>

      <div
        className="royal-slide-line royal-slide-line--mid relative z-10 my-5 h-px max-w-md bg-gradient-to-r from-[#D4AF37]/60 via-[#C9A227]/25 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 space-y-3">
        {slide.lines.map((line, lineIndex) => (
          <p
            key={line}
            className="royal-slide-line max-w-md text-sm leading-[1.9] text-[#F8F4E8]/75 text-balance sm:text-[0.95rem]"
            style={{ "--line-delay": `${0.55 + lineIndex * 0.12}s` } as React.CSSProperties}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function SlideMedia({ slide, isActive, reducedMotion }: { slide: HomestayHighlightSlide; isActive: boolean; reducedMotion: boolean }) {
  return (
    <div className="royal-slide-media relative order-1 min-h-[220px] overflow-hidden bg-black sm:min-h-[320px] md:order-none md:min-h-[480px]">
      <div
        className={`royal-slide-video absolute inset-0 z-[1] ${isActive && !reducedMotion ? "royal-slider-ken-burns" : ""}`}
      >
        <img
          src={slide.image}
          alt={slide.imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          loading={isActive ? "eager" : "lazy"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A0A0A]/55 via-transparent to-[#2A0A0A]/20" />
      </div>
    </div>
  );
}

export function HomestayHighlightsSplit() {
  const slides = HOMESTAY_HIGHLIGHT_SLIDES;
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const next = (index + slides.length) % slides.length;
      if (isLocked || next === activeIndex) return;

      clearTimers();
      setIsLocked(true);
      setIsTransitioning(true);
      setContentVisible(false);

      const transitionMs = reducedMotion ? 80 : SLIDE_TRANSITION_MS;

      schedule(() => {
        setActiveIndex(next);
        setContentVisible(true);

        schedule(() => {
          setIsTransitioning(false);
          setIsLocked(false);
        }, transitionMs);
      }, transitionMs);
    },
    [activeIndex, clearTimers, isLocked, reducedMotion, schedule, slides.length],
  );

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    setContentVisible(true);
  }, []);

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  return (
    <section
      className={`royal-heritage-section relative overflow-hidden bg-[#2A0A0A] py-16 sm:py-20 md:py-28 ${isTransitioning ? "is-transitioning" : ""}`}
    >
      <div className="royal-light-rays pointer-events-none absolute inset-0" aria-hidden />
      <div className="royal-vintage-fog pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="royal-slider-chandelier pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,#D4AF3722_0%,transparent_72%)]"
        aria-hidden
      />

      {!reducedMotion
        ? dustParticles.map((p) => (
            <span
              key={p.id}
              className="royal-slider-particle pointer-events-none absolute h-1 w-1 rounded-full bg-[#D4AF37]/80"
              style={{ left: p.left, top: p.top, animationDelay: p.delay }}
              aria-hidden
            />
          ))
        : null}

      <div className="container-page relative">
        <div className="mb-10 text-center sm:mb-12">
          <p className="eyebrow text-ember/90">Stay categories</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
            Find Your Kind of Stay
          </h2>
        </div>

        <div className="relative p-px">
          <div className="pointer-events-none absolute inset-0 rounded-sm bg-gradient-to-br from-[#D4AF37]/70 via-[#C9A227]/25 to-[#D4AF37]/50" />

          <div
            className={`royal-heritage-frame relative overflow-hidden rounded-sm shadow-[0_24px_70px_-20px_#000000aa,0_0_50px_-12px_#D4AF3722] ${isTransitioning ? "is-transitioning" : ""}`}
          >
            <CornerFiligree className="pointer-events-none absolute top-3 left-3 z-40 h-10 w-10 sm:h-12 sm:w-12" />
            <CornerFiligree className="pointer-events-none absolute top-3 right-3 z-40 h-10 w-10 rotate-90 sm:h-12 sm:w-12" />
            <CornerFiligree className="pointer-events-none absolute bottom-3 left-3 z-40 h-10 w-10 -rotate-90 sm:h-12 sm:w-12" />
            <CornerFiligree className="pointer-events-none absolute right-3 bottom-3 z-40 h-10 w-10 rotate-180 sm:h-12 sm:w-12" />

            <div className="relative md:min-h-[480px]">
              {slides.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={item.id}
                    className={`royal-slide-layer grid grid-cols-1 transition-opacity duration-500 md:absolute md:inset-0 md:grid-cols-2 ${
                      isActive
                        ? "relative z-10 opacity-100"
                        : "pointer-events-none absolute inset-0 z-0 h-0 overflow-hidden opacity-0 md:h-auto md:overflow-visible"
                    }`}
                    aria-hidden={!isActive}
                  >
                    <SlideContent slide={item} visible={isActive && contentVisible} />
                    <SlideMedia slide={item} isActive={isActive} reducedMotion={reducedMotion} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 sm:mt-12 sm:gap-6">
          <button
            type="button"
            onClick={goPrev}
            disabled={isLocked}
            aria-label="Previous stay category"
            className="royal-nav-halo flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#3B0000]/85 text-[#D4AF37] disabled:opacity-40 sm:h-12 sm:w-12"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.6} />
          </button>

          <div className="flex items-center gap-2 px-1 sm:gap-4 sm:px-2">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                disabled={isLocked}
                aria-label={`Category ${index + 1}: ${item.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className="royal-medallion-btn rounded-full p-1 disabled:opacity-40"
              >
                <RoyalMedallion active={index === activeIndex} label={item.title} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={isLocked}
            aria-label="Next stay category"
            className="royal-nav-halo flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#3B0000]/85 text-[#D4AF37] disabled:opacity-40 sm:h-12 sm:w-12"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </section>
  );
}
