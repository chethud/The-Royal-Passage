import { motion } from "motion/react";
import heroImage from "@/assets/curated-expeditions.png";
import { ExperiencesSearchBar } from "@/components/experiences/ExperiencesSearchBar";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type ExperiencesHeroProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function ExperiencesHero({ searchValue, onSearchChange }: ExperiencesHeroProps) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section className="relative min-h-[28vh] overflow-hidden md:min-h-[32vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Luxury travel experiences across South India"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#4A0000]/92 via-[#4A0000]/78 to-[#5B0000]/65" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#4A0000] via-transparent to-[#4A0000]/30" />

      <div className="container-page relative z-10 flex min-h-[28vh] flex-col justify-center pb-10 pt-[calc(var(--header-height)+1.25rem)] md:min-h-[32vh] md:pb-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <p className="eyebrow text-[#D4AF37]">The Royal Collection</p>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <h1 className="min-w-0 font-display text-3xl leading-tight tracking-tight text-[#F7F1E8] sm:text-4xl md:text-[2.75rem]">
              Discover Extraordinary Experiences
            </h1>
            <ExperiencesSearchBar
              value={searchValue}
              onChange={onSearchChange}
              className="w-full shrink-0 lg:ml-auto lg:w-72 xl:w-80"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
