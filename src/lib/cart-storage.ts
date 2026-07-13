import type { Experience } from "@/data/experiences";
import type { Homestay } from "@/data/homestays";
import type { WishlistItem } from "@/lib/api/wishlist";
import { guestBookingLimits } from "@/lib/booking-url";
import { filterSlotsWithinBookingWindow } from "@/lib/booking-window";
import type { HomestayBrowseSearch } from "@/lib/homestay-filters";
import { weekdayPriceMajor } from "@/lib/homestay-day-pricing";

export type ExperienceCartItem = {
  kind: "experience";
  /** Stable cart row id (= experienceId for experiences). */
  id: string;
  experienceId: string;
  slug: string;
  title: string;
  tagline?: string;
  city: string;
  image: string;
  pricePerPerson: number;
  currencySymbol: string;
  slotId?: string;
  guests?: number;
  addedAt: string;
};

export type HomestayCartItem = {
  kind: "homestay";
  id: string;
  homestayId: string;
  slug: string;
  title: string;
  tagline?: string;
  city: string;
  image: string;
  pricePerNight: number;
  currencySymbol: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  addedAt: string;
};

export type CartItem = ExperienceCartItem | HomestayCartItem;

/** @deprecated Prefer CartItem; kept for wishlist mapping helpers. */
export type LegacyExperienceCartShape = Omit<ExperienceCartItem, "kind" | "id"> & {
  experienceId: string;
};

const CART_STORAGE_KEY = "rp_marketplace_cart_v2";
const LEGACY_CART_STORAGE_KEY = "rp_experience_cart_v1";
const CART_EVENT = "rp-cart-updated";

function readCartRaw(): CartItem[] {
  if (typeof window === "undefined") return [];

  const rawV2 = window.localStorage.getItem(CART_STORAGE_KEY);
  if (rawV2) {
    try {
      const parsed = JSON.parse(rawV2) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeCartItem).filter((item): item is CartItem => item != null);
      }
    } catch {
      // fall through to legacy
    }
  }

  const rawV1 = window.localStorage.getItem(LEGACY_CART_STORAGE_KEY);
  if (!rawV1) return [];
  try {
    const parsed = JSON.parse(rawV1) as unknown;
    if (!Array.isArray(parsed)) return [];
    const migrated = parsed
      .map(normalizeCartItem)
      .filter((item): item is CartItem => item != null);
    if (migrated.length > 0) writeCart(migrated);
    window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    return migrated;
  } catch {
    return [];
  }
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;

  if (item.kind === "homestay" || (!item.kind && typeof item.homestayId === "string")) {
    const homestayId = String(item.homestayId ?? item.id ?? "");
    if (!homestayId || typeof item.slug !== "string" || typeof item.title !== "string") return null;
    return {
      kind: "homestay",
      id: homestayId,
      homestayId,
      slug: item.slug,
      title: item.title,
      tagline: typeof item.tagline === "string" ? item.tagline : undefined,
      city: typeof item.city === "string" ? item.city : "",
      image: typeof item.image === "string" ? item.image : "",
      pricePerNight: Number(item.pricePerNight) || 0,
      currencySymbol: typeof item.currencySymbol === "string" ? item.currencySymbol : "₹",
      checkIn: typeof item.checkIn === "string" ? item.checkIn : undefined,
      checkOut: typeof item.checkOut === "string" ? item.checkOut : undefined,
      guests: typeof item.guests === "number" ? item.guests : undefined,
      addedAt: typeof item.addedAt === "string" ? item.addedAt : new Date().toISOString(),
    };
  }

  const experienceId = String(item.experienceId ?? (item.kind === "experience" ? item.id : "") ?? "");
  if (!experienceId || typeof item.slug !== "string" || typeof item.title !== "string") {
    // Legacy v1 rows always had experienceId
    if (typeof item.experienceId !== "string") return null;
  }
  const expId = typeof item.experienceId === "string" ? item.experienceId : experienceId;
  if (!expId || typeof item.slug !== "string" || typeof item.title !== "string") return null;

  return {
    kind: "experience",
    id: expId,
    experienceId: expId,
    slug: item.slug,
    title: item.title,
    tagline: typeof item.tagline === "string" ? item.tagline : undefined,
    city: typeof item.city === "string" ? item.city : "",
    image: typeof item.image === "string" ? item.image : "",
    pricePerPerson: Number(item.pricePerPerson) || 0,
    currencySymbol: typeof item.currencySymbol === "string" ? item.currencySymbol : "₹",
    slotId: typeof item.slotId === "string" ? item.slotId : undefined,
    guests: typeof item.guests === "number" ? item.guests : undefined,
    addedAt: typeof item.addedAt === "string" ? item.addedAt : new Date().toISOString(),
  };
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function listCartItems(): CartItem[] {
  return readCartRaw();
}

export function cartItemCount(): number {
  return readCartRaw().length;
}

export function isInCart(id: string): boolean {
  return readCartRaw().some((item) => item.id === id);
}

export function isExperienceInCart(experienceId: string): boolean {
  return readCartRaw().some(
    (item) => item.kind === "experience" && item.experienceId === experienceId,
  );
}

export function isHomestayInCart(homestayId: string): boolean {
  return readCartRaw().some((item) => item.kind === "homestay" && item.homestayId === homestayId);
}

export function addCartItem(item: CartItem): CartItem[] {
  const existing = readCartRaw();
  if (existing.some((row) => row.id === item.id)) {
    return existing;
  }
  const next = [{ ...item, addedAt: item.addedAt || new Date().toISOString() }, ...existing];
  writeCart(next);
  return next;
}

export function removeCartItem(id: string): CartItem[] {
  const next = readCartRaw().filter((item) => item.id !== id);
  writeCart(next);
  return next;
}

export function cartItemFromExperience(exp: Experience): ExperienceCartItem {
  const nextSlot = filterSlotsWithinBookingWindow(exp.slots).find((slot) => slot.available > 0);
  const guests = nextSlot ? guestBookingLimits(exp, nextSlot.available).min : 1;

  return {
    kind: "experience",
    id: exp.id,
    experienceId: exp.id,
    slug: exp.slug,
    title: exp.title,
    tagline: exp.tagline,
    city: exp.city,
    image: exp.image,
    pricePerPerson: exp.pricePerPerson,
    currencySymbol: exp.currencySymbol ?? "₹",
    slotId: nextSlot?.id,
    guests,
    addedAt: new Date().toISOString(),
  };
}

export function cartItemFromHomestay(
  stay: Homestay,
  search?: HomestayBrowseSearch,
): HomestayCartItem {
  return {
    kind: "homestay",
    id: stay.id,
    homestayId: stay.id,
    slug: stay.slug,
    title: stay.title,
    tagline: stay.tagline,
    city: stay.city,
    image: stay.image,
    pricePerNight: weekdayPriceMajor(stay),
    currencySymbol: stay.currencySymbol ?? "₹",
    checkIn: search?.checkIn,
    checkOut: search?.checkOut,
    guests: search?.guests,
    addedAt: new Date().toISOString(),
  };
}

export function cartItemFromWishlist(item: WishlistItem): ExperienceCartItem {
  const exp = item.experience;
  return {
    kind: "experience",
    id: item.experienceId,
    experienceId: item.experienceId,
    slug: exp.slug,
    title: exp.title,
    tagline: exp.tagline ?? undefined,
    city: exp.city,
    image: exp.image,
    pricePerPerson: exp.pricePerPerson,
    currencySymbol: exp.currencySymbol,
    addedAt: new Date().toISOString(),
  };
}

export function subscribeCart(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => listener();
  window.addEventListener(CART_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CART_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
