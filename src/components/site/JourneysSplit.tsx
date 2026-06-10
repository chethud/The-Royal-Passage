import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

type MysuruSlide = {
  eyebrow: string;
  title: string;
  description: string;
  videoId: string;
};

const slides: MysuruSlide[] = [
  {
    eyebrow: "About Mysuru",
    title: "Visit Mysuru",
    description:
      "Step into the cultural heart of Karnataka — palaces, artisan lanes, slow mornings, and golden evenings in the city of kings.",
    videoId: "9Mbxfupo6Tw",
  },
  {
    eyebrow: "About Mysuru",
    title: "Mysuru Dasara",
    description:
      "Witness the grandeur of the Wadiyar legacy — processions, rituals, and celebrations that have defined Mysuru for centuries.",
    videoId: "imHm40ncWlA",
  },
  {
    eyebrow: "About Mysuru",
    title: "Dasara Lighting",
    description:
      "When the palace glows at dusk, Mysuru becomes a canvas of light — a royal spectacle you will remember forever.",
    videoId: "47MTWQ-sJvQ",
  },
];

const cinemaEase = [0.25, 0.1, 0.25, 1] as const;
const ROYAL_GOLD = "#D4AF37";

const particles = [
  { left: "8%", top: "18%", delay: "0s", size: 3 },
  { left: "22%", top: "72%", delay: "1.2s", size: 2 },
  { left: "48%", top: "12%", delay: "2.4s", size: 4 },
  { left: "68%", top: "58%", delay: "0.8s", size: 2 },
  { left: "84%", top: "28%", delay: "3.1s", size: 3 },
  { left: "92%", top: "78%", delay: "1.8s", size: 2 },
] as const;

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

function CornerOrnament({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 44 L4 20 C 4 10, 10 4, 20 4 L44 4"
        stroke={ROYAL_GOLD}
        strokeWidth="0.75"
        strokeOpacity="0.7"
      />
      <path
        d="M8 40 L8 22 C 8 14, 14 8, 22 8 L40 8"
        stroke={ROYAL_GOLD}
        strokeWidth="0.5"
        strokeOpacity="0.45"
      />
      <circle cx="12" cy="12" r="1.5" fill={ROYAL_GOLD} fillOpacity="0.55" />
      <path
        d="M16 6 L20 10 M6 16 L10 20"
        stroke={ROYAL_GOLD}
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />
    </svg>
  );
}

function RoyalSeal({ active }: { active: boolean }) {
  return (
    <span
      className={`relative flex h-4 w-4 items-center justify-center transition-all duration-500 ${
        active ? "scale-110" : "scale-90 opacity-50"
      }`}
    >
      <span
        className={`absolute inset-0 rounded-full border transition-all duration-500 ${
          active
            ? "border-[#D4AF37] shadow-[0_0_16px_#D4AF3766,inset_0_0_8px_#D4AF3744]"
            : "border-[#D4AF37]/30"
        }`}
      />
      <span
        className={`rounded-full transition-all duration-500 ${
          active ? "h-2 w-2 bg-[#D4AF37]" : "h-1 w-1 bg-[#D4AF37]/40"
        }`}
      />
      {active ? (
        <span
          className="pointer-events-none absolute -inset-1 rounded-full border border-[#D4AF37]/25"
          aria-hidden
        />
      ) : null}
    </span>
  );
}

type SlideContentProps = {
  slide: MysuruSlide;
  isActive: boolean;
  reducedMotion: boolean;
};

function SlideContent({ slide, isActive, reducedMotion }: SlideContentProps) {
  const duration = reducedMotion ? 0.2 : 1.2;
  const delay = reducedMotion ? 0 : 0.25;

  return (
    <div className="relative flex flex-col justify-center px-7 py-12 sm:px-12 sm:py-14 md:px-16 md:py-20">
      <div
        className="pointer-events-none absolute inset-y-8 left-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/35 to-transparent"
        aria-hidden
      />

      <motion.p
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0.35,
          y: isActive ? 0 : 12,
          x: isActive ? 0 : -16,
        }}
        transition={{ duration, delay, ease: cinemaEase }}
        className="mb-5 text-[0.68rem] font-medium uppercase tracking-[0.32em] text-[#D4AF37]"
      >
        {slide.eyebrow}
      </motion.p>

      <motion.div
        initial={false}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration: duration * 0.9, delay: delay + 0.1, ease: cinemaEase }}
        style={{ originX: 0 }}
        className="mb-5 h-px w-24 bg-gradient-to-r from-[#D4AF37] via-[#D4AF37]/70 to-transparent"
        aria-hidden
      />

      <motion.h2
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0.3,
          y: isActive ? 0 : 18,
          x: isActive ? 0 : -20,
        }}
        transition={{ duration, delay: delay + 0.15, ease: cinemaEase }}
        className="font-display text-3xl leading-[1.08] tracking-[0.04em] text-[#F8F4E8] text-balance sm:text-4xl md:text-[2.75rem]"
      >
        {slide.title}
      </motion.h2>

      <motion.div
        initial={false}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration: duration * 0.75, delay: delay + 0.35, ease: cinemaEase }}
        className="my-5 h-px max-w-md bg-gradient-to-r from-[#D4AF37]/55 via-[#D4AF37]/20 to-transparent"
        aria-hidden
      />

      <motion.p
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0.25,
          y: isActive ? 0 : 14,
          x: isActive ? 0 : -12,
        }}
        transition={{ duration, delay: delay + 0.45, ease: cinemaEase }}
        className="max-w-md text-sm leading-[1.85] text-[#F8F4E8]/72 text-balance sm:text-[0.95rem]"
      >
        {slide.description}
      </motion.p>
    </div>
  );
}

type SlideMediaProps = {
  slide: MysuruSlide;
  index: number;
  activeIndex: number;
  isActive: boolean;
  reducedMotion: boolean;
};

function SlideMedia({ slide, index, activeIndex, isActive, reducedMotion }: SlideMediaProps) {
  const duration = reducedMotion ? 0.2 : 1.4;

  return (
    <div className="relative min-h-[300px] overflow-hidden bg-[#2A0A0A] md:min-h-[460px]">
      <div
        className={`absolute inset-0 ${isActive && !reducedMotion ? "royal-slider-ken-burns" : ""}`}
      >
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

      {!isActive ? (
        <div className="pointer-events-none absolute inset-0 z-10 bg-[#2A0A0A]/80" aria-hidden />
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(90deg,#3D0000cc_0%,#3D000044_22%,transparent_42%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(180deg,#D4AF3718_0%,transparent_28%,transparent_72%,#2A0A0A88_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent"
        aria-hidden
      />

      {isActive && !reducedMotion ? (
        <div className="pointer-events-none absolute inset-0 z-30" aria-hidden>
          <motion.div
            key={`curtain-left-${slide.videoId}-${activeIndex}`}
            initial={{ x: "0%" }}
            animate={{ x: "-100%" }}
            transition={{ duration: duration * 0.85, ease: cinemaEase }}
            className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#3D0000] via-[#5B0000] to-[#5B0000ee]"
          />
          <motion.div
            key={`curtain-right-${slide.videoId}-${activeIndex}`}
            initial={{ x: "0%" }}
            animate={{ x: "100%" }}
            transition={{ duration: duration * 0.85, ease: cinemaEase }}
            className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#3D0000] via-[#5B0000] to-[#5B0000ee]"
          />
        </div>
      ) : null}

      <span className="sr-only">{`Slide ${index + 1}: ${slide.title}`}</span>
    </div>
  );
}

export function JourneysSplit() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const slideTransition = useMemo(
    () => ({
      duration: reducedMotion ? 0.25 : 1.35,
      ease: cinemaEase,
    }),
    [reducedMotion],
  );

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  }, []);

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  return (
    <section className="relative overflow-hidden bg-[#2A0A0A] py-16 sm:py-20 md:py-24">
      <div
        className="royal-slider-chandelier pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,#D4AF3728_0%,transparent_72%)]"
        aria-hidden
      />

      {!reducedMotion
        ? particles.map((particle) => (
            <span
              key={`${particle.left}-${particle.top}`}
              className="royal-slider-particle pointer-events-none absolute rounded-full bg-[#D4AF37]"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                animationDelay: particle.delay,
                boxShadow: "0 0 10px #D4AF3766",
              }}
              aria-hidden
            />
          ))
        : null}

      <div className="container-page relative">
        <div className="relative p-px">
          <div
            className="pointer-events-none absolute inset-0 rounded-sm bg-gradient-to-br from-[#D4AF37]/70 via-[#D4AF37]/25 to-[#D4AF37]/55"
            aria-hidden
          />

          <div className="royal-slider-paper relative overflow-hidden rounded-sm shadow-[0_24px_80px_-20px_#000000aa,0_0_60px_-10px_#D4AF3722,inset_0_1px_0_#D4AF3733]">
            <CornerOrnament className="pointer-events-none absolute top-3 left-3 z-40 h-10 w-10 sm:h-12 sm:w-12" />
            <CornerOrnament className="pointer-events-none absolute top-3 right-3 z-40 h-10 w-10 rotate-90 sm:h-12 sm:w-12" />
            <CornerOrnament className="pointer-events-none absolute bottom-3 left-3 z-40 h-10 w-10 -rotate-90 sm:h-12 sm:w-12" />
            <CornerOrnament className="pointer-events-none absolute right-3 bottom-3 z-40 h-10 w-10 rotate-180 sm:h-12 sm:w-12" />

            <div className="pointer-events-none absolute inset-x-8 top-0 z-30 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/45 to-transparent" />
            <div className="pointer-events-none absolute inset-x-8 bottom-0 z-30 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

            <div className="overflow-hidden">
              <motion.div
                className="flex"
                animate={{ x: `-${activeIndex * 100}%` }}
                transition={slideTransition}
                initial={false}
              >
                {slides.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={item.videoId}
                      className="grid w-full shrink-0 grid-cols-1 md:grid-cols-2"
                      aria-hidden={!isActive}
                    >
                      <SlideContent slide={item} isActive={isActive} reducedMotion={reducedMotion} />
                      <SlideMedia
                        slide={item}
                        index={index}
                        activeIndex={activeIndex}
                        isActive={isActive}
                        reducedMotion={reducedMotion}
                      />
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-5 sm:mt-10">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous Mysuru story"
            className="royal-nav-halo flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/45 bg-[#3D0000]/80 text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0A0A]"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.6} />
          </button>

          <div className="flex items-center gap-3 px-2">
            {slides.map((item, index) => (
              <button
                key={item.videoId}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Show ${item.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className="rounded-full p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50"
              >
                <RoyalSeal active={index === activeIndex} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next Mysuru story"
            className="royal-nav-halo flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/45 bg-[#3D0000]/80 text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0A0A]"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </section>
  );
}
