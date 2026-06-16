import { motion } from "motion/react";
import heroImage from "@/assets/curated-expeditions.png";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type HomestaysHeroProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function HomestaysHero({ searchValue, onSearchChange }: HomestaysHeroProps) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section className="relative min-h-[28vh] overflow-hidden md:min-h-[32vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Luxury homestays across Karnataka"
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
          <p className="eyebrow text-[#D4AF6A]">Stay With Character</p>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <h1 className="min-w-0 font-display text-3xl leading-tight tracking-tight text-[#F7F1E8] sm:text-4xl md:text-[2.75rem]">
              Discover Royal Homestays
            </h1>
            <label className="relative w-full shrink-0 lg:ml-auto lg:w-72 xl:w-80">
              <span className="sr-only">Search homestays</span>
              <input
                type="search"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by city or property…"
                className="w-full border border-[rgb(200_162_90/0.35)] bg-[rgb(0_0_0/0.35)] px-4 py-3 text-sm text-[#F7F1E8] placeholder:text-[#F7F1E8]/45 backdrop-blur-sm focus:border-[#D4AF6A]/55 focus:outline-none"
              />
            </label>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
