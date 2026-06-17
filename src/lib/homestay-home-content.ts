import craft from "@/assets/exp-craft.jpg";
import wellness from "@/assets/exp-wellness.jpg";
import dining from "@/assets/exp-dining.jpg";
import heroImage from "@/assets/curated-expeditions.png";
import heroDinnerImg from "@/assets/hero.jpg";

export type HomestayHeroSlide = {
  src: string;
  alt: string;
};

export const HOMESTAY_HERO_SLIDES: HomestayHeroSlide[] = [
  {
    src: heroImage,
    alt: "Royal homestays in Mysuru",
  },
  {
    src: dining,
    alt: "Heritage haveli courtyard with warm evening light",
  },
  {
    src: wellness,
    alt: "Hill cottage surrounded by green estates",
  },
  {
    src: heroDinnerImg,
    alt: "A candlelit stay under a glasshouse at dusk",
  },
  {
    src: craft,
    alt: "Boutique guest house room with local art",
  },
];

export type HomestayHighlightSlide = {
  id: string;
  title: string;
  subtitle: string;
  lines: string[];
  image: string;
  imageAlt: string;
  theme: "heritage" | "retreat" | "boutique";
};

export const HOMESTAY_HIGHLIGHT_SLIDES: HomestayHighlightSlide[] = [
  {
    id: "heritage-haveli",
    title: "Heritage Havelis",
    subtitle: "Sleep Where History Lives",
    lines: [
      "Restored courtyards, carved pillars, and palace views just minutes away.",
      "Hosts share family recipes, royal stories, and the rhythm of old Mysuru.",
      "Wake to chai on the veranda as the city stirs below.",
    ],
    image: dining,
    imageAlt: "Heritage haveli courtyard with warm evening light",
    theme: "heritage",
  },
  {
    id: "palace-quarter",
    title: "Palace Quarter Stays",
    subtitle: "Steps from Royal Mysuru",
    lines: [
      "Villas and guest houses within minutes of Mysuru Palace and Devaraja Market.",
      "Terraced gardens, palace glimpses, and hosts who share the rhythm of the old city.",
      "Wake to chai on the veranda as temple bells and market sounds drift in.",
    ],
    image: wellness,
    imageAlt: "Villa with garden views near Mysuru Palace",
    theme: "retreat",
  },
  {
    id: "guest-house",
    title: "Curated Guest Houses",
    subtitle: "Royal Passage Standards",
    lines: [
      "Boutique rooms vetted for cleanliness, location, and genuine hospitality.",
      "Premium linens, local art, and concierge support for dining and experiences.",
      "Small properties with big hearts — every stay feels personally arranged.",
    ],
    image: craft,
    imageAlt: "Boutique guest house room with local art",
    theme: "boutique",
  },
];

export type HomestayPillar = {
  title: string;
  description: string;
};

export const HOMESTAY_PILLARS: HomestayPillar[] = [
  {
    title: "Vetted by Royal Passage",
    description: "Every property is inspected for safety, cleanliness, and authentic local warmth.",
  },
  {
    title: "Pay at the Homestay",
    description: "Reserve online, settle in cash at check-in — simple, transparent, no hidden fees.",
  },
  {
    title: "Heritage & Local",
    description: "Havelis, villas, and guest houses across Mysuru — chosen for character and neighbourhood charm.",
  },
  {
    title: "Host Hospitality",
    description: "Meet families and caretakers who treat you as a guest, not a room number.",
  },
];

export type HomestayHowItWorksStep = {
  step: string;
  title: string;
  description: string;
};

export const HOMESTAY_HOW_IT_WORKS: HomestayHowItWorksStep[] = [
  {
    step: "01",
    title: "Search & compare",
    description: "Pick your dates and guest count — browse vetted Mysuru stays with clear nightly rates.",
  },
  {
    step: "02",
    title: "Reserve your stay",
    description: "Confirm your booking in minutes. You'll receive details and host contact before arrival.",
  },
  {
    step: "03",
    title: "Check in & pay cash",
    description: "Arrive at the homestay and pay your host in cash at check-in. No online payment required.",
  },
];
