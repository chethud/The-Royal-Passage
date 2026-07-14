export const HOMEPAGE_SHOWCASE_KEY = "homepage_showcase";
export const HOMEPAGE_JOURNAL_KEY = "homepage_journal";
export const HOMEPAGE_HERO_KEY = "homepage_hero";
export const HOMEPAGE_HOMESTAY_HERO_KEY = "homepage_homestay_hero";
export const HOMEPAGE_HERO_HEADINGS_KEY = "homepage_hero_headings";
export const HOMEPAGE_JOURNEYS_KEY = "homepage_journeys";
export const HOMEPAGE_VERSION_KEY = "homepage_content_version";
export const HOMEPAGE_CACHE_KEY = "homepage-content-v1";
export const HERO_HEADING_ROTATION_KEY = "trp-hero-heading-rotation";
export const HERO_SLIDESHOW_PICK_KEY = "trp-hero-slideshow-pick";

export const HOMESTAY_HERO_SLIDE_COUNT = 5;

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

/** One of 3 hero slideshow packs — each holds 4 photos. */
export type HomepageHeroSlideshow = {
  id: string;
  slides: HomepageHeroSlide[];
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
  /** @deprecated Prefer heroSlideshows — kept as pack 0 slides for older callers. */
  hero: HomepageHeroSlide[];
  /** Three slideshow packs (4 photos each). Pack 0 = priority/constant; 1–2 randomize on visit. */
  heroSlideshows: HomepageHeroSlideshow[];
  /** Homestays landing hero slideshow photos. */
  homestayHero: HomepageHeroSlide[];
  heroHeadings: HomepageHeroHeading[];
  journeys: HomepageJourneySlide[];
  version: number;
};

export type HomepagePhotoSection = "showcase" | "journal" | "hero" | "homestayHero";

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

const FALLBACK_HERO_SLIDESHOWS: HomepageHeroSlideshow[] = [
  { id: "slideshow-priority", slides: FALLBACK_HERO.map((s) => ({ ...s, id: `p0-${s.id}` })) },
  { id: "slideshow-alt-1", slides: FALLBACK_HERO.map((s) => ({ ...s, id: `p1-${s.id}` })) },
  { id: "slideshow-alt-2", slides: FALLBACK_HERO.map((s) => ({ ...s, id: `p2-${s.id}` })) },
];

const FALLBACK_HOMESTAY_HERO: HomepageHeroSlide[] = [
  {
    id: "homestay-hero-1",
    imageUrl: "",
    alt: "Heritage homestay with courtyard and warm evening light",
  },
  {
    id: "homestay-hero-2",
    imageUrl: "",
    alt: "Villa with terraced gardens at the Chamundi foothills",
  },
  {
    id: "homestay-hero-3",
    imageUrl: "",
    alt: "Boutique guest house bedroom with premium linens",
  },
  {
    id: "homestay-hero-4",
    imageUrl: "",
    alt: "Cozy homestay bedroom with soft natural light",
  },
  {
    id: "homestay-hero-5",
    imageUrl: "",
    alt: "Elegant suite interior in a Mysuru guest house",
  },
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

function cloneSlidesWithPrefix(slides: HomepageHeroSlide[], prefix: string): HomepageHeroSlide[] {
  return slides.map((slide) => ({ ...slide, id: `${prefix}-${slide.id}` }));
}

function buildHeroSlideshowFallbacks(slideFallbacks: HomepageHeroSlide[]): HomepageHeroSlideshow[] {
  return [
    { id: "slideshow-priority", slides: cloneSlidesWithPrefix(slideFallbacks, "p0") },
    { id: "slideshow-alt-1", slides: cloneSlidesWithPrefix(slideFallbacks, "p1") },
    { id: "slideshow-alt-2", slides: cloneSlidesWithPrefix(slideFallbacks, "p2") },
  ];
}

function normalizeHeroSlideshow(
  raw: unknown,
  fallback: HomepageHeroSlideshow,
): HomepageHeroSlideshow {
  if (!raw || typeof raw !== "object") return fallback;
  const item = raw as Partial<HomepageHeroSlideshow>;
  const slidesRaw = Array.isArray(item.slides) ? item.slides : null;
  return {
    id: typeof item.id === "string" && item.id.trim() ? item.id : fallback.id,
    slides: fallback.slides.map((slideFallback, index) =>
      normalizeHeroSlide(slidesRaw?.[index], slideFallback),
    ),
  };
}

/** Accepts either 3 packs `{ slides }` or legacy flat 4-slide hero array. */
function normalizeHeroSlideshows(
  raw: unknown,
  slideFallbacks: HomepageHeroSlide[],
  packFallbacksOverride?: HomepageHeroSlideshow[],
): HomepageHeroSlideshow[] {
  const packFallbacks =
    packFallbacksOverride && packFallbacksOverride.length >= 3
      ? packFallbacksOverride.slice(0, 3)
      : buildHeroSlideshowFallbacks(slideFallbacks);
  if (!Array.isArray(raw) || raw.length === 0) return packFallbacks;

  const first = raw[0];
  const isPackFormat =
    first &&
    typeof first === "object" &&
    Array.isArray((first as { slides?: unknown }).slides);

  if (isPackFormat) {
    return packFallbacks.map((fallback, index) => normalizeHeroSlideshow(raw[index], fallback));
  }

  // Legacy flat slides — seed every pack with those 4 photos so alts can diverge later.
  const seeded = slideFallbacks.map((fallback, index) => normalizeHeroSlide(raw[index], fallback));
  return packFallbacks.map((fallback, packIndex) => ({
    id: fallback.id,
    slides: cloneSlidesWithPrefix(seeded, `p${packIndex}`),
  }));
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
    heroSlideshows?: unknown;
    homestayHero?: unknown;
    heroHeadings?: unknown;
    journeys?: unknown;
    version?: unknown;
  },
  options?: {
    showcaseFallbacks?: HomepageShowcaseItem[];
    journalFallbacks?: HomepageJournalItem[];
    heroFallbacks?: HomepageHeroSlide[];
    heroSlideshowsFallbacks?: HomepageHeroSlideshow[];
    homestayHeroFallbacks?: HomepageHeroSlide[];
    heroHeadingsFallbacks?: HomepageHeroHeading[];
    journeysFallbacks?: HomepageJourneySlide[];
  },
): HomepageContent {
  const showcaseFallbacks = options?.showcaseFallbacks ?? FALLBACK_SHOWCASE;
  const journalFallbacks = options?.journalFallbacks ?? FALLBACK_JOURNAL;
  const heroFallbacks = options?.heroFallbacks ?? FALLBACK_HERO;
  const heroSlideshowsFallbacks =
    options?.heroSlideshowsFallbacks ?? buildHeroSlideshowFallbacks(heroFallbacks);
  const homestayHeroFallbacks = options?.homestayHeroFallbacks ?? FALLBACK_HOMESTAY_HERO;
  const heroHeadingsFallbacks = options?.heroHeadingsFallbacks ?? FALLBACK_HERO_HEADINGS;
  const journeysFallbacks = options?.journeysFallbacks ?? FALLBACK_JOURNEYS;
  const showcaseRaw = Array.isArray(raw.showcase) ? raw.showcase : null;
  const journalRaw = Array.isArray(raw.journal) ? raw.journal : null;
  const heroSource =
    Array.isArray(raw.heroSlideshows) && raw.heroSlideshows.length > 0
      ? raw.heroSlideshows
      : raw.hero;
  const homestayHeroRaw = Array.isArray(raw.homestayHero) ? raw.homestayHero : null;
  const heroHeadingsRaw = Array.isArray(raw.heroHeadings) ? raw.heroHeadings : null;
  const journeysRaw = Array.isArray(raw.journeys) ? raw.journeys : null;

  const heroSlideshows = normalizeHeroSlideshows(
    heroSource,
    options?.heroSlideshowsFallbacks?.[0]?.slides ?? heroFallbacks,
    heroSlideshowsFallbacks,
  );

  return {
    showcase: showcaseFallbacks.map((fallback, index) =>
      normalizeShowcaseItem(showcaseRaw?.[index], fallback),
    ),
    journal: journalFallbacks.map((fallback, index) =>
      normalizeJournalItem(journalRaw?.[index], fallback),
    ),
    heroSlideshows,
    hero: heroSlideshows[0]?.slides ?? heroFallbacks,
    homestayHero: homestayHeroFallbacks.map((fallback, index) =>
      normalizeHeroSlide(homestayHeroRaw?.[index], fallback),
    ),
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

/**
 * Homepage hero photos: pack 0 is priority/constant (fallback + live editor).
 * On each visit, randomly choose pack 1 or pack 2 so the homepage photos change.
 */
let lastHeroSlideshowPickAt = 0;
let lastHeroSlideshowPackIndex = 1;

export function takeHeroSlideshow(
  slideshows: HomepageHeroSlideshow[],
  options?: { rotate?: boolean },
): HomepageHeroSlideshow {
  const packs =
    slideshows.length >= 3 ? slideshows : FALLBACK_HERO_SLIDESHOWS;
  if (options?.rotate === false || typeof window === "undefined") {
    return packs[0]!;
  }

  const now = Date.now();
  if (now - lastHeroSlideshowPickAt <= 800) {
    return packs[lastHeroSlideshowPackIndex] ?? packs[0]!;
  }
  lastHeroSlideshowPickAt = now;

  try {
    const pick = Math.random() < 0.5 ? 1 : 2;
    lastHeroSlideshowPackIndex = pick;
    window.localStorage.setItem(HERO_SLIDESHOW_PICK_KEY, String(pick));
    return packs[pick] ?? packs[0]!;
  } catch {
    return packs[0]!;
  }
}

/** Flat photo index 0–11 → pack / slide for the 3×4 hero CMS. */
export function heroPhotoFlatIndex(packIndex: number, slideIndex: number): number {
  return packIndex * 4 + slideIndex;
}

export function heroPhotoCoords(flatIndex: number): { packIndex: number; slideIndex: number } {
  return {
    packIndex: Math.floor(flatIndex / 4),
    slideIndex: flatIndex % 4,
  };
}
