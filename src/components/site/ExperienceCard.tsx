import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Star, Users } from "lucide-react";
import { motion } from "motion/react";
import type { Experience } from "@/data/experiences";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function ExperienceCard({ exp }: { exp: Experience }) {
  const nextSlot = exp.slots.find((s) => s.available > 0);
  const reduceMotion = usePrefersReducedMotion();
  const sym = exp.currencySymbol ?? "₹";
  const maxGuests = exp.maxGuestsPerBooking ?? nextSlot?.capacity ?? 10;

  const card = (
    <article className="luxury-card group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#C8A25A]/22 bg-[#4A0000]/45 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.65)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-[#C8A25A]/45 hover:shadow-[0_0_40px_-12px_#C8A25A55]">
      <div className="relative h-[320px] overflow-hidden">
        <Link
          to="/experiences/$slug"
          params={{ slug: exp.slug }}
          className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]"
        >
          <img
            src={exp.image}
            alt={exp.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4A0000]/90 via-[#4A0000]/20 to-transparent" />
        </Link>

        <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#C8A25A]/35 bg-[#4A0000]/75 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[#F7F1E8] backdrop-blur-md">
            {exp.category}
          </span>
          {exp.verifiedHost ? (
            <span className="rounded-full border border-[#C8A25A]/50 bg-gradient-to-r from-[#C8A25A] to-[#D4AF6A] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#4A0000]">
              Verified
            </span>
          ) : null}
        </div>

        <WishlistButton experienceId={exp.id} className="absolute right-4 top-4 z-30" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-1.5 text-xs text-[#D6C8B5]">
          <MapPin className="h-3.5 w-3.5 text-[#C8A25A]" />
          {exp.city}
        </div>

        <Link
          to="/experiences/$slug"
          params={{ slug: exp.slug }}
          className="mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]"
        >
          <h3 className="font-display text-2xl leading-tight text-[#F7F1E8] transition-colors group-hover:text-[#D4AF6A]">
            {exp.title}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#D6C8B5]">
          {exp.tagline || exp.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-4 text-xs text-[#D6C8B5]">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#C8A25A]" />
            {exp.durationHours}h
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#C8A25A]" />
            Up to {maxGuests} guests
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#D4AF6A]">
            <Star className="h-3.5 w-3.5 fill-current" />
            {exp.rating}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <div className="text-[0.65rem] uppercase tracking-[0.16em] text-[#D6C8B5]">
              Starting from
            </div>
            <div className="font-display text-3xl text-[#F7F1E8]">
              {sym}
              {exp.pricePerPerson}
            </div>
            <div className="text-xs text-[#D6C8B5]">per guest</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {nextSlot ? (
            <Link
              to="/experiences/$slug/book"
              params={{ slug: exp.slug }}
              search={{ slotId: nextSlot.id, guests: Math.min(2, nextSlot.available) }}
              className="luxury-btn-primary text-center text-xs"
            >
              Book experience
            </Link>
          ) : (
            <span className="luxury-btn-primary pointer-events-none text-center text-xs opacity-50">
              Sold out
            </span>
          )}
          <Link
            to="/experiences/$slug"
            params={{ slug: exp.slug }}
            className="luxury-btn-secondary text-center text-xs"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );

  if (reduceMotion) return card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {card}
    </motion.div>
  );
}
