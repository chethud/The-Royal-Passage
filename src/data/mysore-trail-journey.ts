/** Mysore Trail — destination catalog & curated multi-day journeys */

export type TrailCategory =
  | "heritage"
  | "architecture"
  | "food"
  | "culture"
  | "nature"
  | "photography"
  | "shopping"
  | "spiritual"
  | "hidden"
  | "family"
  | "luxury";

export type TravellerType =
  | "solo"
  | "couple"
  | "family"
  | "friends"
  | "luxury"
  | "heritage"
  | "photography"
  | "food";

export type TripPace = "relaxed" | "balanced" | "explorer";

export type TrailPlace = {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  cityLabel: string;
  image: string;
  imageAlt: string;
  coordinates: { lat: number; lng: number };
  categories: TrailCategory[];
  description: string;
  historicalSignificance: string;
  whatToSee: string[];
  whatToDo: string[];
  durationHours: number;
  durationLabel: string;
  distanceFromCentreKm: number;
  bestTime: string;
  entryInfo?: string;
  localTip: string;
  foodNearby: string;
  photographyTip: string;
  whyItMatters: string;
  optionalActivity?: string;
  etiquette?: string;
};

export type TrailStop = {
  id: string;
  placeId: string;
  day: number;
  time: string;
  timeLabel: string;
  travelFromPrevious?: { minutes: number; distanceKm: number; mode: string };
  experienceSlug?: string;
  experienceTitle?: string;
};

export type TrailDay = {
  day: number;
  title: string;
  theme: string;
  stopIds: string[];
};

export type TrailRecommendation = {
  placeId: string;
  reason: string;
  category: string;
};

export type TripPreferences = {
  days: 1 | 2 | 3 | 4 | 5;
  traveller: TravellerType;
  interests: TrailCategory[];
  pace: TripPace;
};

export const TRAIL_PLACES: Record<string, TrailPlace> = {
  "chamundi-hill": {
    id: "chamundi-hill",
    name: "Chamundi Hill",
    shortName: "Chamundi Hill",
    tagline: "Where Mysuru begins above the clouds.",
    cityLabel: "Mysuru",
    image:
      "https://sqecqtcmgbfrwwgnbdsx.supabase.co/storage/v1/object/public/experience-photos/737ab068-af8b-49d3-8615-a7b32ccbe804/1786515307394-78d3a06e.png",
    imageAlt: "Chamundeshwari Temple on Chamundi Hill",
    coordinates: { lat: 12.2724, lng: 76.6701 },
    categories: ["spiritual", "heritage", "photography", "nature"],
    description:
      "Begin above the city. Chamundi Hill rises over Mysuru with temple bells, stone steps, and a panoramic first view of the palace skyline.",
    historicalSignificance:
      "Sacred to Goddess Chamundeshwari, the hill has been a royal pilgrimage and defining landmark for the Wadiyar kingdom for centuries.",
    whatToSee: ["Chamundeshwari Temple", "Monumental Nandi statue", "Panoramic city view"],
    whatToDo: ["Sunrise temple visit", "Walk to the viewpoint", "Quiet photography"],
    durationHours: 1.5,
    durationLabel: "1–1.5 hours",
    distanceFromCentreKm: 13,
    bestTime: "Early morning",
    entryInfo: "Temple open daily; modest dress recommended.",
    localTip: "Arrive before 8 AM for cooler air and softer light on the city below.",
    foodNearby: "Simple filter coffee stalls near the foothills after descent.",
    photographyTip: "Shoot the Nandi in side light; city vista works best facing west after sunrise.",
    whyItMatters: "It sets the scale of Mysuru — palace, lake, and grid — seen from the royal hill.",
    optionalActivity: "Short walk on the hillside paths beyond the main viewpoint.",
    etiquette: "Remove footwear at the temple; keep voices low near sanctum.",
  },
  "mysuru-palace": {
    id: "mysuru-palace",
    name: "Mysuru Palace",
    shortName: "Mysuru Palace",
    tagline: "The crown jewel of the City of Palaces.",
    cityLabel: "Mysuru",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mysore_Palace_-_Front_view.jpg/1600px-Mysore_Palace_-_Front_view.jpg",
    imageAlt: "Mysuru Palace facade in morning light",
    coordinates: { lat: 12.3052, lng: 76.6552 },
    categories: ["heritage", "architecture", "photography", "culture", "luxury"],
    description:
      "Ambavilas Palace is Mysuru’s ceremonial heart — Indo-Saracenic domes, carved gates, and interiors that still hold the echo of the Wadiyar court.",
    historicalSignificance:
      "Seat of the Wadiyar dynasty and one of India’s most visited palaces; a living emblem of Mysuru’s royal modernity.",
    whatToSee: ["Outer facade & gates", "Durbar Hall", "Royal interiors", "Palace grounds"],
    whatToDo: ["Guided heritage circuit", "Grounds photography", "Museum rooms"],
    durationHours: 2,
    durationLabel: "1.5–2.5 hours",
    distanceFromCentreKm: 0.5,
    bestTime: "Morning after opening, or evening illumination nights",
    entryInfo: "Ticketed entry; audio guides available. Check illumination schedule separately.",
    localTip: "Enter soon after opening for quieter halls before tour groups peak.",
    foodNearby: "Heritage lunch spots within a short walk of Devaraja Market.",
    photographyTip: "Facade symmetry from the south lawn; avoid midday harsh contrast.",
    whyItMatters: "Every Mysuru story eventually returns to this palace.",
    optionalActivity: "Royal Passage heritage walk when available.",
  },
  "devaraja-market": {
    id: "devaraja-market",
    name: "Devaraja Market",
    shortName: "Devaraja Market",
    tagline: "Royal Mysuru lives in its markets too.",
    cityLabel: "Mysuru",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Devaraja_Market_1.jpg/1600px-Devaraja_Market_1.jpg",
    imageAlt: "Devaraja Market street façade in Mysuru",
    coordinates: { lat: 12.311, lng: 76.658 },
    categories: ["culture", "shopping", "food", "photography", "hidden"],
    description:
      "From palace stone to marigold and spice — Devaraja Market is Mysuru’s living bazaar of flowers, incense, fruit, and sandalwood.",
    historicalSignificance:
      "A historic trading heart of the old city, still serving daily life rather than tourist spectacle alone.",
    whatToSee: ["Flower lanes", "Spice stalls", "Sandalwood & incense", "Local vendors"],
    whatToDo: ["Slow market walk", "Buy fresh flowers", "Taste seasonal fruit"],
    durationHours: 1,
    durationLabel: "45–75 minutes",
    distanceFromCentreKm: 1,
    bestTime: "Late morning to early afternoon",
    localTip: "Ask vendors about Mysuru jasmine and seasonal flowers — stories come free.",
    foodNearby: "Fresh fruit, sugarcane juice, and snack stalls along the edges.",
    photographyTip: "Look for colour blocks of marigold against teal tarpaulins.",
    whyItMatters: "It bridges royal architecture and everyday Mysuru.",
    optionalActivity: "Market & food walk with a local host.",
  },
  "royal-lunch": {
    id: "royal-lunch",
    name: "Royal Lunch",
    shortName: "Royal Lunch",
    tagline: "A Mysuru meal, unhurried.",
    cityLabel: "Mysuru",
    image: "",
    imageAlt: "",
    coordinates: { lat: 12.309, lng: 76.655 },
    categories: ["food", "culture", "family"],
    description:
      "Pause for a classic Mysuru table — dosa, idli, vada, filter coffee, and a square of Mysuru Pak.",
    historicalSignificance:
      "Mysuru’s courtly and temple food traditions shaped the city’s everyday cuisine.",
    whatToSee: ["Thali service", "Filter coffee ritual", "Mysuru Pak"],
    whatToDo: ["Sit for a full meal", "Try local sweets", "Rest before the afternoon"],
    durationHours: 1,
    durationLabel: "1 hour",
    distanceFromCentreKm: 1,
    bestTime: "1:00–2:30 PM",
    localTip: "Order filter coffee after sweets — Mysuru’s unofficial reset button.",
    foodNearby: "This stop is the recommendation.",
    photographyTip: "Overhead shot of thali before the first bite.",
    whyItMatters: "Travel without a proper Mysuru meal is incomplete.",
  },
  "jaganmohan-palace": {
    id: "jaganmohan-palace",
    name: "Jaganmohan Palace & Art Gallery",
    shortName: "Jaganmohan Palace",
    tagline: "Where Mysuru paints its memory.",
    cityLabel: "Mysuru",
    image: "/mysore-trail/jaganmohan-palace.png",
    imageAlt: "Jaganmohan Palace facade in Mysuru",
    coordinates: { lat: 12.3085, lng: 76.6498 },
    categories: ["heritage", "culture", "architecture", "photography"],
    description:
      "A quieter royal house turned gallery — Mysuru paintings, Indian art, and palace rooms that reward slow looking.",
    historicalSignificance:
      "Built by the Wadiyars and later dedicated as an art gallery, it preserves Mysuru’s visual culture.",
    whatToSee: ["Mysuru school paintings", "Palace architecture", "Gallery halls"],
    whatToDo: ["Guided art walk", "Sketching (where allowed)", "Quiet interiors"],
    durationHours: 1.25,
    durationLabel: "1–1.5 hours",
    distanceFromCentreKm: 1.5,
    bestTime: "Afternoon",
    entryInfo: "Ticketed gallery entry.",
    localTip: "Give yourself time with the Mysuru school works — details reward patience.",
    foodNearby: "Cafés near Sayyaji Rao Road.",
    photographyTip: "Exterior facade; interiors often restrict flash.",
    whyItMatters: "It deepens the palace story into art and craft.",
  },
  "st-philomena": {
    id: "st-philomena",
    name: "St. Philomena's Cathedral",
    shortName: "St. Philomena's",
    tagline: "Gothic towers over a southern sky.",
    cityLabel: "Mysuru",
    image: "/mysore-trail/st-philomena.png",
    imageAlt: "St. Philomena’s Cathedral twin towers in Mysuru",
    coordinates: { lat: 12.321, lng: 76.6584 },
    categories: ["architecture", "spiritual", "photography", "heritage"],
    description:
      "Neo-Gothic twin spires and stained light — one of South India’s most striking cathedral silhouettes.",
    historicalSignificance:
      "Built under the Wadiyar patronage era, it stands as a landmark of Mysuru’s plural architectural heritage.",
    whatToSee: ["Twin towers", "Stained glass", "Nave & altar", "Exterior geometry"],
    whatToDo: ["Quiet visit", "Architecture study", "Exterior photography"],
    durationHours: 0.75,
    durationLabel: "45–60 minutes",
    distanceFromCentreKm: 2,
    bestTime: "Late afternoon light",
    entryInfo: "Open to visitors; respect services in progress.",
    localTip: "Walk the perimeter for tower perspective without rushing inside.",
    foodNearby: "Bakeries and cafés nearby on Ashoka Road.",
    photographyTip: "Low angle for towers; blue hour is dramatic if time allows.",
    whyItMatters: "Mysuru’s skyline is more than palace domes.",
  },
  "royal-evening": {
    id: "royal-evening",
    name: "Royal Evening",
    shortName: "Royal Evening",
    tagline: "When the city softens into gold.",
    cityLabel: "Mysuru",
    image: "",
    imageAlt: "",
    coordinates: { lat: 12.3052, lng: 76.6552 },
    categories: ["heritage", "luxury", "culture", "photography"],
    description:
      "Close Day One with illumination nights when scheduled, a heritage walk, or a deliberate royal dinner.",
    historicalSignificance:
      "Evening palace illumination has become a modern ritual of Mysuru’s public life.",
    whatToSee: ["Palace illumination (seasonal)", "Evening streets", "Dinner ambience"],
    whatToDo: ["Watch lights", "Slow evening walk", "Book a curated dinner"],
    durationHours: 2,
    durationLabel: "1.5–2.5 hours",
    distanceFromCentreKm: 0.5,
    bestTime: "After sunset",
    localTip: "Confirm illumination evenings in advance — they transform the palace.",
    foodNearby: "Fine dining and heritage restaurants near the palace quarter.",
    photographyTip: "Long exposure of the lit facade from the outer grounds.",
    whyItMatters: "Day One should end as a memory, not a checklist.",
  },
  "karanji-lake": {
    id: "karanji-lake",
    name: "Karanji Lake",
    shortName: "Karanji Lake",
    tagline: "Morning Mysuru by the water.",
    cityLabel: "Mysuru",
    image: "/mysore-trail/karanji-lake.png",
    imageAlt: "Karanji Lake north view in Mysuru",
    coordinates: { lat: 12.3028, lng: 76.6795 },
    categories: ["nature", "photography", "family", "hidden"],
    description:
      "A quieter Mysuru — walkways, birds, and water before the city fully wakes.",
    historicalSignificance:
      "A protected lake ecosystem within the city, valued for birdlife and recreation.",
    whatToSee: ["Lake edge", "Birdlife", "Walk paths", "Nature park areas"],
    whatToDo: ["Morning walk", "Bird watching", "Family outing"],
    durationHours: 1.5,
    durationLabel: "1–2 hours",
    distanceFromCentreKm: 4,
    bestTime: "Early morning",
    entryInfo: "Park entry ticketed.",
    localTip: "Bring binoculars if you care about birds — mornings are richest.",
    foodNearby: "Breakfast after the walk nearer town.",
    photographyTip: "Reflections at still water; telephoto for birds.",
    whyItMatters: "Mysuru’s heritage includes its living landscapes.",
  },
  "mysuru-zoo": {
    id: "mysuru-zoo",
    name: "Mysuru Zoo",
    shortName: "Mysuru Zoo",
    tagline: "One of India’s oldest zoological gardens.",
    cityLabel: "Mysuru",
    image: "/mysore-trail/mysuru-zoo.png",
    imageAlt: "Sri Chamarajendra Zoological Gardens in Mysuru",
    coordinates: { lat: 12.301, lng: 76.666 },
    categories: ["family", "nature", "culture"],
    description:
      "Tree-lined paths and a historic zoo that pairs well with a Karanji morning for families.",
    historicalSignificance:
      "Among India’s oldest zoos, established under royal patronage and still a civic landmark.",
    whatToSee: ["Tree canopy walks", "Animal enclosures", "Historic grounds"],
    whatToDo: ["Leisurely circuit", "Family visit", "Combine with Karanji"],
    durationHours: 2.5,
    durationLabel: "2–3 hours",
    distanceFromCentreKm: 3.5,
    bestTime: "Morning",
    entryInfo: "Ticketed; check weekly closures.",
    localTip: "Go early — shade and animal activity are better before noon.",
    foodNearby: "On-site and nearby eateries.",
    photographyTip: "Natural light through canopy; patience over flash.",
    whyItMatters: "A softer day-two rhythm after royal density.",
  },
  "lalitha-mahal": {
    id: "lalitha-mahal",
    name: "Lalitha Mahal Palace",
    shortName: "Lalitha Mahal",
    tagline: "Luxury on the hillside.",
    cityLabel: "Mysuru",
    image: "/mysore-trail/lalitha-mahal.jpg",
    imageAlt: "Lalitha Mahal Palace white facade",
    coordinates: { lat: 12.292, lng: 76.685 },
    categories: ["luxury", "heritage", "architecture", "photography"],
    description:
      "A white European-style palace on the Chamundi foothills — ballroom scale, lawns, and a sense of courtly leisure.",
    historicalSignificance:
      "Built as a royal guest palace and now a heritage hotel — architecture as hospitality.",
    whatToSee: ["Palace facade", "Interiors (where open)", "Hill setting"],
    whatToDo: ["Heritage visit / stay", "Photography", "Tea on the grounds if available"],
    durationHours: 1.5,
    durationLabel: "1–2 hours",
    distanceFromCentreKm: 6,
    bestTime: "Afternoon golden light",
    entryInfo: "Hotel/heritage access may vary — confirm visiting rules.",
    localTip: "Treat it as atmosphere first — the setting is the story.",
    foodNearby: "Hotel dining when open to visitors.",
    photographyTip: "Wide facade with sky; late light on white stone.",
    whyItMatters: "It shows Mysuru’s royal taste beyond the main palace.",
  },
  "kukkarahalli-lake": {
    id: "kukkarahalli-lake",
    name: "Kukkarahalli Lake",
    shortName: "Kukkarahalli Lake",
    tagline: "Sunset for walkers and birds.",
    cityLabel: "Mysuru",
    image: "/mysore-trail/kukkarahalli-lake.png",
    imageAlt: "Sunset over Kukkarahalli Lake in Mysuru",
    coordinates: { lat: 12.3115, lng: 76.623 },
    categories: ["nature", "photography", "family", "hidden"],
    description:
      "A beloved walking lake — birds, circular paths, and Mysuru’s evening breath.",
    historicalSignificance:
      "A long-standing civic lake and recreation space for students and residents.",
    whatToSee: ["Sunset path", "Birdlife", "Water edge"],
    whatToDo: ["Sunset walk", "Birding", "Quiet pause"],
    durationHours: 1,
    durationLabel: "45–90 minutes",
    distanceFromCentreKm: 3,
    bestTime: "Late afternoon to sunset",
    localTip: "Walk the full loop if energy allows — light changes every stretch.",
    foodNearby: "University area cafés nearby.",
    photographyTip: "Silhouettes on the path; golden reflections.",
    whyItMatters: "A day needs one place that asks nothing of you.",
  },
  "local-shopping": {
    id: "local-shopping",
    name: "Local Food & Shopping",
    shortName: "Food & Shopping",
    tagline: "Silk, sandalwood, and Mysuru Pak.",
    cityLabel: "Mysuru",
    image: "",
    imageAlt: "",
    coordinates: { lat: 12.31, lng: 76.65 },
    categories: ["shopping", "food", "culture"],
    description:
      "Close the day with Mysuru’s signature takeaways — silk, sandalwood, crafts, and sweets.",
    historicalSignificance:
      "Mysuru silk and sandalwood are historic royal and civic crafts.",
    whatToSee: ["Silk stores", "Sandalwood products", "Handicrafts", "Sweet shops"],
    whatToDo: ["Shopping checklist", "Mysuru Pak tasting", "Gift packing"],
    durationHours: 1.5,
    durationLabel: "1–2 hours",
    distanceFromCentreKm: 1,
    bestTime: "Evening",
    localTip: "Buy Mysuru Pak fresh the same evening you travel — it travels better sealed.",
    foodNearby: "Sweet shops and snack counters.",
    photographyTip: "Detail shots of silk weave and packaging.",
    whyItMatters: "Souvenirs that actually taste and smell of Mysuru.",
  },
  srirangapatna: {
    id: "srirangapatna",
    name: "Srirangapatna",
    shortName: "Srirangapatna",
    tagline: "Island of Tipu’s history.",
    cityLabel: "Near Mysuru",
    image: "/mysore-trail/srirangapatna.png",
    imageAlt: "Ranganathaswamy Temple at Srirangapatna",
    coordinates: { lat: 12.4237, lng: 76.6947 },
    categories: ["heritage", "architecture", "culture", "photography"],
    description:
      "A river island town of Tipu Sultan’s era — temples, Gumbaz, and layered fort history beyond Mysuru’s palace walls.",
    historicalSignificance:
      "Former capital linked to Tipu Sultan and the Anglo-Mysore wars; a dense historic landscape.",
    whatToSee: ["Ranganathaswamy Temple", "Gumbaz", "Fort remnants", "River views"],
    whatToDo: ["Heritage circuit", "Temple visit", "Photo walk"],
    durationHours: 2.5,
    durationLabel: "2–3 hours",
    distanceFromCentreKm: 18,
    bestTime: "Morning",
    localTip: "Start early to combine with Ranganathittu the same day.",
    foodNearby: "Local eateries on the island approaches.",
    photographyTip: "River light mid-morning; temple exteriors.",
    whyItMatters: "Mysuru’s story extends beyond the city grid.",
  },
  ranganathittu: {
    id: "ranganathittu",
    name: "Ranganathittu Bird Sanctuary",
    shortName: "Ranganathittu",
    tagline: "Boats among the islands.",
    cityLabel: "Near Mysuru",
    image: "/mysore-trail/ranganathittu.png",
    imageAlt: "Bird islands at Ranganathittu Bird Sanctuary",
    coordinates: { lat: 12.424, lng: 76.656 },
    categories: ["nature", "photography", "family"],
    description:
      "A boat ride through islets alive with nesting birds — one of Karnataka’s finest nearby nature experiences.",
    historicalSignificance:
      "A protected sanctuary on the Cauvery, long celebrated for migratory and resident birds.",
    whatToSee: ["Boat circuit", "Nesting colonies", "River environment"],
    whatToDo: ["Guided boat", "Bird photography", "Quiet observation"],
    durationHours: 1.5,
    durationLabel: "1–2 hours",
    distanceFromCentreKm: 19,
    bestTime: "Morning",
    entryInfo: "Boat tickets on site; timing varies by season.",
    localTip: "Sit mid-boat for steadier shots; mornings for activity.",
    foodNearby: "Simple stalls near the entrance.",
    photographyTip: "Fast shutter for birds in flight; polariser for glare.",
    whyItMatters: "A living counterpoint to stone and silk.",
  },
  "brindavan-gardens": {
    id: "brindavan-gardens",
    name: "Brindavan Gardens",
    shortName: "Brindavan Gardens",
    tagline: "Terraces, fountains, evening light.",
    cityLabel: "Near Mysuru",
    image: "/mysore-trail/brindavan-gardens.png",
    imageAlt: "Brindavan Gardens near Mysuru",
    coordinates: { lat: 12.4244, lng: 76.572 },
    categories: ["family", "photography", "culture", "nature"],
    description:
      "Terraced gardens below the Krishnarajasagara dam — musical fountains and evening spectacle.",
    historicalSignificance:
      "A landmark garden destination associated with Mysuru-region tourism for generations.",
    whatToSee: ["Terraced layout", "Musical fountain", "Evening illumination", "Dam views"],
    whatToDo: ["Garden walk", "Fountain show", "Family evening"],
    durationHours: 2.5,
    durationLabel: "2–3 hours",
    distanceFromCentreKm: 24,
    bestTime: "Late afternoon into evening",
    entryInfo: "Ticketed; fountain timings seasonal.",
    localTip: "Arrive before dusk to walk gardens, then stay for fountains.",
    foodNearby: "Food courts near the gardens.",
    photographyTip: "Wide terraces by day; long exposure of fountains at night.",
    whyItMatters: "A grand finale beyond the palace city.",
  },
  "final-evening": {
    id: "final-evening",
    name: "The Final Royal Evening",
    shortName: "Final Evening",
    tagline: "Your Mysuru story doesn’t end here.",
    cityLabel: "Mysuru",
    image: "",
    imageAlt: "",
    coordinates: { lat: 12.295, lng: 76.639 },
    categories: ["luxury", "culture", "heritage"],
    description:
      "Close the trail with a deliberate evening — dinner, reflection, and the sense that Mysuru stays with you.",
    historicalSignificance:
      "A pause rather than a monument — the traveller’s own closing chapter.",
    whatToSee: ["Night city lights", "Quiet streets", "Your own notes"],
    whatToDo: ["Royal dinner", "Journal the day", "Plan a return"],
    durationHours: 2,
    durationLabel: "Open evening",
    distanceFromCentreKm: 0,
    bestTime: "Night",
    localTip: "Leave one evening unscheduled — Mysuru rewards lingering.",
    foodNearby: "Your choice of a final Mysuru meal.",
    photographyTip: "One last night frame — palace or street — and stop shooting.",
    whyItMatters: "Some cities are visited. Mysuru is experienced.",
  },
};

export const PLACE_RECOMMENDATIONS: Record<string, TrailRecommendation[]> = {
  "chamundi-hill": [
    { placeId: "lalitha-mahal", reason: "Hillside luxury after the temple heights", category: "Luxury" },
    { placeId: "karanji-lake", reason: "Descend into morning nature", category: "Nature" },
    { placeId: "mysuru-palace", reason: "See the palace from the city below", category: "Heritage" },
    { placeId: "kukkarahalli-lake", reason: "A quieter water pause", category: "Nature" },
  ],
  "mysuru-palace": [
    { placeId: "jaganmohan-palace", reason: "Continue the royal art story", category: "Heritage" },
    { placeId: "devaraja-market", reason: "From court to living city", category: "Culture" },
    { placeId: "st-philomena", reason: "Another Mysuru silhouette", category: "Architecture" },
    { placeId: "royal-lunch", reason: "A proper Mysuru table nearby", category: "Food" },
  ],
  "devaraja-market": [
    { placeId: "royal-lunch", reason: "Taste what the market promises", category: "Food" },
    { placeId: "local-shopping", reason: "Silk, sandalwood, sweets", category: "Shopping" },
    { placeId: "jaganmohan-palace", reason: "Art after the bazaar colour", category: "Culture" },
    { placeId: "mysuru-palace", reason: "Return to the royal axis", category: "Heritage" },
  ],
  "royal-lunch": [
    { placeId: "devaraja-market", reason: "Walk off lunch through spice lanes", category: "Culture" },
    { placeId: "jaganmohan-palace", reason: "A calm afternoon gallery", category: "Heritage" },
    { placeId: "local-shopping", reason: "Pack Mysuru Pak for later", category: "Food" },
  ],
  "jaganmohan-palace": [
    { placeId: "mysuru-palace", reason: "Pair palace with gallery", category: "Heritage" },
    { placeId: "st-philomena", reason: "Architecture across traditions", category: "Architecture" },
    { placeId: "devaraja-market", reason: "Colour after quiet halls", category: "Culture" },
  ],
  "st-philomena": [
    { placeId: "mysuru-palace", reason: "Two icons of the skyline", category: "Architecture" },
    { placeId: "royal-evening", reason: "Continue into night light", category: "Heritage" },
    { placeId: "jaganmohan-palace", reason: "Another cultural interior", category: "Culture" },
  ],
  "royal-evening": [
    { placeId: "mysuru-palace", reason: "Illumination nights when scheduled", category: "Heritage" },
    { placeId: "local-shopping", reason: "Evening silk and sweets", category: "Shopping" },
    { placeId: "lalitha-mahal", reason: "A luxury nightcap mood", category: "Luxury" },
  ],
  "karanji-lake": [
    { placeId: "mysuru-zoo", reason: "Natural pair for families", category: "Family" },
    { placeId: "chamundi-hill", reason: "Heights after water", category: "Nature" },
    { placeId: "kukkarahalli-lake", reason: "Another lake rhythm", category: "Nature" },
  ],
  "mysuru-zoo": [
    { placeId: "karanji-lake", reason: "Combine as a nature morning", category: "Family" },
    { placeId: "lalitha-mahal", reason: "Luxury contrast after the zoo", category: "Luxury" },
  ],
  "lalitha-mahal": [
    { placeId: "chamundi-hill", reason: "Same foothill geography", category: "Heritage" },
    { placeId: "mysuru-palace", reason: "Compare two royal houses", category: "Luxury" },
    { placeId: "kukkarahalli-lake", reason: "Soft landing at sunset", category: "Nature" },
  ],
  "kukkarahalli-lake": [
    { placeId: "karanji-lake", reason: "Sister lake walks", category: "Nature" },
    { placeId: "local-shopping", reason: "Evening shopping after sunset", category: "Shopping" },
  ],
  "local-shopping": [
    { placeId: "devaraja-market", reason: "Market colour and spice", category: "Shopping" },
    { placeId: "royal-lunch", reason: "Eat before you carry sweets home", category: "Food" },
  ],
  srirangapatna: [
    { placeId: "ranganathittu", reason: "Pair history with birds", category: "Nature" },
    { placeId: "brindavan-gardens", reason: "Continue the outstation day", category: "Family" },
  ],
  ranganathittu: [
    { placeId: "srirangapatna", reason: "History next door", category: "Heritage" },
    { placeId: "brindavan-gardens", reason: "Gardens after the river", category: "Nature" },
  ],
  "brindavan-gardens": [
    { placeId: "srirangapatna", reason: "History on the same axis", category: "Heritage" },
    { placeId: "ranganathittu", reason: "River life nearby", category: "Nature" },
    { placeId: "final-evening", reason: "Return for a closing night", category: "Luxury" },
  ],
  "final-evening": [
    { placeId: "mysuru-palace", reason: "One last look at the crown", category: "Heritage" },
    { placeId: "local-shopping", reason: "Pack the last gifts", category: "Shopping" },
  ],
};

/** Default 3-day curated journey */
export const DEFAULT_TRAIL_STOPS: TrailStop[] = [
  // Day 1
  {
    id: "d1-s1",
    placeId: "chamundi-hill",
    day: 1,
    time: "07:00",
    timeLabel: "07:00 AM",
  },
  {
    id: "d1-s2",
    placeId: "mysuru-palace",
    day: 1,
    time: "09:30",
    timeLabel: "09:30 AM",
    travelFromPrevious: { minutes: 35, distanceKm: 13, mode: "Drive" },
    experienceTitle: "Royal Palace Heritage Walk",
  },
  {
    id: "d1-s3",
    placeId: "devaraja-market",
    day: 1,
    time: "12:00",
    timeLabel: "12:00 PM",
    travelFromPrevious: { minutes: 10, distanceKm: 1, mode: "Walk / auto" },
    experienceTitle: "Mysuru Market & Food Walk",
  },
  {
    id: "d1-s4",
    placeId: "royal-lunch",
    day: 1,
    time: "13:30",
    timeLabel: "01:30 PM",
    travelFromPrevious: { minutes: 8, distanceKm: 0.6, mode: "Walk" },
  },
  {
    id: "d1-s5",
    placeId: "jaganmohan-palace",
    day: 1,
    time: "15:00",
    timeLabel: "03:00 PM",
    travelFromPrevious: { minutes: 12, distanceKm: 1.5, mode: "Auto" },
  },
  {
    id: "d1-s6",
    placeId: "st-philomena",
    day: 1,
    time: "17:00",
    timeLabel: "05:00 PM",
    travelFromPrevious: { minutes: 15, distanceKm: 2.5, mode: "Auto" },
  },
  {
    id: "d1-s7",
    placeId: "royal-evening",
    day: 1,
    time: "19:00",
    timeLabel: "07:00 PM",
    travelFromPrevious: { minutes: 12, distanceKm: 2, mode: "Auto" },
  },
  // Day 2
  {
    id: "d2-s1",
    placeId: "karanji-lake",
    day: 2,
    time: "07:00",
    timeLabel: "07:00 AM",
  },
  {
    id: "d2-s2",
    placeId: "mysuru-zoo",
    day: 2,
    time: "09:00",
    timeLabel: "09:00 AM",
    travelFromPrevious: { minutes: 10, distanceKm: 1.5, mode: "Walk / auto" },
  },
  {
    id: "d2-s3",
    placeId: "royal-lunch",
    day: 2,
    time: "12:30",
    timeLabel: "12:30 PM",
    travelFromPrevious: { minutes: 20, distanceKm: 4, mode: "Auto" },
  },
  {
    id: "d2-s4",
    placeId: "lalitha-mahal",
    day: 2,
    time: "14:00",
    timeLabel: "02:00 PM",
    travelFromPrevious: { minutes: 25, distanceKm: 6, mode: "Drive" },
  },
  {
    id: "d2-s5",
    placeId: "kukkarahalli-lake",
    day: 2,
    time: "16:30",
    timeLabel: "04:30 PM",
    travelFromPrevious: { minutes: 30, distanceKm: 8, mode: "Drive" },
  },
  {
    id: "d2-s6",
    placeId: "local-shopping",
    day: 2,
    time: "18:30",
    timeLabel: "06:30 PM",
    travelFromPrevious: { minutes: 15, distanceKm: 3, mode: "Auto" },
  },
  // Day 3
  {
    id: "d3-s1",
    placeId: "srirangapatna",
    day: 3,
    time: "08:00",
    timeLabel: "08:00 AM",
  },
  {
    id: "d3-s2",
    placeId: "ranganathittu",
    day: 3,
    time: "11:00",
    timeLabel: "11:00 AM",
    travelFromPrevious: { minutes: 20, distanceKm: 5, mode: "Drive" },
  },
  {
    id: "d3-s3",
    placeId: "royal-lunch",
    day: 3,
    time: "13:00",
    timeLabel: "01:00 PM",
    travelFromPrevious: { minutes: 25, distanceKm: 8, mode: "Drive" },
  },
  {
    id: "d3-s4",
    placeId: "brindavan-gardens",
    day: 3,
    time: "15:00",
    timeLabel: "03:00 PM",
    travelFromPrevious: { minutes: 35, distanceKm: 14, mode: "Drive" },
  },
  {
    id: "d3-s5",
    placeId: "final-evening",
    day: 3,
    time: "19:00",
    timeLabel: "07:00 PM",
    travelFromPrevious: { minutes: 45, distanceKm: 24, mode: "Drive" },
  },
];

export const DEFAULT_TRAIL_DAYS: TrailDay[] = [
  {
    day: 1,
    title: "The Royal Heart",
    theme: "Hill, palace, market, and night light",
    stopIds: ["d1-s1", "d1-s2", "d1-s3", "d1-s4", "d1-s5", "d1-s6", "d1-s7"],
  },
  {
    day: 2,
    title: "Culture, Nature & Local Life",
    theme: "Lakes, luxury, and evening craft",
    stopIds: ["d2-s1", "d2-s2", "d2-s3", "d2-s4", "d2-s5", "d2-s6"],
  },
  {
    day: 3,
    title: "Beyond the Palaces",
    theme: "History, birds, and garden light",
    stopIds: ["d3-s1", "d3-s2", "d3-s3", "d3-s4", "d3-s5"],
  },
];

export const DEFAULT_PREFERENCES: TripPreferences = {
  days: 3,
  traveller: "heritage",
  interests: ["heritage", "architecture", "culture", "photography"],
  pace: "balanced",
};

export function getPlace(placeId: string): TrailPlace {
  const places = trailPlaceCatalog ?? TRAIL_PLACES;
  return places[placeId] ?? places["mysuru-palace"] ?? TRAIL_PLACES["mysuru-palace"]!;
}

/** Apply published CMS place catalog for this request/render tree. */
let trailPlaceCatalog: Record<string, TrailPlace> | null = null;

export function setTrailPlaceCatalog(places: Record<string, TrailPlace> | null) {
  trailPlaceCatalog = places;
}

export function getTrailPlaceCatalog(): Record<string, TrailPlace> {
  return trailPlaceCatalog ?? TRAIL_PLACES;
}
