import { marketplaceCardFrameClass } from "@/components/site/MarketplaceCard";

export function ExperienceCardSkeleton() {
  return (
    <div className={marketplaceCardFrameClass} aria-hidden>
      <div className="luxury-shimmer absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 space-y-2.5 p-5">
        <div className="luxury-shimmer h-5 w-4/5 rounded-sm" />
        <div className="luxury-shimmer h-3.5 w-2/5 rounded-sm" />
        <div className="luxury-shimmer h-3 w-1/3 rounded-sm" />
      </div>
    </div>
  );
}

export { ExperienceCardSkeleton as MarketplaceCardSkeleton };
