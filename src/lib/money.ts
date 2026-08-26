/** Convert minor units (paise) to major display amount. */
export function minorToMajor(minor: number): number {
  return Math.round(minor) / 100;
}

/** Whole rupees → paise without float drift (5000 stays 500000, not 499800). */
export function majorToMinor(major: number): number {
  const whole = Math.round(Number(major));
  if (!Number.isFinite(whole) || whole <= 0) return 0;
  return whole * 100;
}

/** Parse digits from a rupee amount text field into whole rupees. */
export function parseRupeeMajorInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(parsed, 999_999_999);
}

/** Parse a percent text field (e.g. GST) allowing up to 2 decimal places. */
export function parsePercentInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return 0;
  const parts = cleaned.split(".");
  const normalized =
    parts.length <= 1
      ? cleaned
      : `${parts[0] || "0"}.${parts.slice(1).join("").slice(0, 2)}`;
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(Math.round(parsed * 100) / 100, 100);
}

export function gstMinorFromSubtotal(subtotalMinor: number, gstPercent: number): number {
  if (!Number.isFinite(subtotalMinor) || subtotalMinor <= 0) return 0;
  if (!Number.isFinite(gstPercent) || gstPercent <= 0) return 0;
  return Math.round((subtotalMinor * gstPercent) / 100);
}

export function formatMoney(minor: number, symbol = "₹"): string {
  const major = minorToMajor(minor);
  return `${symbol}${major.toLocaleString("en-IN")}`;
}
