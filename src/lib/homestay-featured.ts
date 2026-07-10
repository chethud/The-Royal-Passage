import type { Homestay } from "@/data/homestays";
import { HOMESTAY_FEATURED_SLOT_COUNT } from "@/lib/homestay-featured-keys";

export function parseFeaturedHomestaySlugs(raw: unknown): string[] {
  let value = raw;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      value = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  return value
    .filter((slug): slug is string => typeof slug === "string" && slug.trim().length > 0)
    .map((slug) => slug.trim())
    .slice(0, HOMESTAY_FEATURED_SLOT_COUNT);
}

export function resolveFeaturedHomestays(all: Homestay[], slugs: string[]): Homestay[] {
  const catalog = all.filter(Boolean);
  if (catalog.length === 0) return [];

  const bySlug = new Map(catalog.map((stay) => [stay.slug, stay]));
  const resolved: Homestay[] = [];

  for (const slug of slugs) {
    const stay = bySlug.get(slug);
    if (stay && !resolved.some((item) => item.id === stay.id)) {
      resolved.push(stay);
    }
  }

  if (resolved.length < HOMESTAY_FEATURED_SLOT_COUNT) {
    for (const stay of catalog) {
      if (resolved.length >= HOMESTAY_FEATURED_SLOT_COUNT) break;
      if (!resolved.some((item) => item.id === stay.id)) {
        resolved.push(stay);
      }
    }
  }

  return resolved.slice(0, HOMESTAY_FEATURED_SLOT_COUNT);
}
