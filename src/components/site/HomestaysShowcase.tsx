import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { HomestayCard } from "@/components/homestays/HomestayCard";
import type { Homestay } from "@/data/homestays";
import type { HomestayBrowseSearch } from "@/lib/homestay-filters";

type HomestaysShowcaseProps = {
  homestays?: Homestay[];
};

export function HomestaysShowcase({ homestays = [] }: HomestaysShowcaseProps) {
  const featured = homestays.slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section
      id="homestays"
      className="relative border-y border-[oklch(0.88_0.08_86_/_0.1)] bg-[oklch(0.16_0.07_22)] py-16 sm:py-20 md:py-24"
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
          <Link
            to="/homestays/browse"
            className="group inline-flex items-center gap-2 self-start rounded-sm text-xs font-semibold uppercase tracking-[0.22em] text-ember transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto"
          >
            Explore all homestays
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.55 }}
          className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 md:gap-7"
        >
          {featured.map((stay) => (
            <HomestayCard key={stay.id} stay={stay} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
