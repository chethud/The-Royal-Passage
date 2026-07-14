import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";
import {
  createDefaultHomestaySearchValues,
  HomestaysSearchWidget,
  type HomestaySearchValues,
} from "@/components/homestays/HomestaysSearchWidget";
import { HOMESTAY_HERO_SLIDES } from "@/lib/homestay-home-content";
import { withHomepageCacheBust, type HomepageHeroSlide } from "@/lib/homepage-content";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const softEase = [0.22, 1, 0.36, 1] as const;

const revealParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const revealItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: softEase } },
};

type HomestaysHomeHeroProps = {
  slides?: HomepageHeroSlide[];
  imageVersion?: number;
};

export function HomestaysHomeHero({ slides, imageVersion = 0 }: HomestaysHomeHeroProps) {
  const reduceMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [search, setSearch] = useState<HomestaySearchValues>(() => createDefaultHomestaySearchValues());

  const heroImages = useMemo(() => {
    const source =
      slides && slides.length > 0
        ? slides
        : HOMESTAY_HERO_SLIDES.map((slide, index) => ({
            id: `fallback-${index}`,
            imageUrl: slide.src,
            alt: slide.alt,
          }));
    return source.map((slide) => ({
      src: withHomepageCacheBust(slide.imageUrl, imageVersion),
      alt: slide.alt,
    }));
  }, [imageVersion, slides]);

  const goToBrowse = () => {
    void navigate({
      to: "/homestays/browse",
      search: {
        q: search.q?.trim() || undefined,
        checkIn: search.checkIn || undefined,
        checkOut: search.checkOut || undefined,
        guests: search.guests && search.guests > 0 ? search.guests : undefined,
      },
    });
  };

  return (
    <>
      <section className="relative w-full overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.18)] lg:min-h-[max(520px,72dvh)]">
        <div className="absolute inset-0 z-0 min-h-full">
          <HeroSlideshow
            images={heroImages}
            reduceMotion={reduceMotion}
            intervalMs={6000}
            activeIndex={activeSlide}
            onActiveIndexChange={setActiveSlide}
            className="absolute inset-0 h-full w-full"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(95deg,oklch(0.12_0.06_22_/_0.86)_0%,oklch(0.12_0.06_22_/_0.62)_42%,oklch(0.12_0.06_22_/_0.28)_72%,oklch(0.12_0.06_22_/_0.55)_100%)]"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex flex-col lg:min-h-[max(520px,72dvh)]">
          <div className="container-page flex flex-1 flex-col items-start justify-center pt-[var(--header-height)]">
            <div className="w-full py-10 text-left sm:py-14 md:py-20">
              <motion.div
                className="mr-auto max-w-2xl text-left"
                variants={revealParent}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={revealItem} className="eyebrow mb-4 text-left text-ember/95 sm:mb-5">
                  Royal Homestays
                </motion.div>
                <motion.h1
                  variants={revealItem}
                  className="text-left font-display text-[clamp(2rem,10vw,5.5rem)] font-semibold leading-[0.95] tracking-tight text-ink [text-shadow:0_0.06em_0.4em_oklch(0.05_0.04_18_/_0.85)]"
                >
                  Stay in
                  <br />
                  <span className="text-ember [text-shadow:0_0_1.1em_oklch(0.55_0.14_78_/_0.45)]">
                    Mysuru,
                  </span>
                  <br />
                  Royally
                </motion.h1>
                <motion.p
                  variants={revealItem}
                  className="mt-5 max-w-md text-left text-[0.9rem] leading-relaxed text-ink/85 sm:mt-7 sm:text-[1.05rem] md:max-w-lg"
                >
                  Heritage havelis, villas, and guest houses in Mysuru — each vetted for warmth, location,
                  and Royal Passage hospitality.
                </motion.p>
              </motion.div>
            </div>
          </div>

          <div className="pointer-events-auto relative z-20 container-page flex items-center justify-start gap-2 pb-8 sm:pb-10">
            {heroImages.map((slide, i) => (
              <button
                key={`${slide.src}-${i}`}
                type="button"
                onClick={() => setActiveSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 min-w-[24px] transition-all ${
                  i === activeSlide ? "w-10 bg-ember" : "w-6 bg-ink/30 hover:bg-ink/55"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <motion.section
        id="homestay-search"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.2, ease: softEase }}
        className="relative z-10 border-b border-[oklch(0.72_0.09_78_/_0.18)] bg-background py-6 sm:py-8"
      >
        <div className="container-page max-w-5xl">
          <HomestaysSearchWidget
            values={search}
            onChange={(patch) => setSearch((current) => ({ ...current, ...patch }))}
            onSubmit={goToBrowse}
          />
        </div>
      </motion.section>
    </>
  );
}
