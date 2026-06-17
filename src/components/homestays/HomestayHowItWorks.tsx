import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { HOMESTAY_HOW_IT_WORKS } from "@/lib/homestay-home-content";

export function HomestayHowItWorks() {
  return (
    <section className="border-t border-[oklch(0.88_0.08_86_/_0.1)] bg-background py-16 sm:py-20 md:py-24">
      <div className="container-page">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="eyebrow text-ember/90">Simple booking</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-ink text-balance sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              From search to check-in — reserve online and pay your host in cash when you arrive.
            </p>
          </div>
          <Link
            to="/homestays/browse"
            className="group inline-flex items-center gap-2 self-start rounded-sm text-xs font-semibold uppercase tracking-[0.22em] text-ember transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto"
          >
            Start browsing
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-10">
          {HOMESTAY_HOW_IT_WORKS.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.55, delay: idx * 0.08 }}
              className="relative rounded-sm border border-[oklch(0.72_0.09_78_/_0.2)] bg-card/40 px-6 py-8"
            >
              <span className="font-display text-3xl text-ember/35">{item.step}</span>
              <h3 className="mt-4 font-display text-lg uppercase tracking-[0.12em] text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
