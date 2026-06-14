import type { BookingSummary } from "@/lib/api/bookings";

/** Slug param for `/experiences/$slug` — prefers slug, falls back to experience id. */
export function experienceDetailSlug(
  experience: Pick<BookingSummary["experience"], "slug" | "id">,
): string | null {
  const slug = experience.slug?.trim();
  if (slug) return slug;
  const id = experience.id?.trim();
  return id || null;
}
