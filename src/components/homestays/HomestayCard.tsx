import { BedDouble, MapPin, Star, Users } from "lucide-react";
import type { Homestay } from "@/data/homestays";
import type { HomestayBrowseSearch } from "@/lib/homestay-filters";
import {
  formatWeekdayWeekendRates,
  weekdayPriceMajor,
  weekendPriceMajor,
} from "@/lib/homestay-day-pricing";
import { AddHomestayToCartButton } from "@/components/cart/AddHomestayToCartButton";
import { MarketplaceCard, marketplaceCardActionClass } from "@/components/site/MarketplaceCard";

export function HomestayCard({
  stay,
  search,
}: {
  stay: Homestay;
  search?: HomestayBrowseSearch;
}) {
  const sym = stay.currencySymbol ?? "₹";
  const rateLabel = formatWeekdayWeekendRates(sym, weekdayPriceMajor(stay), weekendPriceMajor(stay));

  return (
    <MarketplaceCard
      link={{
        to: "/homestays/$slug",
        params: { slug: stay.slug },
        search: {
          checkIn: search?.checkIn,
          checkOut: search?.checkOut,
          guests: search?.guests,
        },
        ariaLabel: `View ${stay.title}`,
      }}
      image={stay.image}
      imageAlt={stay.title}
      title={stay.title}
      ctaLabel="View stay"
      topLeft={
        <span className="inline-flex rounded-full border border-[rgb(200_162_90/0.45)] bg-black/40 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A] backdrop-blur-sm">
          {stay.propertyType}
        </span>
      }
      topRight={
        <AddHomestayToCartButton stay={stay} search={search} className={marketplaceCardActionClass} />
      }
      meta={
        <>
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
        </>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-base text-[#F7F1E8]">{rateLabel}</span>
          <span className="inline-flex items-center gap-1 text-[0.62rem] text-[#D4AF6A]">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
            {stay.rating}
          </span>
        </div>
      }
    />
  );
}
