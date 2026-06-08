export type CitySummary = {
  slug: string;
  name: string;
  region: string | null;
  state: string;
  tagline: string | null;
  description: string | null;
};

/** Fallback when API/DB unavailable — matches seeded `cities` table. */
export const FALLBACK_CITIES: CitySummary[] = [
  {
    slug: "mysuru",
    name: "Mysuru",
    region: "Southern Karnataka",
    state: "Karnataka",
    tagline: "Palaces, pottery, and slow living",
    description:
      "The Royal Passage home base — heritage walks, artisan studios, farm mornings, and culinary immersions.",
  },
  {
    slug: "bengaluru",
    name: "Bengaluru",
    region: "Urban Karnataka",
    state: "Karnataka",
    tagline: "Creative city escapes",
    description:
      "Weekend workshops, farm-to-table sessions, and curated urban experiences beyond the traffic.",
  },
  {
    slug: "coorg",
    name: "Coorg",
    region: "Western Ghats",
    state: "Karnataka",
    tagline: "Coffee country rituals",
    description:
      "Plantation walks, Kodava cuisine, and misty valley experiences in the Scotland of India.",
  },
  {
    slug: "chikmagalur",
    name: "Chikmagalur",
    region: "Malnad hills",
    state: "Karnataka",
    tagline: "Coffee trails and cloud forests",
    description:
      "Bean-to-cup journeys, waterfall hikes, and homestay-hosted cultural evenings.",
  },
  {
    slug: "hampi",
    name: "Hampi",
    region: "Vijayanagara heritage",
    state: "Karnataka",
    tagline: "Ruins at golden hour",
    description:
      "Archaeological walks, boulder sunsets, and riverside storytelling with local historians.",
  },
  {
    slug: "ooty",
    name: "Ooty",
    region: "Nilgiri hills",
    state: "Tamil Nadu",
    tagline: "Mist, tea, and mountain calm",
    description:
      "Tea estate visits, botanical walks, and slow Nilgiri experiences for mindful travellers.",
  },
];
