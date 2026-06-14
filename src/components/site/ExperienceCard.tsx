import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { Experience } from "@/data/experiences";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { categoryIconForLabel } from "@/lib/experience-category-icons";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function ExperienceCard({ exp }: { exp: Experience }) {
  const reduceMotion = usePrefersReducedMotion();
  const detailTo = "/experiences/$slug" as const;
  const CategoryIcon = categoryIconForLabel(exp.category);

  const card = (
    <article className="group flex aspect-[19/26] w-full flex-col overflow-hidden rounded-lg border border-[#C8A25A]/20 bg-[#4A0000]/40 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#C8A25A]/40 hover:shadow-[0_0_24px_-10px_#C8A25A44]">
      <div className="relative min-h-0 flex-[7] overflow-hidden">
        <Link
          to={detailTo}
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
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#C8A25A]/30 bg-[#4A0000]/80 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-[#F7F1E8] backdrop-blur-sm">
            <CategoryIcon className="h-3 w-3 text-[#D4AF6A]" strokeWidth={1.75} />
            {exp.category}
          </span>
        </div>

        <div className="absolute right-2.5 top-2.5 z-30 flex items-center gap-1.5">
          <AddToCartButton exp={exp} />
          <WishlistButton experienceId={exp.id} className="scale-90" />
        </div>
      </div>

      <div className="flex min-h-0 flex-[3] flex-col justify-between p-4">
        <Link
          to={detailTo}
          params={{ slug: exp.slug }}
          className="min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]"
        >
          <h3 className="line-clamp-2 font-display text-lg leading-snug text-[#F7F1E8] transition-colors group-hover:text-[#D4AF6A]">
            {exp.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] text-[#D6C8B5]">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]/85" strokeWidth={1.75} />
              {exp.durationHours}h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]/85" strokeWidth={1.75} />
              {exp.city}
            </span>
          </div>
        </Link>

        <div className="mt-auto border-t border-[#C8A25A]/12 pt-3">
          <Link
            to={detailTo}
            params={{ slug: exp.slug }}
            className="inline-flex w-full items-center justify-center rounded-full border border-[#C8A25A]/35 bg-[#C8A25A]/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A] transition-colors hover:border-[#C8A25A]/60 hover:bg-[#C8A25A]/20 hover:text-[#F7F1E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]"
          >
            View details →
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
      className="h-full w-full"
    >
      {card}
    </motion.div>
  );
}
