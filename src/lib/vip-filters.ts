import type { VipStay } from "@/data/vips";

export const VIP_CITY = "Mysuru";

export type VipBrowseSearch = {
  q?: string;
  propertyType?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

export function parseVipBrowseSearch(search: Record<string, unknown>): VipBrowseSearch {
  const guestsRaw = search.guests;
  const guests =
    typeof guestsRaw === "number"
      ? guestsRaw
      : typeof guestsRaw === "string" && guestsRaw.trim()
        ? Number.parseInt(guestsRaw, 10)
        : undefined;

  return {
    q: typeof search.q === "string" ? search.q : undefined,
    propertyType: typeof search.propertyType === "string" ? search.propertyType : undefined,
    checkIn: typeof search.checkIn === "string" ? search.checkIn : undefined,
    checkOut: typeof search.checkOut === "string" ? search.checkOut : undefined,
    guests: Number.isFinite(guests) && guests! > 0 ? guests : undefined,
  };
}

export function defaultVipDates() {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 2);
  return {
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}

export function filterVips(stays: VipStay[], search: VipBrowseSearch): VipStay[] {
  const q = search.q?.trim().toLowerCase();
  return stays.filter((stay) => {
    if (search.propertyType && stay.propertyType !== search.propertyType) return false;
    if (search.guests && stay.maxGuests < search.guests) return false;
    if (!q) return true;
    return (
      stay.title.toLowerCase().includes(q) ||
      stay.city.toLowerCase().includes(q) ||
      stay.propertyType.toLowerCase().includes(q) ||
      stay.tagline.toLowerCase().includes(q)
    );
  });
}

export function isMysuruVip(stay: VipStay): boolean {
  return stay.city.toLowerCase() === VIP_CITY.toLowerCase();
}
