/** Convert minor units (paise) to major display amount. */
export function minorToMajor(minor: number): number {
  return Math.round(minor) / 100;
}

/** Parse digits from a rupee amount text field into whole rupees. */
export function parseRupeeMajorInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(parsed, 999_999_999);
}

export function formatMoney(minor: number, symbol = "₹"): string {
  const major = minorToMajor(minor);
  return `${symbol}${major.toLocaleString("en-IN")}`;
}
