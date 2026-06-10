import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  CornerFiligree,
  HeritageCompass,
  MaharajaEmblem,
  PalaceArchFrame,
  PalaceDoorPanel,
} from "@/components/site/RoyalHeritageDecor";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type SlideTheme = "palace" | "manuscript" | "dasara";

type HeritageSlide = {
  id: string;
  title: string;
  subtitle: string;
  lines: string[];
  videoId: string;
  theme: SlideTheme;
};

const slides: HeritageSlide[] = [
  {
    id: "palace",
    title: "The Majestic Palace",
    subtitle: "The Crown Jewel of Mysuru",
    lines: [
      "Breathe in the golden hour as sunlight crowns every dome.",
      "Birds arc above carved sandstone as the kingdom awakens.",
      "You have crossed the threshold — the palace welcomes its guest.",
    ],
    videoId: "9Mbxfupo6Tw",
    theme: "palace",
  },
  {
    id: "heritage",
    title: "The Heritage of the Kingdom",
    subtitle: "Stories Carved Through Time",
    lines: [
      "Ancient streets whisper of silk looms and sandalwood ateliers.",
      "Royal markets, vintage maps, and manuscripts preserve a living dynasty.",
      "Each lane is a chapter inked in gold upon the soul of Mysuru.",
    ],
    videoId: "imHm40ncWlA",
    theme: "manuscript",
  },
  {
    id: "dasara",
    title: "The Grand Dasara Celebration",
    subtitle: "The Festival of Royal Glory",
    lines: [
      "The palace ignites with a thousand lanterns at dusk.",
      "Processions, dancers, and decorated elephants honour the Wadiyar legacy.",
      "Witness the peak of royal grandeur beneath a canopy of gold.",
    ],
    videoId: "47MTWQ-sJvQ",
    theme: "dasara",
  },
];

const DOOR_CLOSE_MS = 380;
const DOOR_OPEN_MS = 2400;
const CONTENT_REVEAL_MS = 520;

const dustParticles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${8 + i * 11}%`,
  top: `${10 + ((i * 19) % 70)}%`,
  delay: `${i * 0.9}s`,
}));

function youtubeEmbedUrl(videoId: string, autoplay: boolean) {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

function RoyalMedallion({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`royal-medallion relative flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10 ${active ? "is-active" : ""}`}>
      <span className="royal-medallion-ring absolute inset-0 rounded-full border-2 border-[#D4AF37]/35" />
      <span className="royal-medallion-inner absolute inset-1 rounded-full border border-[#D4AF37]/20" />
      <MaharajaEmblem className="relative h-5 w-5 text-[#D4AF37]/70 sm:h-6 sm:w-6" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

type SlideContentProps = {
  slide: HeritageSlide;
  visible: boolean;
};

function SlideContent({ slide, visible }: SlideContentProps) {
  return (
    <div className={`royal-slide-content relative flex flex-col justify-center px-7 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20 ${visible ? "is-visible" : ""}`}>
      <PalaceArchFrame className="pointer-events-none absolute top-6 right-8 left-8 z-10 h-8 opacity-70 sm:top-8" />

      <div className="pointer-events-none absolute top-10 right-10 opacity-30">
        {slide.theme === "manuscript" ? (
          <HeritageCompass className="h-14 w-14 text-[#D4AF37]/40" />
        ) : (
          <MaharajaEmblem className="h-10 w-10 text-[#D4AF37]/35" />
        )}
      </div>

      <p className="royal-slide-eyebrow relative z-10 mb-4 text-[0.62rem] font-medium uppercase tracking-[0.38em] text-[#C9A227] sm:text-[0.68rem]">
        {slide.subtitle}
      </p>

      <div className="royal-slide-line royal-slide-line--top relative z-10 mb-5 h-px w-28 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-transparent" aria-hidden />

      <h2 className="royal-slide-title font-display text-[1.65rem] leading-[1.12] tracking-[0.06em] text-balance sm:text-4xl md:text-[2.65rem]">
        {slide.title}
      </h2>

      <div className="royal-slide-line royal-slide-line--mid relative z-10 my-5 h-px max-w-md bg-gradient-to-r from-[#D4AF37]/60 via-[#C9A227]/25 to-transparent" aria-hidden />

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

type SlideMediaProps = {
  slide: HeritageSlide;
  isActive: boolean;
  visible: boolean;
  reducedMotion: boolean;
};

function SlideMedia({ slide, isActive, visible, reducedMotion }: SlideMediaProps) {
  return (
    <div className={`royal-slide-media relative min-h-[320px] overflow-hidden bg-black md:min-h-[480px] ${visible ? "is-visible" : ""}`}>
      <div className={`royal-slide-video absolute inset-0 ${isActive && !reducedMotion ? "royal-slider-ken-burns" : ""}`}>
        <iframe
          title={slide.title}
          src={youtubeEmbedUrl(slide.videoId, isActive)}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading={isActive ? "eager" : "lazy"}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}

export function JourneysSplit() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState(true);
  const [contentVisible, setContentVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [themeFlash, setThemeFlash] = useState<SlideTheme | null>(null);
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
      setDoorsOpen(false);

      const closeMs = reducedMotion ? 120 : DOOR_CLOSE_MS;
      const openMs = reducedMotion ? 280 : DOOR_OPEN_MS;
      const revealMs = reducedMotion ? 80 : CONTENT_REVEAL_MS;

      schedule(() => {
        setActiveIndex(next);
        setThemeFlash(slides[next].theme);
        setDoorsOpen(true);

        schedule(() => {
          setContentVisible(true);
          setThemeFlash(null);
        }, revealMs);

        schedule(() => {
          setIsTransitioning(false);
          setIsLocked(false);
        }, openMs);
      }, closeMs);
    },
    [activeIndex, clearTimers, isLocked, reducedMotion, schedule],
  );

  useEffect(() => () => clearTimers(), [clearTimers]);

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  return (
    <section
      className={`royal-heritage-section relative overflow-hidden bg-[#2A0A0A] py-16 sm:py-20 md:py-28 ${isTransitioning ? "is-transitioning" : ""}`}
    >
      <div className="royal-light-rays pointer-events-none absolute inset-0" aria-hidden />
      <div className="royal-vintage-fog pointer-events-none absolute inset-0" aria-hidden />
      <div className="royal-slider-chandelier pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,#D4AF3722_0%,transparent_72%)]" aria-hidden />

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
        <div className="relative p-px">
          <div className="pointer-events-none absolute inset-0 rounded-sm bg-gradient-to-br from-[#D4AF37]/70 via-[#C9A227]/25 to-[#D4AF37]/50" />

          <div
            className={`royal-heritage-frame relative overflow-hidden rounded-sm shadow-[0_24px_70px_-20px_#000000aa,0_0_50px_-12px_#D4AF3722] ${isTransitioning ? "is-transitioning" : ""}`}
          >
            <CornerFiligree className="pointer-events-none absolute top-3 left-3 z-40 h-10 w-10 sm:h-12 sm:w-12" />
            <CornerFiligree className="pointer-events-none absolute top-3 right-3 z-40 h-10 w-10 rotate-90 sm:h-12 sm:w-12" />
            <CornerFiligree className="pointer-events-none absolute bottom-3 left-3 z-40 h-10 w-10 -rotate-90 sm:h-12 sm:w-12" />
            <CornerFiligree className="pointer-events-none absolute right-3 bottom-3 z-40 h-10 w-10 rotate-180 sm:h-12 sm:w-12" />

            <div className="relative min-h-[520px] md:min-h-[480px]">
              {slides.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={item.id}
                    className={`royal-slide-layer absolute inset-0 grid grid-cols-1 transition-opacity duration-500 md:grid-cols-2 ${
                      isActive ? "z-10 opacity-100" : "z-0 opacity-0"
                    }`}
                    aria-hidden={!isActive}
                  >
                    <SlideContent slide={item} visible={isActive && contentVisible} />
                    <SlideMedia
                      slide={item}
                      isActive={isActive}
                      visible={isActive && contentVisible}
                      reducedMotion={reducedMotion}
                    />
                  </div>
                );
              })}

              {themeFlash ? (
                <div className={`royal-theme-flash royal-theme-flash--${themeFlash}`} aria-hidden />
              ) : null}

              <div
                className={`royal-golden-burst pointer-events-none absolute inset-0 z-[38] ${doorsOpen && contentVisible ? "" : "is-active"}`}
                aria-hidden
              />

              <div className={`royal-doors absolute inset-0 z-[45] overflow-hidden ${doorsOpen ? "is-open" : "is-closed"}`}>
                <div className="royal-door royal-door--left">
                  <PalaceDoorPanel side="left" />
                </div>
                <div className="royal-door royal-door--right">
                  <PalaceDoorPanel side="right" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 sm:mt-12">
          <button
            type="button"
            onClick={goPrev}
            disabled={isLocked}
            aria-label="Previous royal chapter"
            className="royal-nav-halo flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#3B0000]/85 text-[#D4AF37] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.6} />
          </button>

          <div className="flex items-center gap-4 px-2">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                disabled={isLocked}
                aria-label={`Chapter ${index + 1}: ${item.title}`}
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
            aria-label="Next royal chapter"
            className="royal-nav-halo flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#3B0000]/85 text-[#D4AF37] disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </section>
  );
}
