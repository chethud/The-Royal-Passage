/** Mirrors backend apply_agent_pricing — discount on subtotal, then GST, then markup. */

export function clampDiscountPercent(value: number): number {
  return Math.max(0, Math.min(Number(value) || 0, 100));
}

export function applyDiscountMinor(subtotalMinor: number, discountPercent: number): number {
  const discount = clampDiscountPercent(discountPercent);
  if (discount <= 0) return subtotalMinor;
  return Math.round(subtotalMinor * (1 - discount / 100));
}

export function applyDiscountMajor(priceMajor: number, discountPercent: number): number {
  const discount = clampDiscountPercent(discountPercent);
  if (discount <= 0) return priceMajor;
  return Math.round(priceMajor * (1 - discount / 100));
}

export function applyTravelAgentPricing(
  subtotalMinor: number,
  gstPercent: number,
  discountPercent: number,
  markupMinor = 0,
): {
  subtotalMinor: number;
  discountedSubtotalMinor: number;
  gstMinor: number;
  totalMinor: number;
} {
  const discountedSubtotalMinor = applyDiscountMinor(subtotalMinor, discountPercent);
  const gst =
    gstPercent > 0 ? Math.round((discountedSubtotalMinor * gstPercent) / 100) : 0;
  const totalMinor = discountedSubtotalMinor + gst + Math.max(0, markupMinor);
  return {
    subtotalMinor,
    discountedSubtotalMinor,
    gstMinor: gst,
    totalMinor,
  };
}

/** Agent catalog/detail display — lower price, public rate as compare-at (no % label). */
export function travelAgentListedPrices(
  priceMajor: number,
  compareAtMajor: number | null | undefined,
  discountPercent: number,
): { price: number; compareAt: number | null | undefined } {
  if (clampDiscountPercent(discountPercent) <= 0) {
    return { price: priceMajor, compareAt: compareAtMajor };
  }
  return {
    price: applyDiscountMajor(priceMajor, discountPercent),
    compareAt: priceMajor,
  };
}

/** Agent homestay nightly rates — weekday/weekend discounted, public rates as compare-at. */
export function travelAgentHomestayRates(
  weekday: number,
  weekend: number,
  compareAtWeekday: number | null | undefined,
  compareAtWeekend: number | null | undefined,
  discountPercent: number,
): {
  weekday: number;
  weekend: number;
  compareAtWeekday: number | null | undefined;
  compareAtWeekend: number | null | undefined;
} {
  if (clampDiscountPercent(discountPercent) <= 0) {
    return { weekday, weekend, compareAtWeekday, compareAtWeekend };
  }
  return {
    weekday: applyDiscountMajor(weekday, discountPercent),
    weekend: applyDiscountMajor(weekend, discountPercent),
    // Public listed rates — not host promo compare-at — so agents see original vs their rate.
    compareAtWeekday: weekday,
    compareAtWeekend: weekend,
  };
}

/** Markup on agent cost (discounted subtotal + GST, before markup). */
export function markupFromPercent(baseMinor: number, percent: number): number {
  const base = Math.max(0, baseMinor);
  const p = Math.max(0, Number(percent) || 0);
  return Math.round((base * p) / 100);
}

export function markupPercentOf(baseMinor: number, markupMinor: number): number {
  const base = Math.max(0, baseMinor);
  const markup = Math.max(0, markupMinor);
  if (base <= 0 || markup <= 0) return 0;
  return Math.round((markup / base) * 100);
}

export function agentCostMinor(
  discountedSubtotalMinor: number,
  gstMinor: number,
): number {
  return Math.max(0, discountedSubtotalMinor) + Math.max(0, gstMinor);
}
