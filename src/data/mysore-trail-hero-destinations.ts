/** Cinematic opening destinations for the Mysore Trail hero */

import { TRAIL_PLACES } from "@/data/mysore-trail-journey";

function itineraryPhoto(placeId: string) {
  const place = TRAIL_PLACES[placeId];
  return {
    image: place?.image ?? "",
    imageAlt: place?.imageAlt ?? "",
  };
}

export type HeroDestination = {
  id: string;
  name: string;
  /** Short lines for the large title (1–3) */
  titleLines: string[];
  /** Compact label on preview cards (1–2 lines) */
  cardLines: string[];
  location: string;
  eyebrow: string;
  description: string;
  image: string;
  imageAlt: string;
  category: string;
  /** Optional place id for deep-linking into the itinerary */
  placeId?: string;
};

export const HERO_DESTINATIONS: HeroDestination[] = [
  {
    id: "mysuru-palace",
    placeId: "mysuru-palace",
    name: "Mysuru Palace",
    titleLines: ["Mysuru", "Palace"],
    cardLines: ["Mysuru", "Palace"],
    location: "Mysuru, Karnataka",
    eyebrow: "Royal Heritage",
    description:
      "Step into the heart of Mysuru's royal heritage, where grand architecture, living traditions and centuries of stories meet.",
    ...itineraryPhoto("mysuru-palace"),
    category: "Royal",
  },
  {
    id: "chamundi-hill",
    placeId: "chamundi-hill",
    name: "Chamundi Hill",
    titleLines: ["Chamundi", "Hill"],
    cardLines: ["Chamundi", "Hill"],
    location: "Mysuru, Karnataka",
    eyebrow: "Spiritual & Scenic",
    description:
      "Rise above the city to temple bells, stone steps and the first panoramic view of Mysuru's palace skyline.",
    ...itineraryPhoto("chamundi-hill"),
    category: "Nature",
  },
  {
    id: "devaraja-market",
    placeId: "devaraja-market",
    name: "Devaraja Market",
    titleLines: ["Devaraja", "Market"],
    cardLines: ["Devaraja", "Market"],
    location: "Mysuru, Karnataka",
    eyebrow: "Local Life",
    description:
      "From palace stone to marigold and spice — Mysuru's living bazaar of flowers, incense, fruit and sandalwood.",
    ...itineraryPhoto("devaraja-market"),
    category: "Culture",
  },
  {
    id: "jaganmohan-palace",
    placeId: "jaganmohan-palace",
    name: "Jaganmohan Palace",
    titleLines: ["Jaganmohan", "Palace"],
    cardLines: ["Jaganmohan", "Palace"],
    location: "Mysuru, Karnataka",
    eyebrow: "Art & Heritage",
    description:
      "A quieter royal house turned gallery — Mysuru paintings, Indian art, and palace rooms that reward slow looking.",
    ...itineraryPhoto("jaganmohan-palace"),
    category: "Heritage",
  },
  {
    id: "st-philomena",
    placeId: "st-philomena",
    name: "St. Philomena's Cathedral",
    titleLines: ["St. Philomena's", "Cathedral"],
    cardLines: ["St. Philomena", "Cathedral"],
    location: "Mysuru, Karnataka",
    eyebrow: "Sacred Architecture",
    description:
      "Neo-Gothic twin towers rise over Mysuru — stained glass, quiet aisles, and a skyline beyond palace domes.",
    ...itineraryPhoto("st-philomena"),
    category: "Architecture",
  },
  {
    id: "lalitha-mahal",
    placeId: "lalitha-mahal",
    name: "Lalitha Mahal Palace",
    titleLines: ["Lalitha Mahal", "Palace"],
    cardLines: ["Lalitha", "Mahal"],
    location: "Mysuru, Karnataka",
    eyebrow: "Regal Atmosphere",
    description:
      "White neoclassical grandeur on the edge of the city — a royal guest palace that still feels cinematic.",
    ...itineraryPhoto("lalitha-mahal"),
    category: "Royal",
  },
  {
    id: "karanji-lake",
    placeId: "karanji-lake",
    name: "Karanji Lake",
    titleLines: ["Karanji", "Lake"],
    cardLines: ["Karanji", "Lake"],
    location: "Mysuru, Karnataka",
    eyebrow: "Nature & Calm",
    description:
      "Still water, birds and green edges — a quieter Mysuru morning beside the walkway and gardens.",
    ...itineraryPhoto("karanji-lake"),
    category: "Nature",
  },
  {
    id: "brindavan-gardens",
    placeId: "brindavan-gardens",
    name: "Brindavan Gardens",
    titleLines: ["Brindavan", "Gardens"],
    cardLines: ["Brindavan", "Gardens"],
    location: "Near Mysuru",
    eyebrow: "Evening Spectacle",
    description:
      "Terraced gardens below the Krishnarajasagara dam — musical fountains and evening light.",
    ...itineraryPhoto("brindavan-gardens"),
    category: "Culture",
  },
  {
    id: "kukkarahalli-lake",
    placeId: "kukkarahalli-lake",
    name: "Kukkarahalli Lake",
    titleLines: ["Kukkarahalli", "Lake"],
    cardLines: ["Kukkarahalli", "Lake"],
    location: "Mysuru, Karnataka",
    eyebrow: "Sunset Walk",
    description:
      "A beloved walking lake — birds, circular paths, and Mysuru's evening breath.",
    ...itineraryPhoto("kukkarahalli-lake"),
    category: "Nature",
  },
  {
    id: "srirangapatna",
    placeId: "srirangapatna",
    name: "Srirangapatna",
    titleLines: ["Srirangapatna"],
    cardLines: ["Sriranga", "patna"],
    location: "Near Mysuru",
    eyebrow: "Historic Island",
    description:
      "A river island of Tipu Sultan's era — temples, Gumbaz, and layered fort history beyond the palace city.",
    ...itineraryPhoto("srirangapatna"),
    category: "History",
  },
];
