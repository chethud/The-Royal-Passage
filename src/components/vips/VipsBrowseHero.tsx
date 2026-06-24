import { motion } from "motion/react";
import heroImage from "@/assets/hero-image.png";
import { ExperiencesSearchBar } from "@/components/experiences/ExperiencesSearchBar";
import { VipsPropertyTypeFilter } from "@/components/vips/VipsPropertyTypeFilter";
import type { VipBrowseSearch } from "@/lib/vip-filters";
import { VIP_CITY } from "@/lib/vip-filters";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type VipsBrowseHeroProps = {
  search: VipBrowseSearch;
  onSearchChange: (patch: Partial<VipBrowseSearch>) => void;
};

export function VipsBrowseHero({ search, onSearchChange }: VipsBrowseHeroProps) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.15)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Browse VIP stays"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2a0000]/94 via-[#4A0000]/85 to-[#3a0000]/75" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-[#4A0000]/35" />

      <div className="container-page relative z-10 pb-8 pt-[calc(var(--header-height)+1rem)] sm:pb-10 sm:pt-[calc(var(--header-height)+1.25rem)] md:pb-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <p className="eyebrow text-[#D4AF6A]">Royal VIP</p>
          <h1 className="mt-2 font-display text-3xl leading-tight tracking-tight text-[#F7F1E8] sm:text-4xl">
            {VIP_CITY} VIP stays
          </h1>
          <p className="mt-3 max-w-lg text-sm text-[#F7F1E8]/80">
            Search curated palace suites, villas, and private retreats.
          </p>

          <div className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-[1fr_240px]">
            <ExperiencesSearchBar
              value={search.q ?? ""}
              onChange={(q) => onSearchChange({ q })}
              placeholder={`Search VIP stays in ${VIP_CITY}…`}
              className="w-full"
            />
            <VipsPropertyTypeFilter
              value={search.propertyType}
              onChange={(propertyType) => onSearchChange({ propertyType })}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
