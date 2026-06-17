import { Link } from "@tanstack/react-router";
import { ArrowRight, BedDouble, MapPin, Star, Users } from "lucide-react";
import { motion } from "motion/react";
import type { Homestay } from "@/data/homestays";
import type { HomestayBrowseSearch } from "@/lib/homestay-filters";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function HomestayCard({
  stay,
  search,
}: {
  stay: Homestay;
  search?: HomestayBrowseSearch;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const sym = stay.currencySymbol ?? "₹";

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.55 }}
      className="group relative aspect-[4/5] w-full overflow-hidden rounded-md shadow-[0_20px_50px_-28px_rgba(0,0,0,0.72)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_56px_-24px_rgba(200,162,90,0.3)]"
    >
      <Link
        to="/homestays/$slug"
        params={{ slug: stay.slug }}
        search={{
          checkIn: search?.checkIn,
          checkOut: search?.checkOut,
          guests: search?.guests,
        }}
        className="absolute inset-0 z-10 block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A] focus-visible:ring-inset"
        aria-label={`View ${stay.title}`}
      >
        <img
          src={stay.image}
          alt={stay.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120000]/95 via-[#4A0000]/40 to-[#4A0000]/10" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" />

        <div className="absolute left-3.5 top-3.5 z-20">
          <span className="inline-flex rounded-full border border-[rgb(200_162_90/0.45)] bg-black/40 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A] backdrop-blur-sm">
            {stay.propertyType}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 p-5">
          <h3 className="line-clamp-2 font-display text-lg uppercase leading-snug tracking-[0.06em] text-[#F7F1E8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] transition-colors group-hover:text-[#D4AF6A]">
            {stay.title}
          </h3>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[0.68rem] text-[#E8DCC8]/90">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" strokeWidth={1.75} />
              {stay.city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" strokeWidth={1.75} />
              {stay.bedrooms} bed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" strokeWidth={1.75} />
              {stay.maxGuests}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-display text-base text-[#F7F1E8]">
              {sym}
              {stay.pricePerNight.toLocaleString("en-IN")}
              <span className="ml-1 text-[0.62rem] font-sans font-normal uppercase tracking-[0.12em] text-[#E8DCC8]/75">
                / night
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-[0.62rem] text-[#D4AF6A]">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
              {stay.rating}
            </span>
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A] transition-all duration-300 group-hover:gap-2.5">
            View stay
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
