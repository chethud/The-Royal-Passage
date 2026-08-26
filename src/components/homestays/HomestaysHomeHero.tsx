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
      <section className="homestays-home-hero relative w-full overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.18)] lg:min-h-[max(520px,72dvh)]">
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
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(95deg,oklch(0.12_0.06_22_/_0.88)_0%,oklch(0.12_0.06_22_/_0.68)_40%,oklch(0.12_0.06_22_/_0.3)_70%,oklch(0.12_0.06_22_/_0.55)_100%)]"
            aria-hidden
          />
        </div>

        <div className="homestays-home-hero__content container-page relative z-10 flex min-h-[max(420px,58dvh)] flex-col justify-center pt-[var(--header-height)] lg:min-h-[max(520px,72dvh)]">
          <div className="homestays-home-hero__copy py-10 sm:py-14 md:py-20">
            <motion.div
              className="homestays-home-hero__copy-inner"
              variants={revealParent}
              initial="hidden"
              animate="show"
            >
              <motion.p
                variants={revealItem}
                className="homestays-home-hero__eyebrow eyebrow mb-4 text-ember/95 sm:mb-5"
              >
                Royal Homestays
              </motion.p>
              <motion.h1 variants={revealItem} className="homestays-home-hero__title font-display">
                Stay in
                <br />
                <span className="text-ember [text-shadow:0_0_1.1em_oklch(0.55_0.14_78_/_0.45)]">Mysuru,</span>
                <br />
                Royally
              </motion.h1>
              <motion.p variants={revealItem} className="homestays-home-hero__body mt-5 font-baskerville sm:mt-7">
                Heritage havelis, villas, and guest houses in Mysuru — each vetted for warmth, location, and
                Royal Passage hospitality.
              </motion.p>
            </motion.div>
          </div>

          <div className="homestays-home-hero__dots pointer-events-auto relative z-20 mt-auto flex gap-2 pb-8 sm:pb-10">
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
