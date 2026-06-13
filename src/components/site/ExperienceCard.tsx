import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { Experience } from "@/data/experiences";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { guestBookingLimits } from "@/lib/booking-url";
import { filterSlotsWithinBookingWindow } from "@/lib/booking-window";

export function ExperienceCard({ exp }: { exp: Experience }) {
  const nextSlot = filterSlotsWithinBookingWindow(exp.slots).find((s) => s.available > 0);
  const reduceMotion = usePrefersReducedMotion();
  const defaultGuests = nextSlot
    ? guestBookingLimits(exp, nextSlot.available).min
    : 1;

  const card = (
    <article className="group flex h-full min-h-[360px] flex-col overflow-hidden rounded-lg border border-[#C8A25A]/20 bg-[#4A0000]/40 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#C8A25A]/40 hover:shadow-[0_0_24px_-10px_#C8A25A44]">
      <div className="relative min-h-0 flex-[7] overflow-hidden">
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

        <div className="absolute right-2.5 top-2.5 z-30 flex items-center gap-1.5">
          <AddToCartButton exp={exp} />
          <WishlistButton experienceId={exp.id} className="scale-90" />
        </div>
      </div>

      <div className="flex min-h-0 flex-[3] flex-col justify-between p-3 sm:p-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[0.65rem] text-[#D6C8B5]">
            <MapPin className="h-3 w-3 shrink-0 text-[#C8A25A]" />
            <span className="truncate">{exp.city}</span>
          </div>

          <Link
            to="/experiences/$slug"
            params={{ slug: exp.slug }}
            className="mt-1 block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]"
          >
            <h3 className="line-clamp-2 font-display text-base leading-snug text-[#F7F1E8] transition-colors group-hover:text-[#D4AF6A] sm:text-[1.05rem]">
              {exp.title}
            </h3>
          </Link>
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          {nextSlot ? (
            <Link
              to="/experiences/$slug/book"
              params={{ slug: exp.slug }}
              search={{ slotId: nextSlot.id, guests: defaultGuests }}
              resetScroll
              className="relative z-10 luxury-btn-sm luxury-btn-primary"
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
