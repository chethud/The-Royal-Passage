import type { VipPackage } from "@/data/vips";
import { todayIsoDate } from "@/lib/booking-window";
import { addDays } from "@/lib/weekday-slots";

export const VIP_CITY = "Mysuru";
export const VIP_CITY_SLUG = "mysuru";
/** Guests must start travel at least this many calendar days after today. */
export const VIP_MIN_ADVANCE_DAYS = 4;

export const VIP_BOOKING_POLICY_SHORT = "Mysuru only · Book 4+ days ahead";
export const VIP_BOOKING_POLICY_LINE =
  "Royal VIP packages run in Mysuru only. Travel must start at least 4 days from today.";

export type VipBrowseSearch = {
  q?: string;
  packageType?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

export type VipBrowseBlockReason = "missing" | "too_soon" | "ready";

export function minVipTravelFromDate(referenceToday = todayIsoDate()): string {
  return addDays(referenceToday, VIP_MIN_ADVANCE_DAYS);
}

export function isVipTravelDateAllowed(isoDate: string, referenceToday = todayIsoDate()): boolean {
  return isoDate.slice(0, 10) >= minVipTravelFromDate(referenceToday);
}

export function parseVipBrowseSearch(search: Record<string, unknown>): VipBrowseSearch {
  const guestsRaw = search.guests;
  const guests =
    typeof guestsRaw === "number"
      ? guestsRaw
      : typeof guestsRaw === "string" && guestsRaw.trim()
        ? Number.parseInt(guestsRaw, 10)
        : undefined;

  const packageType =
    typeof search.packageType === "string"
      ? search.packageType
      : typeof search.propertyType === "string"
        ? search.propertyType
        : undefined;

  return {
    q: typeof search.q === "string" ? search.q : undefined,
    packageType,
    checkIn: typeof search.checkIn === "string" ? search.checkIn : undefined,
    checkOut: typeof search.checkOut === "string" ? search.checkOut : undefined,
    guests: Number.isFinite(guests) && guests! > 0 ? guests : undefined,
  };
}

export function defaultVipDates(referenceToday = todayIsoDate()) {
  const checkIn = minVipTravelFromDate(referenceToday);
  const checkOut = addDays(checkIn, 2);
  return { checkIn, checkOut };
}

export function normalizeVipTravelDates(
  checkIn?: string,
  checkOut?: string,
  referenceToday = todayIsoDate(),
): { checkIn: string; checkOut: string } {
  const minStart = minVipTravelFromDate(referenceToday);
  let nextCheckIn = checkIn?.trim() && isVipTravelDateAllowed(checkIn, referenceToday)
    ? checkIn.slice(0, 10)
    : minStart;
  let nextCheckOut = checkOut?.trim() ? checkOut.slice(0, 10) : addDays(nextCheckIn, 2);
  if (nextCheckOut <= nextCheckIn) {
    nextCheckOut = addDays(nextCheckIn, 1);
  }
  return { checkIn: nextCheckIn, checkOut: nextCheckOut };
}

export function filterVips(packages: VipPackage[], search: VipBrowseSearch): VipPackage[] {
  const q = search.q?.trim().toLowerCase();
  return packages.filter((pkg) => {
    if (search.packageType && pkg.packageType !== search.packageType) return false;
    if (search.guests && pkg.maxGuests < search.guests) return false;
    if (!q) return true;
    return (
      pkg.title.toLowerCase().includes(q) ||
      pkg.city.toLowerCase().includes(q) ||
      pkg.packageType.toLowerCase().includes(q) ||
      pkg.tagline.toLowerCase().includes(q)
    );
  });
}

export function isMysuruVip(pkg: VipPackage): boolean {
  return pkg.city.toLowerCase() === VIP_CITY.toLowerCase();
}

export function vipBrowseBlockReason(
  search: VipBrowseSearch,
  referenceToday = todayIsoDate(),
): VipBrowseBlockReason {
  if (!search.checkIn?.trim() || !search.checkOut?.trim() || !search.guests || search.guests < 1) {
    return "missing";
  }
  if (search.checkOut <= search.checkIn) return "missing";
  if (!isVipTravelDateAllowed(search.checkIn, referenceToday)) return "too_soon";
  return "ready";
}

export function hasVipBrowseCriteria(
  search: VipBrowseSearch,
  referenceToday = todayIsoDate(),
): boolean {
  return vipBrowseBlockReason(search, referenceToday) === "ready";
}
