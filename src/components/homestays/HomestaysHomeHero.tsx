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
    <section className="relative min-h-[max(640px,100dvh)] w-full overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.18)]">
      <div className="absolute inset-0 z-0">
        <HeroSlideshow
          images={HOMESTAY_HERO_SLIDES}
          reduceMotion={reduceMotion}
          intervalMs={6000}
          activeIndex={activeSlide}
          onActiveIndexChange={setActiveSlide}
          className="absolute inset-0 h-full w-full"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(95deg,oklch(0.12_0.06_22_/_0.82)_0%,oklch(0.12_0.06_22_/_0.55)_45%,oklch(0.12_0.06_22_/_0.25)_75%,oklch(0.12_0.06_22_/_0.6)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
          aria-hidden
        />
      </div>

      <div className="container-page relative z-10 flex min-h-[max(640px,100dvh)] flex-col justify-center pt-[var(--header-height)] pb-44 sm:pb-48">
        <div className="py-14 md:py-20">
          <motion.div className="max-w-2xl" variants={revealParent} initial="hidden" animate="show">
            <motion.div variants={revealItem} className="eyebrow mb-5 text-ember/95">
              Royal Homestays
            </motion.div>
            <motion.h1
              variants={revealItem}
              className="font-display text-[clamp(2.4rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-tight text-ink text-balance [text-shadow:0_0.06em_0.4em_oklch(0.05_0.04_18_/_0.85)]"
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
              className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-ink/85 text-balance sm:mt-7 sm:text-[1.05rem] md:max-w-lg"
            >
              Heritage havelis, villas, and guest houses in Mysuru — each vetted for warmth, location,
              and Royal Passage hospitality.
            </motion.p>
            <motion.div variants={revealItem} className="mt-7 sm:mt-9">
              <button
                type="button"
                onClick={() => {
                  document.getElementById("homestay-search")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center gap-2 rounded-sm bg-ember px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-8 sm:py-4 sm:text-xs"
              >
                Find your stay
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          id="homestay-search"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.45, ease: softEase }}
          className="pointer-events-auto absolute inset-x-0 bottom-16 z-20 px-4 sm:bottom-20"
        >
          <div className="container-page max-w-5xl">
            <HomestaysSearchWidget
              values={search}
              onChange={(patch) => setSearch((current) => ({ ...current, ...patch }))}
              onSubmit={goToBrowse}
            />
          </div>
        </motion.div>

        <div className="pointer-events-auto absolute inset-x-0 bottom-8 z-20 flex items-center justify-center gap-2">
          {HOMESTAY_HERO_SLIDES.map((slide, i) => (
            <button
              key={`${slide.src}-${i}`}
              type="button"
              onClick={() => setActiveSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1 transition-all ${
                i === activeSlide ? "w-10 bg-ember" : "w-6 bg-ink/30 hover:bg-ink/55"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
