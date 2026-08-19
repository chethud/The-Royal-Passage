import { HERO_DESTINATIONS, type HeroDestination } from "@/data/mysore-trail-hero-destinations";
import {
  TRAIL_PLACES,
  type TrailCategory,
  type TrailPlace,
} from "@/data/mysore-trail-journey";

export const MYSORE_TRAIL_CATALOG_KEY = "mysore_trail_catalog_v1";

const TRAIL_CATEGORIES: TrailCategory[] = [
  "heritage",
  "architecture",
  "food",
  "culture",
  "nature",
  "photography",
  "shopping",
  "spiritual",
  "hidden",
  "family",
  "luxury",
];

/** Editable fields for a catalog place (shown on public itinerary cards). */
export type MysoreTrailPlaceDraft = {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  cityLabel: string;
  image: string;
  imageAlt: string;
  description: string;
  categories: TrailCategory[];
};

/** Editable fields for cinematic hero destinations. */
export type MysoreTrailHeroDraft = {
  id: string;
  placeId?: string;
  name: string;
  titleLines: string[];
  cardLines: string[];
  location: string;
  eyebrow: string;
  description: string;
  image: string;
  imageAlt: string;
  category: string;
};

export type MysoreTrailCatalog = {
  places: MysoreTrailPlaceDraft[];
  heroes: MysoreTrailHeroDraft[];
};

function isCategory(value: unknown): value is TrailCategory {
  return typeof value === "string" && TRAIL_CATEGORIES.includes(value as TrailCategory);
}

function asString(value: unknown, fallback: string, max = 2000): string {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, max) || fallback;
}

function asStringArray(value: unknown, fallback: string[], maxItems = 4, maxLen = 80): string[] {
  if (!Array.isArray(value)) return fallback;
  const next = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
  return next.length ? next : fallback;
}

export function placeToDraft(place: TrailPlace): MysoreTrailPlaceDraft {
  return {
    id: place.id,
    name: place.name,
    shortName: place.shortName,
    tagline: place.tagline,
    cityLabel: place.cityLabel,
    image: place.image,
    imageAlt: place.imageAlt,
    description: place.description,
    categories: [...place.categories],
  };
}

export function heroToDraft(hero: HeroDestination): MysoreTrailHeroDraft {
  return {
    id: hero.id,
    placeId: hero.placeId,
    name: hero.name,
    titleLines: [...hero.titleLines],
    cardLines: [...hero.cardLines],
    location: hero.location,
    eyebrow: hero.eyebrow,
    description: hero.description,
    image: hero.image,
    imageAlt: hero.imageAlt,
    category: hero.category,
  };
}

export function defaultMysoreTrailCatalog(): MysoreTrailCatalog {
  return {
    places: Object.values(TRAIL_PLACES).map(placeToDraft),
    heroes: HERO_DESTINATIONS.map(heroToDraft),
  };
}

function normalizePlaceDraft(
  raw: unknown,
  fallback: MysoreTrailPlaceDraft,
): MysoreTrailPlaceDraft {
  if (!raw || typeof raw !== "object") return structuredClone(fallback);
  const row = raw as Record<string, unknown>;
  const categories = Array.isArray(row.categories)
    ? row.categories.filter(isCategory).slice(0, 6)
    : fallback.categories;
  return {
    id: fallback.id,
    name: asString(row.name, fallback.name, 120),
    shortName: asString(row.shortName, fallback.shortName, 80),
    tagline: asString(row.tagline, fallback.tagline, 200),
    cityLabel: asString(row.cityLabel, fallback.cityLabel, 80),
    image: asString(row.image, fallback.image, 2000),
    imageAlt: asString(row.imageAlt, fallback.imageAlt, 200),
    description: asString(row.description, fallback.description, 1200),
    categories: categories.length ? categories : fallback.categories,
  };
}

function normalizeHeroDraft(
  raw: unknown,
  fallback: MysoreTrailHeroDraft,
): MysoreTrailHeroDraft {
  if (!raw || typeof raw !== "object") return structuredClone(fallback);
  const row = raw as Record<string, unknown>;
  return {
    id: fallback.id,
    placeId: typeof row.placeId === "string" ? row.placeId : fallback.placeId,
    name: asString(row.name, fallback.name, 120),
    titleLines: asStringArray(row.titleLines, fallback.titleLines, 3, 40),
    cardLines: asStringArray(row.cardLines, fallback.cardLines, 2, 40),
    location: asString(row.location, fallback.location, 120),
    eyebrow: asString(row.eyebrow, fallback.eyebrow, 80),
    description: asString(row.description, fallback.description, 500),
    image: asString(row.image, fallback.image, 2000),
    imageAlt: asString(row.imageAlt, fallback.imageAlt, 200),
    category: asString(row.category, fallback.category, 60),
  };
}

/** Merge published CMS payload onto code defaults (keeps new places/heroes from code). */
export function normalizeMysoreTrailCatalog(raw: unknown): MysoreTrailCatalog {
  const defaults = defaultMysoreTrailCatalog();
  if (!raw || typeof raw !== "object") return defaults;

  const payload = raw as Record<string, unknown>;
  const placeById = new Map<string, unknown>();
  if (Array.isArray(payload.places)) {
    for (const item of payload.places) {
      if (item && typeof item === "object" && "id" in item) {
        placeById.set(String((item as { id: unknown }).id), item);
      }
    }
  }
  const heroById = new Map<string, unknown>();
  if (Array.isArray(payload.heroes)) {
    for (const item of payload.heroes) {
      if (item && typeof item === "object" && "id" in item) {
        heroById.set(String((item as { id: unknown }).id), item);
      }
    }
  }

  return {
    places: defaults.places.map((place) =>
      normalizePlaceDraft(placeById.get(place.id), place),
    ),
    heroes: defaults.heroes.map((hero) =>
      normalizeHeroDraft(heroById.get(hero.id), hero),
    ),
  };
}

function isWikimediaPhoto(url: string): boolean {
  return url.includes("upload.wikimedia.org");
}

/** Prefer the code catalog over leftover Wikimedia files still stored in CMS. */
function catalogPhoto(codeImage: string, cmsImage: string): string {
  const cms = cmsImage.trim();
  const code = codeImage.trim();
  if (isWikimediaPhoto(cms)) return code;
  return cms || code;
}

export function applyCatalogToPlaces(catalog: MysoreTrailCatalog): Record<string, TrailPlace> {
  const next: Record<string, TrailPlace> = { ...TRAIL_PLACES };
  for (const draft of catalog.places) {
    const base = next[draft.id];
    if (!base) continue;
    const image = catalogPhoto(base.image, draft.image);
    next[draft.id] = {
      ...base,
      name: draft.name,
      shortName: draft.shortName,
      tagline: draft.tagline,
      cityLabel: draft.cityLabel,
      image,
      imageAlt: image ? draft.imageAlt || base.imageAlt : "",
      description: draft.description,
      categories: draft.categories.length ? draft.categories : base.categories,
    };
  }
  return next;
}

export function applyCatalogToHeroes(catalog: MysoreTrailCatalog): HeroDestination[] {
  const places = applyCatalogToPlaces(catalog);
  const byId = new Map(catalog.heroes.map((hero) => [hero.id, hero]));
  return HERO_DESTINATIONS.map((hero) => {
    const draft = byId.get(hero.id);
    const placeId = draft?.placeId ?? hero.placeId;
    const place = placeId ? places[placeId] : undefined;
    if (!draft) {
      if (!place?.image) return hero;
      return { ...hero, image: place.image, imageAlt: place.imageAlt || hero.imageAlt };
    }
    const image = place?.image || catalogPhoto(hero.image, draft.image);
    return {
      ...hero,
      placeId,
      name: draft.name,
      titleLines: draft.titleLines,
      cardLines: draft.cardLines,
      location: draft.location,
      eyebrow: draft.eyebrow,
      description: draft.description,
      image,
      imageAlt: image ? place?.imageAlt || draft.imageAlt || hero.imageAlt : "",
      category: draft.category,
    };
  });
}

export { TRAIL_CATEGORIES };
