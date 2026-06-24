import { HOMESTAY_IMG } from "@/lib/homestay-home-content";

export const VIP_PACKAGE_TYPES = [
  "Palace Experience",
  "Heritage Circuit",
  "Wellness Retreat",
  "Culinary Journey",
  "Private Celebration",
] as const;

export type VipPackageType = (typeof VIP_PACKAGE_TYPES)[number];

export type VipPackageDay = {
  day: number;
  title: string;
  detail: string;
};

export type VipPackage = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  packageType: VipPackageType;
  city: string;
  region?: string;
  priceFrom: number;
  currencySymbol?: string;
  durationDays: number;
  rating: number;
  reviewsCount: number;
  image: string;
  galleryUrls?: string[];
  highlights: string[];
  itinerary: VipPackageDay[];
  goodToKnow?: string[];
  maxGuests: number;
  conciergeNote?: string;
};

export const vips: VipPackage[] = [
  {
    id: "vip-001",
    slug: "maharaja-palace-experience",
    title: "Maharaja Palace Experience",
    tagline: "Private palace access, heritage lunch, and evening light & sound",
    description:
      "A two-day immersion in Mysuru's royal heart. Your Royal Passage concierge handles palace entry, a curated heritage lunch, and reserved seating for the evening light and sound show — with private transfers throughout.",
    packageType: "Palace Experience",
    city: "Mysuru",
    region: "Karnataka",
    priceFrom: 28500,
    currencySymbol: "₹",
    durationDays: 2,
    rating: 4.9,
    reviewsCount: 28,
    image: HOMESTAY_IMG.heritageExterior,
    galleryUrls: [HOMESTAY_IMG.heritageExterior, HOMESTAY_IMG.suiteInterior],
    highlights: [
      "Private palace guide and skip-the-line entry",
      "Heritage lunch at a royal-era venue",
      "Light & sound show with reserved seating",
      "Door-to-door transfers in Mysuru",
      "Dedicated Royal Passage concierge on call",
    ],
    itinerary: [
      {
        day: 1,
        title: "Palace & city arrival",
        detail:
          "Private pickup from your hotel or station. Guided tour of Mysuru Palace with reserved entry, followed by a heritage lunch. Afternoon at leisure or optional Devaraja Market walk with your concierge.",
      },
      {
        day: 2,
        title: "Royal evening",
        detail:
          "Late afternoon transfer to the palace grounds. Reserved seating for the light and sound show, then return transfer. Concierge confirms exact show timings with your group in advance.",
      },
    ],
    goodToKnow: [
      "Package price is per group (up to 4 guests) unless noted otherwise by concierge.",
      "Palace entry rules and camera policies apply on the day.",
      "Book at least 4 days before travel; Mysuru packages only.",
    ],
    maxGuests: 4,
    conciergeNote: "Dates and palace timings are confirmed with your concierge after enquiry.",
  },
  {
    id: "vip-002",
    slug: "chamundi-wellness-retreat",
    title: "Chamundi Wellness Retreat",
    tagline: "Hilltop spa day with private chef dinner and sunset views",
    description:
      "A full-day wellness package on Chamundi Hills: guided spa rituals, a chef-curated dinner with panoramic views, and a dedicated host for your group. Ideal for couples and small families seeking calm and privacy.",
    packageType: "Wellness Retreat",
    city: "Mysuru",
    region: "Karnataka",
    priceFrom: 42000,
    currencySymbol: "₹",
    durationDays: 1,
    rating: 5,
    reviewsCount: 14,
    image: HOMESTAY_IMG.villaExterior,
    galleryUrls: [HOMESTAY_IMG.villaExterior, HOMESTAY_IMG.suiteInterior],
    highlights: [
      "Private spa and wellness session",
      "Sunset dinner with in-house chef",
      "Chauffeured hill transfers",
      "Photography stop at Chamundi viewpoint",
      "Dietary preferences noted before your visit",
    ],
    itinerary: [
      {
        day: 1,
        title: "Hill wellness day",
        detail:
          "Morning pickup and scenic drive to Chamundi Hills. Private wellness session, light lunch, and time to enjoy the viewpoint. Chef-curated sunset dinner with hill views, then return transfer to Mysuru.",
      },
    ],
    goodToKnow: [
      "Share any wellness or dietary restrictions when you enquire.",
      "Comfortable clothing recommended for spa and hill weather.",
      "Book at least 4 days before travel; Mysuru packages only.",
    ],
    maxGuests: 8,
    conciergeNote: "Chef menus and add-on wellness sessions can be tailored on request.",
  },
  {
    id: "vip-003",
    slug: "heritage-craft-immersion",
    title: "Heritage & Craft Immersion",
    tagline: "Artisan workshops, mansion tastings, and curated city walks",
    description:
      "Three days of Mysuru's living heritage: private artisan workshops, a sommelier-led tasting in a restored mansion, and guided walks through Lakshmipuram and Devaraja Market — all orchestrated by your Royal Passage concierge.",
    packageType: "Heritage Circuit",
    city: "Mysuru",
    region: "Karnataka",
    priceFrom: 56000,
    currencySymbol: "₹",
    durationDays: 3,
    rating: 4.8,
    reviewsCount: 19,
    image: HOMESTAY_IMG.suiteInterior,
    galleryUrls: [HOMESTAY_IMG.suiteInterior, HOMESTAY_IMG.heritageExterior],
    highlights: [
      "Hands-on silk and sandalwood workshops",
      "Heritage mansion wine & spice tasting",
      "Private city walks with local historians",
      "All workshop materials included",
      "Transfers between venues each day",
    ],
    itinerary: [
      {
        day: 1,
        title: "Artisan Mysuru",
        detail:
          "Private silk weaving and sandalwood carving workshops with master artisans. Lunch at a heritage café. Return transfer with time to rest before evening.",
      },
      {
        day: 2,
        title: "Mansion & flavours",
        detail:
          "Guided walk through Lakshmipuram. Afternoon sommelier-led tasting in a restored mansion — spices, local wines, and paired bites. Concierge handles all venue access.",
      },
      {
        day: 3,
        title: "Market & memories",
        detail:
          "Early Devaraja Market tour with a local guide, flower and produce highlights, and farewell coffee. Optional add-ons available through your concierge.",
      },
    ],
    goodToKnow: [
      "Workshop venues may vary slightly by artisan availability.",
      "Walking shoes recommended for city and market segments.",
      "Book at least 4 days before travel; Mysuru packages only.",
    ],
    maxGuests: 6,
  },
];
