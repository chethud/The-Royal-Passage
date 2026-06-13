import type { Experience } from "@/data/experiences";
import type { WishlistItem } from "@/lib/api/wishlist";
import { guestBookingLimits } from "@/lib/booking-url";
import { filterSlotsWithinBookingWindow } from "@/lib/booking-window";

export type CartItem = {
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

const CART_STORAGE_KEY = "rp_experience_cart_v1";
const CART_EVENT = "rp-cart-updated";

function readCartRaw(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.experienceId === "string" &&
    typeof item.slug === "string" &&
    typeof item.title === "string" &&
    typeof item.city === "string" &&
    typeof item.image === "string" &&
    typeof item.pricePerPerson === "number" &&
    typeof item.currencySymbol === "string" &&
    typeof item.addedAt === "string"
  );
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

export function isInCart(experienceId: string): boolean {
  return readCartRaw().some((item) => item.experienceId === experienceId);
}

export function addCartItem(item: CartItem): CartItem[] {
  const existing = readCartRaw();
  if (existing.some((row) => row.experienceId === item.experienceId)) {
    return existing;
  }
  const next = [{ ...item, addedAt: item.addedAt || new Date().toISOString() }, ...existing];
  writeCart(next);
  return next;
}

export function removeCartItem(experienceId: string): CartItem[] {
  const next = readCartRaw().filter((item) => item.experienceId !== experienceId);
  writeCart(next);
  return next;
}

export function cartItemFromExperience(exp: Experience): CartItem {
  const nextSlot = filterSlotsWithinBookingWindow(exp.slots).find((slot) => slot.available > 0);
  const guests = nextSlot ? guestBookingLimits(exp, nextSlot.available).min : 1;

  return {
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

export function cartItemFromWishlist(item: WishlistItem): CartItem {
  const exp = item.experience;
  return {
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
