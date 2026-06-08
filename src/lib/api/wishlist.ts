import { apiFetch } from "@/lib/api/client";

export type WishlistExperienceSummary = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  city: string;
  image: string;
  pricePerPerson: number;
  rating: number;
  reviewsCount: number;
  currencySymbol: string;
  hostName: string;
};

export type WishlistItem = {
  experienceId: string;
  savedAt: string;
  experience: WishlistExperienceSummary;
};

export function fetchWishlist(accessToken: string) {
  return apiFetch<WishlistItem[]>("/api/v1/wishlist", { accessToken });
}

export function addWishlistItem(accessToken: string, experienceId: string) {
  return apiFetch<WishlistItem>(`/api/v1/wishlist/${experienceId}`, {
    method: "POST",
    accessToken,
  });
}

export function removeWishlistItem(accessToken: string, experienceId: string) {
  return apiFetch<{ ok: boolean }>(`/api/v1/wishlist/${experienceId}`, {
    method: "DELETE",
    accessToken,
  });
}
