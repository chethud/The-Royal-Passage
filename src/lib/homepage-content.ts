import expCraftImg from "@/assets/exp-craft.jpg";
import heroPalaceImg from "@/assets/hero-image.png";
import masalaDoseImg from "@/assets/masala-dose.png";
import natureWalksImg from "@/assets/nature-walks.png";
import outdoorCookingImg from "@/assets/outdoor-cooking.png";
import {
  HOMEPAGE_CACHE_KEY,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  HOMEPAGE_VERSION_KEY,
  normalizeHomepageContent as normalizeHomepageContentBase,
  parseVersionValue,
  type HomepageContent,
  type HomepageJournalItem,
  type HomepageShowcaseItem,
  type ShowcaseIconKey,
} from "@/lib/homepage-content-keys";

export {
  HOMEPAGE_CACHE_KEY,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  HOMEPAGE_VERSION_KEY,
  parseVersionValue,
  type HomepageContent,
  type HomepageJournalItem,
  type HomepageShowcaseItem,
  type ShowcaseIconKey,
};

export function normalizeHomepageContent(raw: {
  showcase?: unknown;
  journal?: unknown;
  version?: unknown;
}): HomepageContent {
  return normalizeHomepageContentBase(raw, {
    showcaseFallbacks: DEFAULT_HOMEPAGE_SHOWCASE,
    journalFallbacks: DEFAULT_HOMEPAGE_JOURNAL,
  });
}

export function withHomepageCacheBust(imageUrl: string, version: number): string {
  if (!imageUrl.trim() || version <= 0) return imageUrl;
  const join = imageUrl.includes("?") ? "&" : "?";
  return `${imageUrl}${join}v=${version}`;
}

export const DEFAULT_HOMEPAGE_SHOWCASE: HomepageShowcaseItem[] = [
  {
    id: "showcase-pottery",
    iconKey: "pottery",
    title: "Pottery Experience",
    imageUrl: expCraftImg,
    alt: "Hands shaping clay on a pottery wheel",
    href: "/experiences?category=Craft",
  },
  {
    id: "showcase-cooking",
    iconKey: "flame",
    title: "Outdoor Cooking",
    imageUrl: outdoorCookingImg,
    alt: "Open fire cooking in the wild under warm light",
    href: "/experiences?category=Tasting",
  },
  {
    id: "showcase-heritage",
    iconKey: "heritage",
    title: "Heritage Walks",
    imageUrl: heroPalaceImg,
    alt: "Mysuru palace at golden hour",
    href: "/experiences",
  },
];

export const DEFAULT_HOMEPAGE_JOURNAL: HomepageJournalItem[] = [
  {
    id: "journal-walk",
    imageUrl: heroPalaceImg,
    alt: "Mysuru Palace illuminated at sunset",
    title: "A Walk Through Time",
    excerpt: "Heritage walks in Mysuru are like stepping into a royal era.",
  },
  {
    id: "journal-flavours",
    imageUrl: masalaDoseImg,
    alt: "A crisp masala dose served with chutneys — Mysuru's iconic breakfast",
    title: "Flavours of Mysuru",
    excerpt: "Explore the culinary legacy of the Wadiyars.",
  },
  {
    id: "journal-nature",
    imageUrl: natureWalksImg,
    alt: "A nature trail winding through the green hills near Mysuru",
    title: "Nature's Escape",
    excerpt: "Unwind in the serene trails around Mysuru.",
  },
];

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  showcase: DEFAULT_HOMEPAGE_SHOWCASE,
  journal: DEFAULT_HOMEPAGE_JOURNAL,
  version: 0,
};
