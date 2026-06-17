import type { Homestay } from "@/data/homestays";

export const HOMESTAY_CITY = "Mysuru";
export const HOMESTAY_CITY_SLUG = "mysuru";

export type HomestayBrowseSearch = {
  q?: string;
  propertyType?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

export function parseHomestayBrowseSearch(search: Record<string, unknown>): HomestayBrowseSearch {
  const num = (value: unknown) => (typeof value === "string" && value ? Number(value) : undefined);
  return {
    q: typeof search.q === "string" ? search.q : undefined,
    propertyType: typeof search.propertyType === "string" ? search.propertyType : undefined,
    checkIn: typeof search.checkIn === "string" ? search.checkIn : undefined,
    checkOut: typeof search.checkOut === "string" ? search.checkOut : undefined,
    guests: num(search.guests),
  };
}

export function isMysuruHomestay(stay: Homestay): boolean {
  return stay.city.trim().toLowerCase() === HOMESTAY_CITY.toLowerCase();
}

export function filterHomestays(homestays: Homestay[], search: HomestayBrowseSearch): Homestay[] {
  const q = search.q?.trim().toLowerCase();
  const guests = search.guests ?? 0;

  return homestays.filter((stay) => {
    if (!isMysuruHomestay(stay)) return false;
    if (search.propertyType && stay.propertyType !== search.propertyType) return false;
    if (guests > 0 && stay.maxGuests < guests) return false;
    if (!q) return true;
    return (
      stay.title.toLowerCase().includes(q) ||
      stay.city.toLowerCase().includes(q) ||
      stay.propertyType.toLowerCase().includes(q) ||
      stay.address.toLowerCase().includes(q)
    );
  });
}

export function defaultHomestayDates() {
  const today = new Date().toISOString().slice(0, 10);
  const checkOut = new Date(`${today}T12:00:00`);
  checkOut.setDate(checkOut.getDate() + 2);
  return { checkIn: today, checkOut: checkOut.toISOString().slice(0, 10) };
}
