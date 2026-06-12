export const HOMEPAGE_SHOWCASE_KEY = "homepage_showcase";
export const HOMEPAGE_JOURNAL_KEY = "homepage_journal";
export const HOMEPAGE_VERSION_KEY = "homepage_content_version";
export const HOMEPAGE_CACHE_KEY = "homepage-content-v1";

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

export type HomepageContent = {
  showcase: HomepageShowcaseItem[];
  journal: HomepageJournalItem[];
  version: number;
};

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
    version?: unknown;
  },
  options?: {
    showcaseFallbacks?: HomepageShowcaseItem[];
    journalFallbacks?: HomepageJournalItem[];
  },
): HomepageContent {
  const showcaseFallbacks = options?.showcaseFallbacks ?? FALLBACK_SHOWCASE;
  const journalFallbacks = options?.journalFallbacks ?? FALLBACK_JOURNAL;
  const showcaseRaw = Array.isArray(raw.showcase) ? raw.showcase : null;
  const journalRaw = Array.isArray(raw.journal) ? raw.journal : null;

  return {
    showcase: showcaseFallbacks.map((fallback, index) =>
      normalizeShowcaseItem(showcaseRaw?.[index], fallback),
    ),
    journal: journalFallbacks.map((fallback, index) =>
      normalizeJournalItem(journalRaw?.[index], fallback),
    ),
    version: parseVersionValue(raw.version),
  };
}
