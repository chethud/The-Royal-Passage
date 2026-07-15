import { Clock, MapPin } from "lucide-react";
import type { Experience } from "@/data/experiences";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ExperienceSmartBadges } from "@/components/experiences/ExperienceSmartBadges";
import { categoryIconForLabel } from "@/lib/experience-category-icons";
import { MarketplaceCard, marketplaceCardActionClass } from "@/components/site/MarketplaceCard";

export function ExperienceCard({ exp }: { exp: Experience }) {
  const CategoryIcon = categoryIconForLabel(exp.category);

  return (
    <MarketplaceCard
      size="large"
      link={{
        to: "/experiences/$slug",
        params: { slug: exp.slug },
        search: {},
      }}
      image={exp.image}
      imageAlt={exp.title}
      title={exp.title}
      ctaLabel="View details"
      topLeft={
        <div className="flex flex-col items-start gap-1.5">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-[#D4AF6A] backdrop-blur-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
            aria-label={exp.category}
            title={exp.category}
          >
            <CategoryIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </span>
          <ExperienceSmartBadges exp={exp} />
        </div>
      }
      topRight={
        <>
          <AddToCartButton exp={exp} className={marketplaceCardActionClass} />
          <WishlistButton experienceId={exp.id} className={marketplaceCardActionClass} />
        </>
      }
      meta={
        <>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" strokeWidth={1.75} />
            {exp.durationHours}h
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" strokeWidth={1.75} />
            {exp.city}
          </span>
        </>
      }
    />
  );
}
