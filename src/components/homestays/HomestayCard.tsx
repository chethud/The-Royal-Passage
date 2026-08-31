import { BedDouble, MapPin, Star, Users } from "lucide-react";
import type { Homestay } from "@/data/homestays";
import type { HomestayBrowseSearch } from "@/lib/homestay-filters";
import { weekdayPriceMajor, weekendPriceMajor } from "@/lib/homestay-day-pricing";
import { AddHomestayToCartButton } from "@/components/cart/AddHomestayToCartButton";
import { HomestayOfferRates, OfferPrice } from "@/components/pricing/OfferPrice";
import { useTravelAgentDiscount } from "@/hooks/use-travel-agent-discount";
import { travelAgentHomestayRates } from "@/lib/travel-agent-pricing";
import { MarketplaceCard, marketplaceCardActionClass } from "@/components/site/MarketplaceCard";

export function HomestayCard({
  stay,
  search,
}: {
  stay: Homestay;
  search?: HomestayBrowseSearch;
}) {
  const { discountPercent, isTravelAgent } = useTravelAgentDiscount();
  const sym = stay.currencySymbol ?? "₹";
  const weekday = weekdayPriceMajor(stay);
  const weekend = weekendPriceMajor(stay);
  const agentRates = travelAgentHomestayRates(
    weekday,
    weekend,
    stay.compareAtPricePerNight,
    stay.compareAtWeekendPricePerNight,
    isTravelAgent ? discountPercent : 0,
  );
  const hideAgentPercent = isTravelAgent && discountPercent > 0;
  const agentFrom = Math.min(agentRates.weekday, agentRates.weekend);

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
        <span className="inline-flex rounded-full border border-[color:rgba(198,161,91,0.45)] bg-[color:rgba(36,16,23,0.45)] px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--antique-gold)] backdrop-blur-sm">
          {stay.propertyType}
        </span>
      }
      topRight={
        <AddHomestayToCartButton stay={stay} search={search} className={marketplaceCardActionClass} />
      }
      meta={
        <>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--antique-gold)]" strokeWidth={1.75} />
            {stay.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 shrink-0 text-[color:var(--antique-gold)]" strokeWidth={1.75} />
            {stay.bedrooms} bed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0 text-[color:var(--antique-gold)]" strokeWidth={1.75} />
            {stay.maxGuests}
          </span>
        </>
      }
      footer={
        <div className="flex items-end justify-between gap-3">
          {hideAgentPercent ? (
            <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
              <OfferPrice
                price={agentFrom}
                currencySymbol={sym}
                tone="dark"
                showPercent={false}
                priceClassName="font-display text-base font-normal text-[color:var(--royal-ivory)]"
              />
              <span className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#D6C8B5]/75">
                / night
              </span>
            </span>
          ) : (
            <HomestayOfferRates
              symbol={sym}
              weekday={agentRates.weekday}
              weekend={agentRates.weekend}
              compareAtWeekday={agentRates.compareAtWeekday}
              compareAtWeekend={agentRates.compareAtWeekend}
              tone="dark"
              showPercent
              priceClassName="font-display text-base font-normal text-[color:var(--royal-ivory)]"
            />
          )}
          <span className="inline-flex shrink-0 items-center gap-1 text-[0.62rem] text-[color:var(--antique-gold)]">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
            {stay.rating}
          </span>
        </div>
      }
    />
  );
}
