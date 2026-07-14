import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  EditableTextField,
} from "@/components/editor/EditableHomepageFields";
import {
  CornerFiligree,
  HeritageCompass,
  MaharajaEmblem,
  PalaceArchFrame,
} from "@/components/site/RoyalHeritageDecor";
import { DEFAULT_HOMEPAGE_JOURNEYS, type HomepageJourneySlide } from "@/lib/homepage-content";
import { normalizeYoutubeVideoInput } from "@/lib/youtube-video-id";
import logoUrl from "@/assets/logo/logo.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/site/ScrollReveal";

type SlideTheme = HomepageJourneySlide["theme"];

const SLIDE_TRANSITION_MS = 420;

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
  slide: HomepageJourneySlide;
  visible: boolean;
};

function SlideContent({ slide, visible }: SlideContentProps) {
  return (
    <div
      className={`royal-slide-content relative order-2 flex flex-col justify-center px-6 py-8 text-left sm:px-10 sm:py-14 md:order-1 md:px-12 md:py-16 ${visible ? "is-visible" : ""}`}
    >
      <div className="relative z-10 w-full max-w-xl self-start">
        <PalaceArchFrame className="pointer-events-none absolute -top-1 left-0 z-10 h-7 w-[min(100%,19rem)] opacity-70 sm:-top-2 sm:h-8 sm:w-[min(100%,22rem)]" />

        <div className="pointer-events-none absolute top-1 left-0 z-0 opacity-30 sm:top-2">
          {slide.theme === "manuscript" ? (
            <HeritageCompass className="h-11 w-11 text-[#D4AF37]/40 sm:h-14 sm:w-14" />
          ) : (
            <MaharajaEmblem className="h-11 w-11 text-[#D4AF37]/35 sm:h-14 sm:w-14" />
          )}
        </div>

        <p className="royal-slide-eyebrow relative z-10 mb-3 pt-7 text-[0.62rem] font-medium uppercase tracking-[0.38em] text-[#C9A227] sm:mb-4 sm:pt-8 sm:text-[0.68rem]">
          {slide.subtitle}
        </p>

        <div
          className="royal-slide-line royal-slide-line--top relative z-10 mb-4 h-px w-28 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-transparent sm:mb-5"
          aria-hidden
        />

        <h2 className="royal-slide-title font-display text-[1.45rem] leading-[1.12] tracking-[0.06em] text-balance sm:text-4xl md:text-[2.65rem]">
          {slide.title}
        </h2>

        <div
          className="royal-slide-line royal-slide-line--mid relative z-10 my-4 h-px max-w-md bg-gradient-to-r from-[#D4AF37]/60 via-[#C9A227]/25 to-transparent sm:my-5"
          aria-hidden
        />

        <div className="relative z-10 space-y-2.5 sm:space-y-3">
          {slide.lines.map((line, lineIndex) => (
            <p
              key={line}
              className="royal-slide-line max-w-md text-sm leading-[1.75] text-[#F8F4E8]/75 text-balance sm:text-[0.95rem] sm:leading-[1.9]"
              style={{ "--line-delay": `${0.55 + lineIndex * 0.12}s` } as React.CSSProperties}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

type SlideMediaProps = {
  slide: HomepageJourneySlide;
  isActive: boolean;
  reducedMotion: boolean;
  editable?: boolean;
  onVideoIdChange?: (videoId: string) => void;
};

function SlideMedia({
  slide,
  isActive,
  reducedMotion,
  editable,
  onVideoIdChange,
}: SlideMediaProps) {
  const [videoInput, setVideoInput] = useState(slide.videoId);

  useEffect(() => {
    setVideoInput(slide.videoId);
  }, [slide.videoId]);

  const commitVideoInput = () => {
    if (!onVideoIdChange) return;
    onVideoIdChange(normalizeYoutubeVideoInput(videoInput));
  };

  return (
    <div className="royal-slide-media relative order-1 aspect-video w-full min-h-[220px] overflow-hidden bg-black md:order-2 md:aspect-auto md:min-h-[480px]">
      <div
        className={`royal-slide-video absolute inset-0 z-[1] ${isActive && !reducedMotion ? "royal-slider-ken-burns" : ""}`}
      >
        <iframe
          key={`${slide.id}-${slide.videoId}`}
          title={slide.title}
          src={youtubeEmbedUrl(slide.videoId, isActive)}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading={isActive ? "eager" : "lazy"}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <img
        src={logoUrl}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-2 left-1 z-[3] h-14 w-auto max-w-[min(42vw,9rem)] origin-left -translate-x-0.5 object-contain object-left drop-shadow-[0_0_24px_oklch(0.75_0.12_86_/_0.5)] sm:top-4 sm:left-1.5 sm:h-28 sm:max-w-none md:left-2 md:h-32"
      />

      {editable && isActive && onVideoIdChange ? (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-50 border-t border-ember/45 bg-[#1a0505]/95 p-4 backdrop-blur-md">
          <p className="eyebrow mb-2 text-ember">Change video</p>
          <label className="block space-y-1.5">
            <span className="text-[0.62rem] uppercase tracking-[0.14em] text-ink/75">
              YouTube link or video ID
            </span>
            <input
              type="text"
              value={videoInput}
              placeholder="https://youtube.com/watch?v=… or 9Mbxfupo6Tw"
              onChange={(event) => setVideoInput(event.target.value)}
              onBlur={commitVideoInput}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitVideoInput();
                }
              }}
              className="w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/90 px-3 py-2 text-sm text-ink"
            />
          </label>
          <p className="mt-2 text-[0.65rem] leading-relaxed text-ink/70">
            Preview updates instantly. Click <strong className="font-semibold text-ember">Save changes</strong> in
            the admin bar at the top to publish for all visitors.
          </p>
        </div>
      ) : null}
    </div>
  );
}

type JourneysSplitProps = {
  slides: HomepageJourneySlide[];
  editable?: boolean;
  onSlidesChange?: (slides: HomepageJourneySlide[]) => void;
};

export function JourneysSplit({ slides: slidesProp, editable = false, onSlidesChange }: JourneysSplitProps) {
  const slides = slidesProp?.length ? slidesProp : DEFAULT_HOMEPAGE_JOURNEYS;
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
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

      const transitionMs = reducedMotion ? 80 : SLIDE_TRANSITION_MS;

      schedule(() => {
        setActiveIndex(next);
        setThemeFlash(slides[next].theme);
        setContentVisible(true);

        schedule(() => {
          setThemeFlash(null);
          setIsTransitioning(false);
          setIsLocked(false);
        }, transitionMs);
      }, transitionMs);
    },
    [activeIndex, clearTimers, isLocked, reducedMotion, schedule, slides],
  );

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    setContentVisible(true);
  }, []);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  const updateSlide = (index: number, patch: Partial<HomepageJourneySlide>) => {
    if (!onSlidesChange) return;
    onSlidesChange(slides.map((slide, idx) => (idx === index ? { ...slide, ...patch } : slide)));
  };

  const active = slides[activeIndex];

  return (
    <section
      className={`royal-heritage-section relative overflow-hidden pt-10 pb-8 sm:pt-12 sm:pb-10 md:pt-14 md:pb-12 ${isTransitioning ? "is-transitioning" : ""}`}
    >
      {editable && active ? (
        <div className="container-page relative z-20 mb-6">
          <div className="rounded-md border border-ember/35 bg-black/50 p-4 backdrop-blur-sm">
            <p className="eyebrow mb-1 text-ember">Edit — heritage slide {activeIndex + 1} of {slides.length}</p>
            <p className="mb-3 text-xs text-ink/75">
              Update the <strong className="text-ember">title</strong>, <strong className="text-ember">description</strong>, or{" "}
              <strong className="text-ember">YouTube link</strong> below, or use the video panel on the right.
              Switch slides with the medallions. Click <strong className="text-ember">Save changes</strong> in the bar at the top.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <EditableTextField
                label="YouTube link or video ID"
                value={active.videoId}
                onChange={(value) => updateSlide(activeIndex, { videoId: normalizeYoutubeVideoInput(value) })}
              />
              <EditableTextField
                label="Subtitle"
                value={active.subtitle}
                onChange={(subtitle) => updateSlide(activeIndex, { subtitle })}
              />
              <EditableTextField
                label="Title"
                value={active.title}
                onChange={(title) => updateSlide(activeIndex, { title })}
              />
              <EditableTextField
                label="Line 1"
                value={active.lines[0] ?? ""}
                onChange={(line) =>
                  updateSlide(activeIndex, {
                    lines: [line, active.lines[1] ?? "", active.lines[2] ?? ""].filter(Boolean),
                  })
                }
              />
              <EditableTextField
                label="Line 2"
                value={active.lines[1] ?? ""}
                onChange={(line) =>
                  updateSlide(activeIndex, {
                    lines: [active.lines[0] ?? "", line, active.lines[2] ?? ""].filter(Boolean),
                  })
                }
              />
              <EditableTextField
                label="Line 3"
                value={active.lines[2] ?? ""}
                onChange={(line) =>
                  updateSlide(activeIndex, {
                    lines: [active.lines[0] ?? "", active.lines[1] ?? "", line].filter(Boolean),
                  })
                }
              />
            </div>
          </div>
        </div>
      ) : null}
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
        <ScrollReveal depth3d offsetY={32}>
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
                    <SlideMedia
                      slide={item}
                      isActive={isActive}
                      reducedMotion={reducedMotion}
                      editable={editable}
                      onVideoIdChange={(videoId) => updateSlide(index, { videoId })}
                    />
                  </div>
                );
              })}

              {themeFlash ? (
                <div className={`royal-theme-flash royal-theme-flash--${themeFlash}`} aria-hidden />
              ) : null}
            </div>
          </div>
        </div>
        </ScrollReveal>

        <ScrollReveal depth3d delay={0.15} className="mt-6 flex items-center justify-center gap-6 sm:mt-8">
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
        </ScrollReveal>
      </div>
    </section>
  );
}
