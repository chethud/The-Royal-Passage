import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HomestayCard } from "@/components/homestays/HomestayCard";
import type { Homestay } from "@/data/homestays";

type HomestaysShowcaseProps = {
  featured?: Homestay[];
  homestays?: Homestay[];
};

export function HomestaysShowcase({ featured, homestays = [] }: HomestaysShowcaseProps) {
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  // Combine all available stays (giving priority to homestays catalog, fallback to featured)
  const allStays = homestays.length > 0 ? homestays : (featured ?? []);

  if (allStays.length === 0) return null;

  const filteredStays = selectedType
    ? allStays.filter((stay) => stay.propertyType?.toLowerCase() === selectedType.toLowerCase())
    : allStays;

  const propertyTypes = Array.from(
    new Set(allStays.map((s) => s.propertyType).filter(Boolean)),
  ) as string[];

  return (
    <section
      id="homestays"
      className="relative border-y border-[oklch(0.88_0.08_86_/_0.1)] bg-[oklch(0.16_0.07_22)] py-16 sm:py-20 md:py-24 scroll-mt-20"
    >
      <div className="container-page">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="eyebrow mb-3 text-ember/90">Homestays & Stays</p>
            <h2 className="font-display text-3xl tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
              Rest Where Stories Live
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Heritage havelis, villas, and guest houses in Mysuru — each vetted for warmth,
              location, and Royal Passage hospitality.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-ember">
            <span>{filteredStays.length} {filteredStays.length === 1 ? "Property" : "Properties"}</span>
          </div>
        </div>

        {/* Filter chips directly accessible */}
        {propertyTypes.length > 1 && (
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-[oklch(0.88_0.08_86_/_0.1)] pt-6">
            <span className="mr-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedType(undefined)}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                selectedType === undefined
                  ? "bg-ember text-background shadow-sm font-semibold"
                  : "border border-ember/30 bg-ember/10 text-ink/80 hover:border-ember/60 hover:text-ink"
              }`}
            >
              All ({allStays.length})
            </button>
            {propertyTypes.map((type) => {
              const count = allStays.filter(
                (s) => s.propertyType?.toLowerCase() === type?.toLowerCase(),
              ).length;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    selectedType?.toLowerCase() === type?.toLowerCase()
                      ? "bg-ember text-background shadow-sm font-semibold"
                      : "border border-ember/30 bg-ember/10 text-ink/80 hover:border-ember/60 hover:text-ink"
                  }`}
                >
                  {type} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* All Homestay Properties Grid */}
        <motion.div
          layout
          className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 md:gap-7"
        >
          <AnimatePresence mode="popLayout">
            {filteredStays.map((stay) => (
              <motion.div
                key={stay.id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.3 }}
              >
                <HomestayCard stay={stay} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}


