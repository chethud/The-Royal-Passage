import craft from "@/assets/exp-craft.jpg";
import wellness from "@/assets/exp-wellness.jpg";
import dining from "@/assets/exp-dining.jpg";

export const HOMESTAY_PROPERTY_TYPES = [
  "Villa",
  "Resort",
  "Cottage",
  "Farm House",
  "Apartment",
  "Home Stay",
  "Guest House",
  "Luxury Stay",
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
    image: dining,
    galleryUrls: [dining, craft],
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
    slug: "coorg-cloud-cottage",
    title: "Coorg Cloud Cottage",
    tagline: "Mist, coffee estates, and slow mornings",
    description:
      "Elevated cottage surrounded by arabica estates. Floor-to-ceiling windows, fireplace evenings, and guided estate walks with your host family.",
    propertyType: "Cottage",
    city: "Coorg",
    region: "Karnataka",
    address: "Madikeri Hills, Coorg",
    pricePerNight: 6200,
    currencySymbol: "₹",
    rating: 4.9,
    reviewsCount: 41,
    image: wellness,
    galleryUrls: [wellness, craft],
    amenities: ["WiFi", "Kitchen", "Campfire", "Parking", "Breakfast", "Pet Friendly"],
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
    propertyType: "Guest House",
    city: "Mysuru",
    region: "Karnataka",
    address: "Saraswathipuram, Mysuru",
    pricePerNight: 3800,
    currencySymbol: "₹",
    rating: 4.7,
    reviewsCount: 29,
    image: craft,
    galleryUrls: [craft, dining],
    amenities: ["WiFi", "AC", "TV", "Security", "Breakfast", "Parking"],
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    checkInTime: "13:00",
    checkOutTime: "10:00",
  },
];
