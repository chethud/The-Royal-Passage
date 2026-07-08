import { HOMESTAY_IMG } from "@/lib/homestay-home-content";

export const HOMESTAY_PROPERTY_TYPES = [
  "Home Stay",
  "Resort",
  "Hotel",
] as const;

export type HomestayPropertyType = (typeof HOMESTAY_PROPERTY_TYPES)[number];

export type HomestayAmenity =
  | "WiFi"
  | "Pool"
  | "Parking"
  | "Kitchen"
  | "AC"
  | "TV"
  | "Garden"
  | "Security"
  | "Breakfast"
  | "Pet Friendly"
  | "Campfire";

export type HomestayRoom = {
  id: string;
  name: string;
  category?: string;
  capacity: number;
  pricePerNight: number;
  weekendPricePerNight?: number;
  totalUnits: number;
  amenities?: string[];
  extraBedAvailable: boolean;
  extraBedPricePerNight: number;
  extraBedWeekendPricePerNight?: number;
  extraBedsPerRoom?: number;
};

export type HomestayDatePrice = {
  date: string;
  pricePerNight: number;
  label?: string;
  extraBedPricePerNight?: number;
};

export type Homestay = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  propertyType: HomestayPropertyType;
  city: string;
  region?: string;
  address: string;
  mapLink?: string;
  pricePerNight: number;
  weekendPricePerNight?: number;
  currencySymbol?: string;
  rating: number;
  reviewsCount: number;
  image: string;
  galleryUrls?: string[];
  amenities: HomestayAmenity[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  houseRules?: string[];
  rooms?: HomestayRoom[];
  extraBedAvailable?: boolean;
  extraBedPricePerNight?: number;
  extraBedWeekendPricePerNight?: number;
  extraBedsPerRoom?: number;
  datePrices?: HomestayDatePrice[];
};

export const homestays: Homestay[] = [
  {
    id: "stay-001",
    slug: "heritage-haveli-mysuru",
    title: "Heritage Haveli Mysuru",
    tagline: "Wake to palace views and courtyard chai",
    description:
      "A restored century-old haveli steps from Mysuru Palace. Hand-carved pillars, private courtyard, and hosts who share family recipes and royal history.",
    propertyType: "Home Stay",
    city: "Mysuru",
    region: "Karnataka",
    address: "Near Devaraja Market, Mysuru",
    pricePerNight: 4500,
    currencySymbol: "₹",
    rating: 4.8,
    reviewsCount: 56,
    image: HOMESTAY_IMG.heritageExterior,
    galleryUrls: [HOMESTAY_IMG.heritageExterior, HOMESTAY_IMG.suiteInterior],
    amenities: ["WiFi", "Breakfast", "Garden", "Parking", "AC"],
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    houseRules: ["No smoking indoors", "Quiet hours after 10 PM"],
  },
  {
    id: "stay-002",
    slug: "chamundi-hills-villa",
    title: "Chamundi Hills Villa",
    tagline: "Palace views, gardens, and quiet mornings",
    description:
      "A serene villa at the Chamundi foothills with terraced gardens, glimpses of the palace skyline, and hosts who know every corner of Mysuru.",
    propertyType: "Resort",
    city: "Mysuru",
    region: "Karnataka",
    address: "Chamundi Hill Road, Mysuru",
    pricePerNight: 6200,
    currencySymbol: "₹",
    rating: 4.9,
    reviewsCount: 41,
    image: HOMESTAY_IMG.villaExterior,
    galleryUrls: [HOMESTAY_IMG.villaExterior, HOMESTAY_IMG.bedroom],
    amenities: ["WiFi", "Kitchen", "Garden", "Parking", "Breakfast", "AC"],
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    checkInTime: "15:00",
    checkOutTime: "11:00",
  },
  {
    id: "stay-003",
    slug: "royal-passage-guest-house",
    title: "Royal Passage Guest House",
    tagline: "Boutique rooms curated for discerning travellers",
    description:
      "A small guest house with Royal Passage hospitality standards — premium linens, local art, and concierge support for experiences and dining.",
    propertyType: "Hotel",
    city: "Mysuru",
    region: "Karnataka",
    address: "Saraswathipuram, Mysuru",
    pricePerNight: 3800,
    currencySymbol: "₹",
    rating: 4.7,
    reviewsCount: 29,
    image: HOMESTAY_IMG.guestHouseRoom,
    galleryUrls: [HOMESTAY_IMG.guestHouseRoom, HOMESTAY_IMG.boutiqueRoom],
    amenities: ["WiFi", "AC", "TV", "Security", "Breakfast", "Parking"],
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    checkInTime: "13:00",
    checkOutTime: "10:00",
  },
];
