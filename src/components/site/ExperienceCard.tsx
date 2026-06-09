import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Star } from "lucide-react";
import { motion } from "motion/react";
import type { Experience } from "@/data/experiences";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function ExperienceCard({ exp }: { exp: Experience }) {
  const nextSlot = exp.slots.find((s) => s.available > 0);
  const reduceMotion = usePrefersReducedMotion();
  const sym = exp.currencySymbol ?? "₹";

  const card = (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#C8A25A]/20 bg-[#4A0000]/40 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#C8A25A]/40 hover:shadow-[0_0_24px_-10px_#C8A25A44]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link
          to="/experiences/$slug"
          params={{ slug: exp.slug }}
          className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]"
        >
          <img
            src={exp.image}
            alt={exp.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4A0000]/80 via-transparent to-transparent" />
        </Link>

        <div className="absolute left-2.5 top-2.5 z-20 flex flex-wrap gap-1.5">
          <span className="rounded-sm border border-[#C8A25A]/30 bg-[#4A0000]/80 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-[#F7F1E8] backdrop-blur-sm">
            {exp.category}
          </span>
          {exp.verifiedHost ? (
            <span className="rounded-sm bg-[#C8A25A] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#4A0000]">
              Verified
            </span>
          ) : null}
        </div>

        <WishlistButton experienceId={exp.id} className="absolute right-2.5 top-2.5 z-30 scale-90" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-[0.7rem] text-[#D6C8B5]">
          <MapPin className="h-3 w-3 shrink-0 text-[#C8A25A]" />
          <span className="truncate">{exp.city}</span>
        </div>

        <Link
          to="/experiences/$slug"
          params={{ slug: exp.slug }}
          className="mt-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]"
        >
          <h3 className="line-clamp-2 font-display text-lg leading-snug text-[#F7F1E8] transition-colors group-hover:text-[#D4AF6A]">
            {exp.title}
          </h3>
        </Link>

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#D6C8B5]/90">
          {exp.tagline || exp.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-[#D6C8B5]">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-[#C8A25A]" />
            {exp.durationHours}h
          </span>
          <span className="inline-flex items-center gap-1 text-[#D4AF6A]">
            <Star className="h-3 w-3 fill-current" />
            {exp.rating}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#C8A25A]/12 pt-3">
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.14em] text-[#D6C8B5]">From</div>
            <div className="font-display text-xl leading-none text-[#F7F1E8]">
              {sym}
              {exp.pricePerPerson}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {nextSlot ? (
              <Link
                to="/experiences/$slug/book"
                params={{ slug: exp.slug }}
                search={{ slotId: nextSlot.id, guests: Math.min(2, nextSlot.available) }}
                className="luxury-btn-sm luxury-btn-primary"
              >
                Book
              </Link>
            ) : (
              <span className="luxury-btn-sm luxury-btn-primary pointer-events-none opacity-50">Sold out</span>
            )}
            <Link
              to="/experiences/$slug"
              params={{ slug: exp.slug }}
              className="text-[0.65rem] uppercase tracking-[0.12em] text-[#D4AF6A] hover:text-[#F7F1E8]"
            >
              Details →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );

  if (reduceMotion) return card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {card}
    </motion.div>
  );
}
