import expCraftImg from "@/assets/exp-craft.jpg";
import expDiningImg from "@/assets/exp-dining.jpg";
import heroPalaceImg from "@/assets/hero-image.png";
import heroDinnerImg from "@/assets/hero.jpg";
import masalaDoseImg from "@/assets/masala-dose.png";
import natureWalksImg from "@/assets/nature-walks.png";
import outdoorCookingImg from "@/assets/outdoor-cooking.png";
import {
  HOMEPAGE_CACHE_KEY,
  HOMEPAGE_HERO_HEADINGS_KEY,
  HOMEPAGE_HERO_KEY,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_JOURNEYS_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  HOMEPAGE_VERSION_KEY,
  normalizeHomepageContent as normalizeHomepageContentBase,
  parseVersionValue,
  takeNextHeroHeading,
  type HomepageContent,
  type HomepageHeroHeading,
  type HomepageHeroSlide,
  type HomepageJournalItem,
  type HomepageJourneySlide,
  type HomepageShowcaseItem,
  type ShowcaseIconKey,
} from "@/lib/homepage-content-keys";

export {
  HOMEPAGE_CACHE_KEY,
  HOMEPAGE_HERO_HEADINGS_KEY,
  HOMEPAGE_HERO_KEY,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_JOURNEYS_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  HOMEPAGE_VERSION_KEY,
  parseVersionValue,
  takeNextHeroHeading,
  type HomepageContent,
  type HomepageHeroHeading,
  type HomepageHeroSlide,
  type HomepageJournalItem,
  type HomepageJourneySlide,
  type HomepageShowcaseItem,
  type ShowcaseIconKey,
};

export function normalizeHomepageContent(raw: {
  showcase?: unknown;
  journal?: unknown;
  hero?: unknown;
  heroHeadings?: unknown;
  journeys?: unknown;
  version?: unknown;
}): HomepageContent {
  return normalizeHomepageContentBase(raw, {
    showcaseFallbacks: DEFAULT_HOMEPAGE_SHOWCASE,
    journalFallbacks: DEFAULT_HOMEPAGE_JOURNAL,
    heroFallbacks: DEFAULT_HOMEPAGE_HERO,
    heroHeadingsFallbacks: DEFAULT_HOMEPAGE_HERO_HEADINGS,
    journeysFallbacks: DEFAULT_HOMEPAGE_JOURNEYS,
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

export const DEFAULT_HOMEPAGE_HERO: HomepageHeroSlide[] = [
  {
    id: "hero-palace",
    imageUrl: heroPalaceImg,
    alt: "Mysuru Palace at golden hour through arched colonnade",
  },
  {
    id: "hero-dinner",
    imageUrl: heroDinnerImg,
    alt: "A candlelit private dinner under a glasshouse at dusk",
  },
  {
    id: "hero-dining",
    imageUrl: expDiningImg,
    alt: "A plated culinary course in dramatic light",
  },
  {
    id: "hero-craft",
    imageUrl: expCraftImg,
    alt: "Hands shaping clay on a pottery wheel",
  },
];

export const DEFAULT_HOMEPAGE_HERO_HEADINGS: HomepageHeroHeading[] = [
  {
    id: "heading-priority",
    eyebrow: "Curated Experiences",
    line1: "Experience",
    line2: "Mysuru,",
    line3: "Royally",
    body: "Step into the cultural heart of Karnataka. From heritage walks to culinary journeys, we craft experiences that connect you with the soul of Mysuru.",
  },
  {
    id: "heading-alt-1",
    eyebrow: "Royal Journeys",
    line1: "Discover",
    line2: "Mysuru,",
    line3: "Unhurried",
    body: "Walk palace corridors, taste heritage kitchens, and meet the craftspeople who keep Mysuru’s living traditions alive.",
  },
  {
    id: "heading-alt-2",
    eyebrow: "Immersive Stays",
    line1: "Live",
    line2: "Mysuru,",
    line3: "Like Royalty",
    body: "From sunset heritage walks to candlelit courtyards, every journey is curated for travellers who seek something rare.",
  },
];

export const DEFAULT_HOMEPAGE_JOURNEYS: HomepageJourneySlide[] = [
  {
    id: "palace",
    title: "The Majestic Palace",
    subtitle: "The Crown Jewel of Mysuru",
    lines: [
      "Breathe in the golden hour as sunlight crowns every dome.",
      "Birds arc above carved sandstone as the kingdom awakens.",
      "You have crossed the threshold — the palace welcomes its guest.",
    ],
    videoId: "9Mbxfupo6Tw",
    theme: "palace",
  },
  {
    id: "heritage",
    title: "The Heritage of the Kingdom",
    subtitle: "Stories Carved Through Time",
    lines: [
      "Ancient streets whisper of silk looms and sandalwood ateliers.",
      "Royal markets, vintage maps, and manuscripts preserve a living dynasty.",
      "Each lane is a chapter inked in gold upon the soul of Mysuru.",
    ],
    videoId: "imHm40ncWlA",
    theme: "manuscript",
  },
  {
    id: "dasara",
    title: "The Grand Dasara Celebration",
    subtitle: "The Festival of Royal Glory",
    lines: [
      "The palace ignites with a thousand lanterns at dusk.",
      "Processions, dancers, and decorated elephants honour the Wadiyar legacy.",
      "Witness the peak of royal grandeur beneath a canopy of gold.",
    ],
    videoId: "47MTWQ-sJvQ",
    theme: "dasara",
  },
];

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  showcase: DEFAULT_HOMEPAGE_SHOWCASE,
  journal: DEFAULT_HOMEPAGE_JOURNAL,
  hero: DEFAULT_HOMEPAGE_HERO,
  heroHeadings: DEFAULT_HOMEPAGE_HERO_HEADINGS,
  journeys: DEFAULT_HOMEPAGE_JOURNEYS,
  version: 0,
};
