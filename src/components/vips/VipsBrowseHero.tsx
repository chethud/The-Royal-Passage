import { motion } from "motion/react";
import heroImage from "@/assets/hero-image.png";
import {
  VipsSearchWidget,
  vipSearchFromBrowse,
  type VipSearchValues,
} from "@/components/vips/VipsSearchWidget";
import type { VipBrowseSearch } from "@/lib/vip-filters";
import { VIP_BOOKING_POLICY_LINE, VIP_CITY } from "@/lib/vip-filters";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type VipsBrowseHeroProps = {
  search: VipBrowseSearch;
  onSearchChange: (patch: Partial<VipSearchValues>) => void;
  onSubmit: () => void;
};

export function VipsBrowseHero({ search, onSearchChange, onSubmit }: VipsBrowseHeroProps) {
  const reduceMotion = usePrefersReducedMotion();
  const values = vipSearchFromBrowse(search);

  return (
    <section className="relative overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.15)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Browse royal VIP packages"
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
            Packages in {VIP_CITY}
          </h1>
          <p className="mt-3 max-w-lg text-sm text-[#F7F1E8]/80">
            Share your travel dates and group size — we&apos;ll show curated packages that fit.{" "}
            {VIP_BOOKING_POLICY_LINE}
          </p>

          <div className="mt-6 max-w-5xl sm:mt-8">
            <VipsSearchWidget
              values={values}
              onChange={onSearchChange}
              onSubmit={onSubmit}
              submitLabel="Search"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
