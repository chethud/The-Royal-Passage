import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";
import {
  createDefaultHomestaySearchValues,
  HomestaysSearchWidget,
  type HomestaySearchValues,
} from "@/components/homestays/HomestaysSearchWidget";
import { HOMESTAY_HERO_SLIDES } from "@/lib/homestay-home-content";
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

export function HomestaysHomeHero() {
  const reduceMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [search, setSearch] = useState<HomestaySearchValues>(() => createDefaultHomestaySearchValues());

  const goToBrowse = () => {
    void navigate({
      to: "/homestays/browse",
      search: {
        q: search.q?.trim() || undefined,
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        guests: search.guests,
      },
    });
  };

  return (
    <section className="relative w-full overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.18)] lg:min-h-[max(640px,100dvh)]">
      <div className="absolute inset-0 z-0 min-h-full">
        <HeroSlideshow
          images={HOMESTAY_HERO_SLIDES}
          reduceMotion={reduceMotion}
          intervalMs={6000}
          activeIndex={activeSlide}
          onActiveIndexChange={setActiveSlide}
          className="absolute inset-0 h-full w-full"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.12_0.06_22_/_0.88)_0%,oklch(0.12_0.06_22_/_0.72)_35%,oklch(0.12_0.06_22_/_0.55)_65%,oklch(0.12_0.06_22_/_0.82)_100%)] lg:bg-[linear-gradient(95deg,oklch(0.12_0.06_22_/_0.82)_0%,oklch(0.12_0.06_22_/_0.55)_45%,oklch(0.12_0.06_22_/_0.25)_75%,oklch(0.12_0.06_22_/_0.6)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent sm:h-40"
          aria-hidden
        />
      </div>

      <div className="relative z-10 flex flex-col lg:min-h-[max(640px,100dvh)]">
        <div className="container-page flex flex-1 flex-col justify-center pt-[var(--header-height)]">
          <div className="py-10 sm:py-14 md:py-20">
            <motion.div className="max-w-2xl" variants={revealParent} initial="hidden" animate="show">
              <motion.div variants={revealItem} className="eyebrow mb-4 text-ember/95 sm:mb-5">
                Royal Homestays
              </motion.div>
              <motion.h1
                variants={revealItem}
                className="font-display text-[clamp(2rem,10vw,5.5rem)] font-semibold leading-[0.95] tracking-tight text-ink text-balance [text-shadow:0_0.06em_0.4em_oklch(0.05_0.04_18_/_0.85)]"
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
                className="mt-5 max-w-md text-[0.9rem] leading-relaxed text-ink/85 text-balance sm:mt-7 sm:text-[1.05rem] md:max-w-lg"
              >
                Heritage havelis, villas, and guest houses in Mysuru — each vetted for warmth, location,
                and Royal Passage hospitality.
              </motion.p>
              <motion.div variants={revealItem} className="mt-6 sm:mt-9 lg:hidden">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("homestay-search")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ember px-6 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto sm:justify-start sm:px-8 sm:py-4 sm:text-xs"
                >
                  Find your stay
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          id="homestay-search"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.45, ease: softEase }}
          className="pointer-events-auto z-20 pb-3 lg:absolute lg:inset-x-0 lg:bottom-20 lg:pb-0"
        >
          <div className="container-page max-w-5xl">
            <HomestaysSearchWidget
              values={search}
              onChange={(patch) => setSearch((current) => ({ ...current, ...patch }))}
              onSubmit={goToBrowse}
            />
          </div>
        </motion.div>

        <div className="pointer-events-auto relative z-20 flex items-center justify-center gap-2 pb-6 lg:absolute lg:inset-x-0 lg:bottom-8 lg:pb-0">
          {HOMESTAY_HERO_SLIDES.map((slide, i) => (
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
  );
}
