import { Clock, MapPin } from "lucide-react";
import type { Experience } from "@/data/experiences";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { OfferPrice } from "@/components/pricing/OfferPrice";
import { isFixedGroupBooking } from "@/lib/experience-party-pricing";
import { categoryIconForLabel } from "@/lib/experience-category-icons";
import { MarketplaceCard, marketplaceCardActionClass } from "@/components/site/MarketplaceCard";

export function ExperienceCard({ exp }: { exp: Experience }) {
  const CategoryIcon = categoryIconForLabel(exp.category);
  const sym = exp.currencySymbol ?? "₹";
  const minGuests = exp.minGuestsPerBooking ?? 1;
  const maxGuests = exp.maxGuestsPerBooking ?? 10;
  const groupListing = isFixedGroupBooking(minGuests, maxGuests);
  const listedPrice = groupListing ? exp.pricePerPerson * minGuests : exp.pricePerPerson;
  const listedCompare =
    groupListing && exp.compareAtPricePerPerson
      ? exp.compareAtPricePerPerson * minGuests
      : exp.compareAtPricePerPerson;

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
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:rgba(198,161,91,0.28)] bg-[color:rgba(36,16,23,0.42)] text-[color:var(--antique-gold)] backdrop-blur-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
          aria-label={exp.category}
          title={exp.category}
        >
          <CategoryIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
        </span>
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
            <Clock className="h-3.5 w-3.5 shrink-0 text-[color:var(--antique-gold)]" strokeWidth={1.75} />
            {exp.durationHours}h
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--antique-gold)]" strokeWidth={1.75} />
            {exp.city}
          </span>
        </>
      }
      footer={
        <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
          <OfferPrice
            price={listedPrice}
            compareAt={listedCompare}
            currencySymbol={sym}
            tone="dark"
            showPercent
            priceClassName="font-display text-base font-normal text-[color:var(--royal-ivory)]"
          />
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#D6C8B5]/75">
            {groupListing ? `for ${minGuests}` : "per person"}
          </span>
        </span>
      }
    />
  );
}
