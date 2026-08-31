import { formatMoney, minorToMajor } from "@/lib/money";
import { cn } from "@/lib/utils";

type OfferTone = "light" | "dark";

type OfferPriceProps = {
  /** Selling price in major rupees (or other currency majors). */
  price: number;
  /** Optional original / "was" price in majors. */
  compareAt?: number | null;
  currencySymbol?: string;
  className?: string;
  priceClassName?: string;
  compareClassName?: string;
  percentClassName?: string;
  showPercent?: boolean;
  /** When prices are already in minor units. */
  asMinor?: boolean;
  /** light = cream forms; dark = marketplace / detail panels. */
  tone?: OfferTone;
};

export function offerPercentOff(price: number, compareAt: number | null | undefined): number | null {
  if (compareAt == null || compareAt <= price || price < 0) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function OfferPrice({
  price,
  compareAt,
  currencySymbol = "₹",
  className,
  priceClassName,
  compareClassName,
  percentClassName,
  showPercent = true,
  asMinor = false,
  tone = "light",
}: OfferPriceProps) {
  const sell = asMinor ? minorToMajor(price) : price;
  const was = compareAt != null ? (asMinor ? minorToMajor(compareAt) : compareAt) : null;
  const percent = was != null ? offerPercentOff(sell, was) : null;
  const hasOffer = percent != null && percent > 0;

  const sellLabel = asMinor
    ? formatMoney(price, currencySymbol)
    : `${currencySymbol}${sell.toLocaleString("en-IN")}`;
  const wasLabel =
    was != null
      ? asMinor
        ? formatMoney(compareAt!, currencySymbol)
        : `${currencySymbol}${was.toLocaleString("en-IN")}`
      : null;

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      {hasOffer && wasLabel ? (
        <span
          className={cn(
            "text-sm line-through",
            tone === "dark"
              ? "text-[#D6C8B5]/55 decoration-[#D6C8B5]/45"
              : "text-[rgb(74_0_0/0.55)] decoration-[rgb(74_0_0/0.45)]",
            compareClassName,
          )}
        >
          {wasLabel}
        </span>
      ) : null}
      <span className={cn("font-medium tabular-nums", priceClassName, hasOffer && (tone === "dark" ? "text-[#D4AF37]" : "text-[#8B1E1E]"))}>
        {sellLabel}
      </span>
      {hasOffer && showPercent ? (
        <span
          className={cn(
            "text-xs font-medium uppercase tracking-[0.08em]",
            tone === "dark" ? "text-[#D4AF37]" : "text-[#8B1E1E]",
            percentClassName,
          )}
        >
          {percent}% off
        </span>
      ) : null}
    </span>
  );
}

/** Lowest nightly rate with optional property-level compare-at. */
export function HomestayOfferRates({
  symbol,
  weekday,
  weekend,
  compareAtWeekday,
  compareAtWeekend,
  tone = "dark",
  showPercent = true,
  className,
  priceClassName,
}: {
  symbol: string;
  weekday: number;
  weekend: number;
  compareAtWeekday?: number | null;
  compareAtWeekend?: number | null;
  tone?: OfferTone;
  showPercent?: boolean;
  className?: string;
  priceClassName?: string;
}) {
  const useWeekday = weekday <= weekend;
  const fromPrice = useWeekday ? weekday : weekend;
  const compareAt = useWeekday ? compareAtWeekday : compareAtWeekend;

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-1.5", className)}>
      <OfferPrice
        price={fromPrice}
        compareAt={compareAt}
        currencySymbol={symbol}
        tone={tone}
        showPercent={showPercent}
        priceClassName={priceClassName}
      />
      <span
        className={cn(
          "text-[0.58rem] font-semibold uppercase tracking-[0.12em]",
          tone === "dark" ? "text-[#D6C8B5]/75" : "text-[rgb(74_0_0/0.55)]",
        )}
      >
        / night
      </span>
    </span>
  );
}
