/** Convert minor units (paise) to major display amount. */
export function minorToMajor(minor: number): number {
  return Math.round(minor) / 100;
}

export function formatMoney(minor: number, symbol = "₹"): string {
  const major = minorToMajor(minor);
  return `${symbol}${major.toLocaleString("en-IN")}`;
}
