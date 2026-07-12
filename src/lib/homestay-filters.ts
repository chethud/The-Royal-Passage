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
  const readPositiveInt = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) {
      const n = Math.trunc(value);
      return n > 0 ? n : undefined;
    }
    if (typeof value === "string" && value.trim()) {
      const n = Number.parseInt(value, 10);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    }
    return undefined;
  };
  const readDate = (value: unknown): string | undefined => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined;
  };

  return {
    q: typeof search.q === "string" ? search.q : undefined,
    propertyType: typeof search.propertyType === "string" ? search.propertyType : undefined,
    checkIn: readDate(search.checkIn),
    checkOut: readDate(search.checkOut),
    guests: readPositiveInt(search.guests),
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
  /** Prefer empty dates in search UIs — guests choose explicitly. */
  return { checkIn: "", checkOut: "" };
}
