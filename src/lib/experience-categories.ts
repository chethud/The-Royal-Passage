import type { CategoryOption } from "@/lib/api/host-experiences";

/** Fallback when API/DB unavailable — matches seeded `experience_categories` table. */
export const FALLBACK_CATEGORIES: CategoryOption[] = [
  { slug: "art_craft", label: "Art & Craft" },
  { slug: "outdoor_nature", label: "Outdoor & Nature" },
  { slug: "culinary", label: "Culinary & Food" },
  { slug: "wellness", label: "Wellness & Healing" },
  { slug: "digital_detox", label: "Digital Detox & Slow Living" },
  { slug: "rural_farm", label: "Rural & Farm" },
  { slug: "cultural_heritage", label: "Cultural & Heritage" },
  { slug: "premium_luxury", label: "Premium / Luxury" },
];
