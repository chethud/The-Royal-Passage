import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { Experience } from "@/data/experiences";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { categoryIconForLabel } from "@/lib/experience-category-icons";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const cardActionClass =
  "scale-90 border-0 bg-black/35 p-2 text-[#F7F1E8] shadow-none backdrop-blur-sm hover:border-0 hover:bg-black/50";

export function ExperienceCard({ exp }: { exp: Experience }) {
  const reduceMotion = usePrefersReducedMotion();
  const detailTo = "/experiences/$slug" as const;
  const CategoryIcon = categoryIconForLabel(exp.category);

  const card = (
    <article className="group relative aspect-[4/5] w-full overflow-hidden rounded-md shadow-[0_20px_50px_-28px_rgba(0,0,0,0.72)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_56px_-24px_rgba(200,162,90,0.3)]">
      <Link
        to={detailTo}
        params={{ slug: exp.slug }}
        search={{}}
        className="absolute inset-0 z-10 block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A] focus-visible:ring-inset"
      >
        <img
          src={exp.image}
          alt={exp.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120000]/95 via-[#4A0000]/40 to-[#4A0000]/10" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" />

        <div className="absolute left-3.5 top-3.5 z-20">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-[#D4AF6A] backdrop-blur-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
            aria-label={exp.category}
            title={exp.category}
          >
            <CategoryIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 p-5">
          <h3 className="line-clamp-2 font-display text-lg uppercase leading-snug tracking-[0.06em] text-[#F7F1E8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] transition-colors group-hover:text-[#D4AF6A]">
            {exp.title}
          </h3>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[0.68rem] text-[#E8DCC8]/90">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" strokeWidth={1.75} />
              {exp.durationHours}h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" strokeWidth={1.75} />
              {exp.city}
            </span>
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A] transition-all duration-300 group-hover:gap-2.5">
            View details
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>

      <div className="absolute right-2.5 top-2.5 z-30 flex items-center gap-1">
        <AddToCartButton exp={exp} className={cardActionClass} />
        <WishlistButton experienceId={exp.id} className={cardActionClass} />
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
      className="h-full w-full"
    >
      {card}
    </motion.div>
  );
}
