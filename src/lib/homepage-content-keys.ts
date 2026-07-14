export const HOMEPAGE_SHOWCASE_KEY = "homepage_showcase";
export const HOMEPAGE_JOURNAL_KEY = "homepage_journal";
export const HOMEPAGE_HERO_KEY = "homepage_hero";
export const HOMEPAGE_HERO_HEADINGS_KEY = "homepage_hero_headings";
export const HOMEPAGE_JOURNEYS_KEY = "homepage_journeys";
export const HOMEPAGE_VERSION_KEY = "homepage_content_version";
export const HOMEPAGE_CACHE_KEY = "homepage-content-v1";
export const HERO_HEADING_ROTATION_KEY = "trp-hero-heading-rotation";

export type ShowcaseIconKey = "pottery" | "flame" | "heritage";

export type HomepageShowcaseItem = {
  id: string;
  iconKey: ShowcaseIconKey;
  title: string;
  imageUrl: string;
  alt: string;
  href: string;
};

export type HomepageJournalItem = {
  id: string;
  imageUrl: string;
  alt: string;
  title: string;
  excerpt: string;
};

export type HomepageHeroSlide = {
  id: string;
  imageUrl: string;
  alt: string;
};

/** Homepage hero copy variants — index 0 is priority; all three rotate on refresh/login. */
export type HomepageHeroHeading = {
  id: string;
  eyebrow: string;
  line1: string;
  /** Accent line (ember). */
  line2: string;
  line3: string;
  body: string;
};

export type JourneySlideTheme = "palace" | "manuscript" | "dasara";

export type HomepageJourneySlide = {
  id: string;
  title: string;
  subtitle: string;
  lines: string[];
  videoId: string;
  theme: JourneySlideTheme;
};

export type HomepageContent = {
  showcase: HomepageShowcaseItem[];
  journal: HomepageJournalItem[];
  hero: HomepageHeroSlide[];
  heroHeadings: HomepageHeroHeading[];
  journeys: HomepageJourneySlide[];
  version: number;
};

export type HomepagePhotoSection = "showcase" | "journal" | "hero";

const FALLBACK_SHOWCASE: HomepageShowcaseItem[] = [
  {
    id: "showcase-pottery",
    iconKey: "pottery",
    title: "Pottery Experience",
    imageUrl: "",
    alt: "Hands shaping clay on a pottery wheel",
    href: "/experiences?category=Craft",
  },
  {
    id: "showcase-cooking",
    iconKey: "flame",
    title: "Outdoor Cooking",
    imageUrl: "",
    alt: "Open fire cooking in the wild under warm light",
    href: "/experiences?category=Tasting",
  },
  {
    id: "showcase-heritage",
    iconKey: "heritage",
    title: "Heritage Walks",
    imageUrl: "",
    alt: "Mysuru palace at golden hour",
    href: "/experiences",
  },
];

const FALLBACK_JOURNAL: HomepageJournalItem[] = [
  {
    id: "journal-walk",
    imageUrl: "",
    alt: "Mysuru Palace illuminated at sunset",
    title: "A Walk Through Time",
    excerpt: "Heritage walks in Mysuru are like stepping into a royal era.",
  },
  {
    id: "journal-flavours",
    imageUrl: "",
    alt: "A crisp masala dose served with chutneys",
    title: "Flavours of Mysuru",
    excerpt: "Explore the culinary legacy of the Wadiyars.",
  },
  {
    id: "journal-nature",
    imageUrl: "",
    alt: "A nature trail winding through the green hills near Mysuru",
    title: "Nature's Escape",
    excerpt: "Unwind in the serene trails around Mysuru.",
  },
];

const FALLBACK_HERO: HomepageHeroSlide[] = [
  { id: "hero-palace", imageUrl: "", alt: "Mysuru Palace at golden hour through arched colonnade" },
  { id: "hero-dinner", imageUrl: "", alt: "A candlelit private dinner under a glasshouse at dusk" },
  { id: "hero-dining", imageUrl: "", alt: "A plated culinary course in dramatic light" },
  { id: "hero-craft", imageUrl: "", alt: "Hands shaping clay on a pottery wheel" },
];

const FALLBACK_HERO_HEADINGS: HomepageHeroHeading[] = [
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

const FALLBACK_JOURNEYS: HomepageJourneySlide[] = [
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

function isShowcaseIconKey(value: unknown): value is ShowcaseIconKey {
  return value === "pottery" || value === "flame" || value === "heritage";
}

function normalizeShowcaseItem(raw: unknown, fallback: HomepageShowcaseItem): HomepageShowcaseItem {
  if (!raw || typeof raw !== "object") return fallback;
  const item = raw as Partial<HomepageShowcaseItem>;
  return {
    id: typeof item.id === "string" && item.id.trim() ? item.id : fallback.id,
    iconKey: isShowcaseIconKey(item.iconKey) ? item.iconKey : fallback.iconKey,
    title: typeof item.title === "string" && item.title.trim() ? item.title : fallback.title,
    imageUrl:
      typeof item.imageUrl === "string" && item.imageUrl.trim() ? item.imageUrl : fallback.imageUrl,
    alt: typeof item.alt === "string" && item.alt.trim() ? item.alt : fallback.alt,
    href: typeof item.href === "string" && item.href.trim() ? item.href : fallback.href,
  };
}

function normalizeJournalItem(raw: unknown, fallback: HomepageJournalItem): HomepageJournalItem {
  if (!raw || typeof raw !== "object") return fallback;
  const item = raw as Partial<HomepageJournalItem>;
  return {
    id: typeof item.id === "string" && item.id.trim() ? item.id : fallback.id,
    imageUrl:
      typeof item.imageUrl === "string" && item.imageUrl.trim() ? item.imageUrl : fallback.imageUrl,
    alt: typeof item.alt === "string" && item.alt.trim() ? item.alt : fallback.alt,
    title: typeof item.title === "string" && item.title.trim() ? item.title : fallback.title,
    excerpt: typeof item.excerpt === "string" && item.excerpt.trim() ? item.excerpt : fallback.excerpt,
  };
}

function isJourneyTheme(value: unknown): value is JourneySlideTheme {
  return value === "palace" || value === "manuscript" || value === "dasara";
}

function normalizeHeroSlide(raw: unknown, fallback: HomepageHeroSlide): HomepageHeroSlide {
  if (!raw || typeof raw !== "object") return fallback;
  const item = raw as Partial<HomepageHeroSlide>;
  return {
    id: typeof item.id === "string" && item.id.trim() ? item.id : fallback.id,
    imageUrl:
      typeof item.imageUrl === "string" && item.imageUrl.trim() ? item.imageUrl : fallback.imageUrl,
    alt: typeof item.alt === "string" && item.alt.trim() ? item.alt : fallback.alt,
  };
}

function normalizeHeroHeading(raw: unknown, fallback: HomepageHeroHeading): HomepageHeroHeading {
  if (!raw || typeof raw !== "object") return fallback;
  const item = raw as Partial<HomepageHeroHeading>;
  return {
    id: typeof item.id === "string" && item.id.trim() ? item.id : fallback.id,
    eyebrow: typeof item.eyebrow === "string" && item.eyebrow.trim() ? item.eyebrow : fallback.eyebrow,
    line1: typeof item.line1 === "string" && item.line1.trim() ? item.line1 : fallback.line1,
    line2: typeof item.line2 === "string" && item.line2.trim() ? item.line2 : fallback.line2,
    line3: typeof item.line3 === "string" && item.line3.trim() ? item.line3 : fallback.line3,
    body: typeof item.body === "string" && item.body.trim() ? item.body : fallback.body,
  };
}

function normalizeJourneySlide(raw: unknown, fallback: HomepageJourneySlide): HomepageJourneySlide {
  if (!raw || typeof raw !== "object") return fallback;
  const item = raw as Partial<HomepageJourneySlide>;
  const lines = Array.isArray(item.lines)
    ? item.lines.filter((line): line is string => typeof line === "string" && line.trim().length > 0)
    : fallback.lines;
  return {
    id: typeof item.id === "string" && item.id.trim() ? item.id : fallback.id,
    title: typeof item.title === "string" && item.title.trim() ? item.title : fallback.title,
    subtitle: typeof item.subtitle === "string" && item.subtitle.trim() ? item.subtitle : fallback.subtitle,
    lines: lines.length > 0 ? lines : fallback.lines,
    videoId: typeof item.videoId === "string" && item.videoId.trim() ? item.videoId : fallback.videoId,
    theme: isJourneyTheme(item.theme) ? item.theme : fallback.theme,
  };
}

export function parseVersionValue(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  if (raw && typeof raw === "object" && "updatedAt" in raw) {
    const updatedAt = (raw as { updatedAt?: unknown }).updatedAt;
    if (typeof updatedAt === "number" && Number.isFinite(updatedAt) && updatedAt > 0) {
      return Math.floor(updatedAt);
    }
  }
  if (typeof raw === "string" && raw.trim()) {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return parseVersionValue(JSON.parse(trimmed));
      } catch {
        return 0;
      }
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  }
  return 0;
}

export function normalizeHomepageContent(
  raw: {
    showcase?: unknown;
    journal?: unknown;
    hero?: unknown;
    heroHeadings?: unknown;
    journeys?: unknown;
    version?: unknown;
  },
  options?: {
    showcaseFallbacks?: HomepageShowcaseItem[];
    journalFallbacks?: HomepageJournalItem[];
    heroFallbacks?: HomepageHeroSlide[];
    heroHeadingsFallbacks?: HomepageHeroHeading[];
    journeysFallbacks?: HomepageJourneySlide[];
  },
): HomepageContent {
  const showcaseFallbacks = options?.showcaseFallbacks ?? FALLBACK_SHOWCASE;
  const journalFallbacks = options?.journalFallbacks ?? FALLBACK_JOURNAL;
  const heroFallbacks = options?.heroFallbacks ?? FALLBACK_HERO;
  const heroHeadingsFallbacks = options?.heroHeadingsFallbacks ?? FALLBACK_HERO_HEADINGS;
  const journeysFallbacks = options?.journeysFallbacks ?? FALLBACK_JOURNEYS;
  const showcaseRaw = Array.isArray(raw.showcase) ? raw.showcase : null;
  const journalRaw = Array.isArray(raw.journal) ? raw.journal : null;
  const heroRaw = Array.isArray(raw.hero) ? raw.hero : null;
  const heroHeadingsRaw = Array.isArray(raw.heroHeadings) ? raw.heroHeadings : null;
  const journeysRaw = Array.isArray(raw.journeys) ? raw.journeys : null;

  return {
    showcase: showcaseFallbacks.map((fallback, index) =>
      normalizeShowcaseItem(showcaseRaw?.[index], fallback),
    ),
    journal: journalFallbacks.map((fallback, index) =>
      normalizeJournalItem(journalRaw?.[index], fallback),
    ),
    hero: heroFallbacks.map((fallback, index) => normalizeHeroSlide(heroRaw?.[index], fallback)),
    heroHeadings: heroHeadingsFallbacks.map((fallback, index) =>
      normalizeHeroHeading(heroHeadingsRaw?.[index], fallback),
    ),
    journeys: journeysFallbacks.map((fallback, index) =>
      normalizeJourneySlide(journeysRaw?.[index], fallback),
    ),
    version: parseVersionValue(raw.version),
  };
}

/**
 * Advance through the 3 headings on each homepage load (refresh / new visit).
 * Index 0 is the priority heading and leads the rotation cycle.
 * Debounced so React Strict Mode remounts do not skip a heading.
 */
let lastHeroHeadingRotateAt = 0;

export function takeNextHeroHeading(
  headings: HomepageHeroHeading[],
  options?: { rotate?: boolean },
): HomepageHeroHeading {
  const list = headings.length > 0 ? headings : FALLBACK_HERO_HEADINGS;
  if (options?.rotate === false || typeof window === "undefined") {
    return list[0]!;
  }

  try {
    const raw = window.localStorage.getItem(HERO_HEADING_ROTATION_KEY);
    const stored = raw ? Number.parseInt(raw, 10) : 0;
    const current = Number.isFinite(stored) ? ((stored % list.length) + list.length) % list.length : 0;
    const now = Date.now();
    if (now - lastHeroHeadingRotateAt > 800) {
      lastHeroHeadingRotateAt = now;
      const next = (current + 1) % list.length;
      window.localStorage.setItem(HERO_HEADING_ROTATION_KEY, String(next));
      return list[current]!;
    }
    return list[current]!;
  } catch {
    return list[0]!;
  }
}
