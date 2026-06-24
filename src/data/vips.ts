import { HOMESTAY_IMG } from "@/lib/homestay-home-content";

export const VIP_PROPERTY_TYPES = [
  "Palace Suite",
  "Private Villa",
  "Royal Retreat",
  "Heritage Mansion",
  "Luxury Suite",
] as const;

export type VipPropertyType = (typeof VIP_PROPERTY_TYPES)[number];

export type VipAmenity =
  | "WiFi"
  | "Pool"
  | "Parking"
  | "Kitchen"
  | "AC"
  | "TV"
  | "Garden"
  | "Security"
  | "Breakfast"
  | "Butler"
  | "Spa"
  | "Private Chef";

export type VipRoom = {
  id: string;
  name: string;
  category?: string;
  capacity: number;
  pricePerNight: number;
  totalUnits: number;
  amenities?: string[];
};

export type VipStay = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  propertyType: VipPropertyType;
  city: string;
  region?: string;
  address: string;
  mapLink?: string;
  pricePerNight: number;
  currencySymbol?: string;
  rating: number;
  reviewsCount: number;
  image: string;
  galleryUrls?: string[];
  amenities: VipAmenity[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  houseRules?: string[];
  rooms?: VipRoom[];
  conciergeNote?: string;
};

export const vips: VipStay[] = [
  {
    id: "vip-001",
    slug: "maharaja-palace-suite",
    title: "Maharaja Palace Suite",
    tagline: "Private wing with palace views and dedicated concierge",
    description:
      "An exclusive suite within walking distance of Mysuru Palace. Marble interiors, private courtyard dining, and a Royal Passage concierge for every detail of your stay.",
    propertyType: "Palace Suite",
    city: "Mysuru",
    region: "Karnataka",
    address: "Palace Road, Mysuru",
    pricePerNight: 18500,
    currencySymbol: "₹",
    rating: 4.9,
    reviewsCount: 28,
    image: HOMESTAY_IMG.heritageExterior,
    galleryUrls: [HOMESTAY_IMG.heritageExterior, HOMESTAY_IMG.suiteInterior],
    amenities: ["WiFi", "Breakfast", "Butler", "Spa", "Parking", "AC"],
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    checkInTime: "15:00",
    checkOutTime: "12:00",
    houseRules: ["Adults preferred", "No events without approval"],
    conciergeNote: "Airport transfers and palace entry can be arranged on request.",
  },
  {
    id: "vip-002",
    slug: "chamundi-royal-villa",
    title: "Chamundi Royal Villa",
    tagline: "Hilltop villa with infinity pool and private chef",
    description:
      "A gated villa overlooking Chamundi Hills with panoramic views, heated pool, and in-villa dining by a private chef. Ideal for families and small groups seeking complete privacy.",
    propertyType: "Private Villa",
    city: "Mysuru",
    region: "Karnataka",
    address: "Chamundi Hills, Mysuru",
    pricePerNight: 32000,
    currencySymbol: "₹",
    rating: 5,
    reviewsCount: 14,
    image: HOMESTAY_IMG.villaExterior,
    galleryUrls: [HOMESTAY_IMG.villaExterior, HOMESTAY_IMG.suiteInterior],
    amenities: ["WiFi", "Pool", "Private Chef", "Garden", "Parking", "Security"],
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    conciergeNote: "Chef menus and wellness sessions available on request.",
  },
  {
    id: "vip-003",
    slug: "heritage-mansion-retreat",
    title: "Heritage Mansion Retreat",
    tagline: "Restored mansion with art collection and wine cellar",
    description:
      "A century-old mansion converted into an intimate VIP retreat. Curated art, heritage library, and a sommelier-curated cellar for evening tastings with your host.",
    propertyType: "Heritage Mansion",
    city: "Mysuru",
    region: "Karnataka",
    address: "Lakshmipuram, Mysuru",
    pricePerNight: 24000,
    currencySymbol: "₹",
    rating: 4.8,
    reviewsCount: 19,
    image: HOMESTAY_IMG.suiteInterior,
    galleryUrls: [HOMESTAY_IMG.suiteInterior, HOMESTAY_IMG.heritageExterior],
    amenities: ["WiFi", "Breakfast", "Butler", "Garden", "AC", "TV"],
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    checkInTime: "14:00",
    checkOutTime: "11:00",
  },
];
