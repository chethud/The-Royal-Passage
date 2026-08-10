/** Cinematic opening destinations for the Mysore Trail hero */

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
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mysore_Palace_-_Front_view.jpg/1920px-Mysore_Palace_-_Front_view.jpg",
    imageAlt: "Mysuru Palace facade in golden light",
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
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Chamunda_Devi_Temple,_Chamundi_Hill,_Mysore.jpg/1920px-Chamunda_Devi_Temple,_Chamundi_Hill,_Mysore.jpg",
    imageAlt: "Chamundeshwari Temple on Chamundi Hill",
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
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Devaraja_Market_1.jpg/1280px-Devaraja_Market_1.jpg",
    imageAlt: "Devaraja Market street façade in Mysuru",
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
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/A_side_wide_angle_view_of_Jaganmohan_Palace%2C_Mysuru%2C_Karnataka.jpg/1600px-A_side_wide_angle_view_of_Jaganmohan_Palace%2C_Mysuru%2C_Karnataka.jpg",
    imageAlt: "Jaganmohan Palace facade in Mysuru",
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
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Beautiful_Exterior_view_of_St._Philomena%E2%80%99s_Cathedral%2C_Mysuru%2C_Karnataka.jpg/1600px-Beautiful_Exterior_view_of_St._Philomena%E2%80%99s_Cathedral%2C_Mysuru%2C_Karnataka.jpg",
    imageAlt: "St. Philomena's Cathedral twin towers in Mysuru",
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
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Lalitha_Mahal_Palace_%2C_Mysore_-_Host_to_many_events.jpg/1600px-Lalitha_Mahal_Palace_%2C_Mysore_-_Host_to_many_events.jpg",
    imageAlt: "Lalitha Mahal Palace white facade",
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
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/North_View_Karanji_Lake_Mysore_Nov23_A7C_08174.jpg/1600px-North_View_Karanji_Lake_Mysore_Nov23_A7C_08174.jpg",
    imageAlt: "Karanji Lake north view in Mysuru",
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
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Brindavan_Gardens.JPG/1600px-Brindavan_Gardens.JPG",
    imageAlt: "Brindavan Gardens near Mysuru",
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
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Sunset-Mysore-Kukkarahalli.jpg/1600px-Sunset-Mysore-Kukkarahalli.jpg",
    imageAlt: "Sunset over Kukkarahalli Lake in Mysuru",
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
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Ranganathaswamy_Temple%2C_Srirangapatna_-_Wide_Shot.jpg/1600px-Ranganathaswamy_Temple%2C_Srirangapatna_-_Wide_Shot.jpg",
    imageAlt: "Ranganathaswamy Temple at Srirangapatna",
    category: "History",
  },
];
