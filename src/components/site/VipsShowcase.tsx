import { Link } from "@tanstack/react-router";
import { ArrowRight, Crown } from "lucide-react";
import { motion } from "motion/react";
import { VipCard } from "@/components/vips/VipCard";
import type { VipStay } from "@/data/vips";

type VipsShowcaseProps = {
  vips?: VipStay[];
};

export function VipsShowcase({ vips = [] }: VipsShowcaseProps) {
  const featured = vips.slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section
      id="vips"
      className="relative border-y border-[oklch(0.88_0.08_86_/_0.1)] bg-[oklch(0.14_0.06_22)] py-16 sm:py-20 md:py-24"
    >
      <div className="container-page">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="eyebrow mb-3 inline-flex items-center gap-2 text-[#D4AF6A]/95">
              <Crown className="h-3.5 w-3.5" aria-hidden />
              Royal VIP
            </p>
            <h2 className="font-display text-3xl tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
              Stays Beyond the Ordinary
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Palace suites, private villas, and heritage mansions with dedicated concierge —
              curated for guests who expect the exceptional.
            </p>
          </div>
          <Link
            to="/vips/browse"
            className="group inline-flex items-center gap-2 self-start rounded-sm text-xs font-semibold uppercase tracking-[0.22em] text-ember transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto"
          >
            Explore VIP stays
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
            <VipCard key={stay.id} stay={stay} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
