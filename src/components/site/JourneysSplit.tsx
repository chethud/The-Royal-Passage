import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

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

const softEase = [0.22, 1, 0.36, 1] as const;

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

const navButtonClass =
  "flex h-11 w-11 items-center justify-center rounded-full border border-[oklch(0.88_0.08_86_/_0.4)] bg-[oklch(0.14_0.05_22_/_0.65)] text-ember shadow-[inset_0_1px_0_oklch(0.9_0.06_82_/_0.15),0_0_16px_oklch(0.7_0.12_78_/_0.2)] backdrop-blur-md transition-all hover:border-ember/70 hover:bg-ember/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40";

export function JourneysSplit() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = slides[activeIndex];

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  }, []);

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  return (
    <section className="bg-background py-16 sm:py-20 md:py-24">
      <div className="container-page">
        <div className="grid overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] bg-[oklch(0.17_0.07_22)] shadow-soft md:grid-cols-2">
          <div className="flex min-h-[280px] flex-col justify-between px-6 py-10 sm:px-12 sm:py-12 md:min-h-[420px] md:px-14 md:py-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.videoId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: softEase }}
              >
                <div className="eyebrow mb-4 text-ember/95">{slide.eyebrow}</div>
                <h2 className="font-display text-3xl leading-[1.1] tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
                  {slide.title}
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground text-balance sm:mt-6 sm:text-base">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-4 pt-8">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous Mysuru story"
                className={navButtonClass}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
              </button>

              <div className="flex items-center gap-2">
                {slides.map((item, index) => (
                  <button
                    key={item.videoId}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Show ${item.title}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                    className={`h-1 transition-all ${
                      index === activeIndex ? "w-10 bg-ember" : "w-6 bg-ink/30 hover:bg-ink/55"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next Mysuru story"
                className={navButtonClass}
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="relative min-h-[280px] bg-black md:min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.videoId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: softEase }}
                className="absolute inset-0"
              >
                <iframe
                  title={slide.title}
                  src={youtubeEmbedUrl(slide.videoId, true)}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="eager"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </motion.div>
            </AnimatePresence>
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(0.17_0.07_22_/_0.45)_0%,transparent_28%)]"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
