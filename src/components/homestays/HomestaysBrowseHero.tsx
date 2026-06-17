import { motion } from "motion/react";
import { HOMESTAY_HERO_SLIDES } from "@/lib/homestay-home-content";
import {
  HomestaysSearchWidget,
  homestaySearchFromBrowse,
  type HomestaySearchValues,
} from "@/components/homestays/HomestaysSearchWidget";
import type { HomestayBrowseSearch } from "@/lib/homestay-filters";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type HomestaysBrowseHeroProps = {
  search: HomestayBrowseSearch;
  onSearchChange: (patch: Partial<HomestaySearchValues>) => void;
  onSubmit: () => void;
};

export function HomestaysBrowseHero({ search, onSearchChange, onSubmit }: HomestaysBrowseHeroProps) {
  const reduceMotion = usePrefersReducedMotion();
  const values = homestaySearchFromBrowse(search);

  return (
    <section className="relative overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.15)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HOMESTAY_HERO_SLIDES[0]?.src ?? ""})` }}
        role="img"
        aria-label="Browse royal homestays"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-maroon-deep/94 via-brand-maroon-deep/82 to-brand-maroon/72" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-brand-maroon-deep/35" />

      <div className="container-page relative z-10 pb-8 pt-[calc(var(--header-height)+1rem)] sm:pb-10 sm:pt-[calc(var(--header-height)+1.25rem)] md:pb-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <p className="eyebrow text-gold">Browse stays</p>
          <div className="mt-2 max-w-2xl">
            <h1 className="font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl md:text-[2.75rem]">
              Mysuru homestays
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/80 sm:text-[0.95rem]">
              Choose your dates and guests, then pick a stay in Mysuru.
            </p>
          </div>

          <div className="mt-6 max-w-5xl sm:mt-8">
            <HomestaysSearchWidget
              values={values}
              onChange={onSearchChange}
              onSubmit={onSubmit}
              submitLabel="Update search"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
