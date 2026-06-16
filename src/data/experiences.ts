import dining from "@/assets/exp-dining.jpg";
import sail from "@/assets/exp-sail.jpg";
import craft from "@/assets/exp-craft.jpg";
import wellness from "@/assets/exp-wellness.jpg";
import drive from "@/assets/exp-drive.jpg";
import tasting from "@/assets/exp-tasting.jpg";

export type Slot = {
  id: string;
  date: string; // ISO date
  start: string; // HH:mm
  end: string;
  capacity: number;
  available: number;
};

export type Experience = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Display label (static demo or DB category label) */
  category: string;
  city: string;
  citySlug?: string;
  address: string;
  mapLink?: string;
  durationHours: number;
  hostName: string;
  hostBio: string;
  verifiedHost: boolean;
  pricePerPerson: number;
  rating: number;
  reviewsCount: number;
  image: string;
  inclusions: string[];
  exclusions?: string[];
  requirements?: string[];
  galleryUrls?: string[];
  region?: string;
  cancellation: string;
  slots: Slot[];
  /** UI price prefix — demo uses €, Supabase listings use ₹ */
  currencySymbol?: string;
  minGuestsPerBooking?: number;
  maxGuestsPerBooking?: number;
};

const today = new Date();
const dayOffset = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const categories = ["Dining", "Voyage", "Craft", "Wellness", "Drive", "Tasting"] as const;
export const cities = ["Mysuru", "Bengaluru", "Coorg", "Chikmagalur", "Hampi", "Ooty"] as const;

export const experiences: Experience[] = [
  {
    id: "exp-001",
    slug: "candlelit-glasshouse-dinner",
    title: "Candlelit Glasshouse Dinner",
    tagline: "A seven-course tasting under a canopy of stars",
    description:
      "Chef Inês Rebelo composes a seasonal menu rooted in Portuguese terroir, served in a private glasshouse on the edge of the Sintra hills. Wine pairings curated by sommelier Tiago Andrade.",
    category: "Dining",
    city: "Lisbon",
    address: "Quinta da Penha, Sintra",
    durationHours: 3.5,
    hostName: "Inês Rebelo",
    hostBio: "Michelin-trained chef and forager, hosting intimate dinners since 2018.",
    verifiedHost: true,
    pricePerPerson: 285,
    rating: 4.9,
    reviewsCount: 142,
    image: dining,
    inclusions: ["Seven courses", "Wine pairing", "Welcome aperitif", "Private transfer"],
    cancellation: "Full refund up to 24 hours before. 50% refund within 24 hours.",
    slots: [
      { id: "s1", date: dayOffset(2), start: "19:30", end: "23:00", capacity: 12, available: 4 },
      { id: "s2", date: dayOffset(5), start: "19:30", end: "23:00", capacity: 12, available: 9 },
      { id: "s3", date: dayOffset(9), start: "19:30", end: "23:00", capacity: 12, available: 12 },
    ],
  },
  {
    id: "exp-002",
    slug: "private-sunset-sail",
    title: "Private Sunset Sail",
    tagline: "Two hours of stillness on a classic 42ft sloop",
    description:
      "Cast off from a quiet harbour and drift into open water as the light turns. Captain Henrik handles the lines; you handle a glass of something cold.",
    category: "Voyage",
    city: "Reykjavík",
    address: "Old Harbour, Pier 4",
    durationHours: 2,
    hostName: "Henrik Olsen",
    hostBio: "Licensed master with 18 years on North Atlantic waters.",
    verifiedHost: true,
    pricePerPerson: 180,
    rating: 4.8,
    reviewsCount: 86,
    image: sail,
    inclusions: ["Captain & crew", "Light canapés", "Sparkling wine", "Blankets"],
    cancellation: "Full refund up to 24 hours before. Weather cancellations always refunded.",
    slots: [
      { id: "s1", date: dayOffset(1), start: "18:00", end: "20:00", capacity: 6, available: 2 },
      { id: "s2", date: dayOffset(3), start: "18:00", end: "20:00", capacity: 6, available: 6 },
    ],
  },
  {
    id: "exp-003",
    slug: "wheel-and-clay-studio",
    title: "Wheel & Clay Studio",
    tagline: "A morning at the wheel with a third-generation potter",
    description:
      "Learn the foundations of throwing in a sun-lit studio. Take home two finished pieces, fired and glazed by the studio over the following weeks.",
    category: "Craft",
    city: "Kyoto",
    address: "Higashiyama Studio",
    durationHours: 3,
    hostName: "Aiko Tanaka",
    hostBio: "Inheritor of a 60-year studio tradition in eastern Kyoto.",
    verifiedHost: true,
    pricePerPerson: 140,
    rating: 4.95,
    reviewsCount: 211,
    image: craft,
    inclusions: ["All materials", "Two glazed pieces shipped home", "Matcha service"],
    cancellation: "Full refund up to 24 hours before.",
    slots: [
      { id: "s1", date: dayOffset(2), start: "09:30", end: "12:30", capacity: 6, available: 1 },
      { id: "s2", date: dayOffset(4), start: "09:30", end: "12:30", capacity: 6, available: 4 },
      { id: "s3", date: dayOffset(7), start: "14:00", end: "17:00", capacity: 6, available: 6 },
    ],
  },
  {
    id: "exp-004",
    slug: "hammam-and-stillness",
    title: "Hammam & Stillness",
    tagline: "A ninety-minute private bathing ritual",
    description:
      "A traditional black-soap hammam, eucalyptus steam, and a long rest in the relaxation room. Reserved entirely for your party.",
    category: "Wellness",
    city: "Marrakech",
    address: "Riad Yasmine, Medina",
    durationHours: 1.5,
    hostName: "Riad Yasmine",
    hostBio: "Family-run riad offering private wellness rituals since 2009.",
    verifiedHost: true,
    pricePerPerson: 110,
    rating: 4.85,
    reviewsCount: 318,
    image: wellness,
    inclusions: ["Private hammam", "Black-soap exfoliation", "Mint tea ceremony"],
    cancellation: "Full refund up to 24 hours before.",
    slots: [
      { id: "s1", date: dayOffset(1), start: "11:00", end: "12:30", capacity: 4, available: 4 },
      { id: "s2", date: dayOffset(2), start: "16:00", end: "17:30", capacity: 4, available: 0 },
    ],
  },
  {
    id: "exp-005",
    slug: "alpine-dawn-drive",
    title: "Alpine Dawn Drive",
    tagline: "Three hours through empty mountain passes in a vintage coupé",
    description:
      "Meet at first light. A restored 1971 coupé, a thermos of coffee, and a route mapped through the quietest passes of the Sawatch range.",
    category: "Drive",
    city: "Aspen",
    address: "Independence Pass trailhead",
    durationHours: 3,
    hostName: "Marco Viale",
    hostBio: "Vintage car curator and rally driver.",
    verifiedHost: false,
    pricePerPerson: 320,
    rating: 4.7,
    reviewsCount: 41,
    image: drive,
    inclusions: ["Vintage vehicle", "Driver & guide", "Breakfast hamper"],
    cancellation: "Full refund up to 24 hours before. Weather contingent.",
    slots: [
      { id: "s1", date: dayOffset(3), start: "05:30", end: "08:30", capacity: 2, available: 2 },
      { id: "s2", date: dayOffset(6), start: "05:30", end: "08:30", capacity: 2, available: 1 },
    ],
  },
  {
    id: "exp-006",
    slug: "library-cellar-tasting",
    title: "Library Cellar Tasting",
    tagline: "A flight of seven Tuscan reds in a private library",
    description:
      "An evening of wines drawn from the family cellar, narrated by the third-generation vintner. Held in the library of a 17th-century palazzo.",
    category: "Tasting",
    city: "Florence",
    address: "Palazzo Acciaioli, Oltrarno",
    durationHours: 2.5,
    hostName: "Giancarlo Acciaioli",
    hostBio: "Vintner and historian, fourth-generation winemaker.",
    verifiedHost: true,
    pricePerPerson: 220,
    rating: 4.92,
    reviewsCount: 97,
    image: tasting,
    inclusions: ["Seven wines", "Curated antipasti", "Private library"],
    cancellation: "Full refund up to 24 hours before.",
    slots: [
      { id: "s1", date: dayOffset(2), start: "20:00", end: "22:30", capacity: 8, available: 5 },
      { id: "s2", date: dayOffset(8), start: "20:00", end: "22:30", capacity: 8, available: 8 },
    ],
  },
];

export const getExperience = (slug: string) => experiences.find((e) => e.slug === slug);
