import { CalendarDays, Crown, MapPin, Sparkles, Star, Users } from "lucide-react";
import type { VipPackage } from "@/data/vips";
import type { VipBrowseSearch } from "@/lib/vip-filters";
import { MarketplaceCard } from "@/components/site/MarketplaceCard";

export function VipCard({ pkg, search }: { pkg: VipPackage; search?: VipBrowseSearch }) {
  const sym = pkg.currencySymbol ?? "₹";

  return (
    <MarketplaceCard
      link={{
        to: "/vips/$slug",
        params: { slug: pkg.slug },
        search: {
          checkIn: search?.checkIn,
          checkOut: search?.checkOut,
          guests: search?.guests,
        },
        ariaLabel: `View ${pkg.title}`,
      }}
      image={pkg.image}
      imageAlt={pkg.title}
      title={pkg.title}
      ctaLabel="View package"
      topLeft={
        <span className="inline-flex items-center gap-1 rounded-full border border-[rgb(200_162_90/0.55)] bg-black/45 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A] backdrop-blur-sm">
          <Crown className="h-3 w-3" aria-hidden />
          {pkg.packageType}
        </span>
      }
      meta={
        <>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" strokeWidth={1.75} />
            {pkg.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" strokeWidth={1.75} />
            {pkg.durationDays} day{pkg.durationDays === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" strokeWidth={1.75} />
            Up to {pkg.maxGuests}
          </span>
        </>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-base text-[#F7F1E8]">
            From {sym}
            {pkg.priceFrom.toLocaleString("en-IN")}
            <span className="ml-1 text-[0.62rem] font-sans font-normal uppercase tracking-[0.12em] text-[#E8DCC8]/75">
              / package
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-[0.62rem] text-[#D4AF6A]">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
            {pkg.rating}
          </span>
        </div>
      }
    />
  );
}
