import { Link, useNavigate } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { motion } from "motion/react";
import heroImage from "@/assets/hero-image.png";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function VipsHomeHero() {
  const reduceMotion = usePrefersReducedMotion();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[max(520px,85dvh)] overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.18)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Royal VIP stays"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2a0000]/92 via-[#4A0000]/78 to-[#2a0000]/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-[#4A0000]/40" />

      <div className="container-page relative z-10 flex min-h-[max(520px,85dvh)] flex-col justify-end pb-14 pt-[calc(var(--header-height)+2rem)] sm:pb-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="eyebrow inline-flex items-center gap-2 text-[#D4AF6A]">
            <Crown className="h-4 w-4" aria-hidden />
            Royal VIP
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-[#F7F1E8] sm:text-5xl md:text-6xl">
            Exclusive stays, personally curated
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#F7F1E8]/82 sm:text-base">
            Palace suites, private villas, and heritage mansions with dedicated concierge —
            for guests who expect Mysuru at its most regal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void navigate({ to: "/vips/browse" })}
              className="luxury-btn-sm luxury-btn-primary"
            >
              Browse VIP stays
            </button>
            <Link
              to="/homestays"
              className="luxury-btn-sm luxury-btn-panel-outline inline-flex no-underline"
            >
              View homestays
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
