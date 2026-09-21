export type Slot = {
  id: string;
  date: string; // ISO date
  start: string; // HH:mm
  end: string;
  capacity: number;
  available: number;
};

export type Experience = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Display label (static demo or DB category label) */
  category: string;
  city: string;
  citySlug?: string;
  address: string;
  mapLink?: string;
  durationHours: number;
  hostName: string;
  hostBio: string;
  verifiedHost: boolean;
  pricePerPerson: number;
  /** Optional original / "was" price (majors). */
  compareAtPricePerPerson?: number | null;
  /** Host GST % added on top of the experience subtotal at checkout. */
  gstPercent?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  inclusions: string[];
  exclusions?: string[];
  requirements?: string[];
  galleryUrls?: string[];
  region?: string;
  cancellation: string;
  slots: Slot[];
  /** UI price prefix — demo uses €, Supabase listings use ₹ */
  currencySymbol?: string;
  minGuestsPerBooking?: number;
  maxGuestsPerBooking?: number;
};

export const categories = ["Dining", "Voyage", "Craft", "Wellness", "Drive", "Tasting"] as const;
export const cities = ["Mysuru", "Bengaluru", "Coorg", "Chikmagalur", "Hampi", "Ooty"] as const;

/**
 * Offline fallback catalog. Empty on purpose so the live site never shows
 * Lisbon/Kyoto/etc. dummy listings when the API is unavailable.
 * Real experiences come from Supabase (Open Jeep Night Tour, etc.).
 */
export const experiences: Experience[] = [];

export const getExperience = (slug: string) => experiences.find((e) => e.slug === slug);
