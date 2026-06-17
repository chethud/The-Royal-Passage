import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/curated-expeditions.png";
import {
  createDefaultHomestaySearchValues,
  HomestaysSearchWidget,
  type HomestaySearchValues,
} from "@/components/homestays/HomestaysSearchWidget";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const softEase = [0.22, 1, 0.36, 1] as const;

export function HomestaysHomeHero() {
  const reduceMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
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
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Royal homestays across Karnataka"
      />
      <div className="absolute inset-0 bg-[linear-gradient(95deg,oklch(0.12_0.06_22_/_0.88)_0%,oklch(0.12_0.06_22_/_0.62)_45%,oklch(0.12_0.06_22_/_0.35)_75%,oklch(0.12_0.06_22_/_0.72)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="container-page relative z-10 flex min-h-[max(640px,100dvh)] flex-col justify-center pt-[var(--header-height)] pb-10">
        <div className="py-10 md:py-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: softEase }}
            className="max-w-3xl"
          >
            <p className="eyebrow mb-5 text-ember/95">Royal Homestays</p>
            <h1 className="font-display text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.95] tracking-tight text-ink text-balance [text-shadow:0_0.06em_0.4em_oklch(0.05_0.04_18_/_0.85)]">
              Stay in
              <br />
              <span className="text-ember [text-shadow:0_0_1.1em_oklch(0.55_0.14_78_/_0.45)]">
                Mysuru,
              </span>
              <br />
              Royally
            </h1>
            <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-ink/85 sm:text-[1.05rem]">
              Heritage havelis, hill cottages, and guest houses across Karnataka — each vetted for
              warmth, location, and Royal Passage hospitality.
            </p>
            <button
              type="button"
              onClick={() => {
                document.getElementById("homestay-search")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group mt-7 inline-flex items-center gap-2 rounded-sm bg-ember px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 sm:mt-9 sm:px-8 sm:py-4 sm:text-xs"
            >
              Find your stay
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          <motion.div
            id="homestay-search"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: softEase }}
            className="mt-10 max-w-5xl md:mt-12"
          >
            <HomestaysSearchWidget
              values={search}
              onChange={(patch) => setSearch((current) => ({ ...current, ...patch }))}
              onSubmit={goToBrowse}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
