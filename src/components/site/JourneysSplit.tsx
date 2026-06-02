import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import journeysImg from "@/assets/journeys-personal.png";

export function JourneysSplit() {
  return (
    <section className="bg-background py-16 sm:py-20 md:py-24">
      <div className="container-page">
        <div className="grid overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] bg-[oklch(0.17_0.07_22)] shadow-soft md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-12 md:px-14 md:py-16"
          >
            <div className="eyebrow mb-4 text-ember/95">Curated For You</div>
            <h2 className="font-display text-3xl leading-[1.1] tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
              Journeys that
              <br />
              feel personal
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground text-balance sm:mt-6 sm:text-base">
              Whether it's a family getaway, a solo escape, or a special celebration, we design
              journeys that are tailored to your interests and pace.
            </p>
            <div className="mt-7 sm:mt-8">
              <Link
                to="/experiences"
                className="group inline-flex items-center gap-2 rounded-sm bg-ember px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-7 sm:py-3.5 sm:text-xs"
              >
                Discover Journeys
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9 }}
            className="relative min-h-[280px] md:min-h-[420px]"
          >
            <img
              src={journeysImg}
              alt="A personalised Mysuru moment — heritage, food, and people"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(0.17_0.07_22_/_0.5)_0%,oklch(0.17_0.07_22_/_0.05)_30%,transparent_60%)]"
              aria-hidden
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
