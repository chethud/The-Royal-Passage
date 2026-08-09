import {
  DEFAULT_PREFERENCES,
  DEFAULT_TRAIL_DAYS,
  DEFAULT_TRAIL_STOPS,
  PLACE_RECOMMENDATIONS,
  TRAIL_PLACES,
  getPlace,
  type TrailCategory,
  type TrailDay,
  type TrailPlace,
  type TrailRecommendation,
  type TrailStop,
  type TravellerType,
  type TripPreferences,
} from "@/data/mysore-trail-journey";

const DAY_THEMES: Record<number, { title: string; theme: string }> = {
  1: { title: "The Royal Heart", theme: "Hill, palace, market, and night light" },
  2: { title: "Culture, Nature & Local Life", theme: "Lakes, luxury, and evening craft" },
  3: { title: "Beyond the Palaces", theme: "History, birds, and garden light" },
  4: { title: "Deeper Mysuru", theme: "Hidden corners and second looks" },
  5: { title: "Linger Longer", theme: "Slow heritage and return visits" },
};

const TRAVELLER_BIAS: Record<TravellerType, TrailCategory[]> = {
  solo: ["hidden", "photography", "culture"],
  couple: ["luxury", "heritage", "photography"],
  family: ["family", "nature", "culture"],
  friends: ["food", "shopping", "culture"],
  luxury: ["luxury", "heritage", "architecture"],
  heritage: ["heritage", "architecture", "culture"],
  photography: ["photography", "architecture", "nature"],
  food: ["food", "shopping", "culture"],
};

function scorePlace(place: TrailPlace, prefs: TripPreferences): number {
  let score = 0;
  for (const interest of prefs.interests) {
    if (place.categories.includes(interest)) score += 3;
  }
  for (const bias of TRAVELLER_BIAS[prefs.traveller] ?? []) {
    if (place.categories.includes(bias)) score += 2;
  }
  if (prefs.pace === "relaxed" && place.durationHours <= 1.5) score += 1;
  if (prefs.pace === "explorer" && place.durationHours >= 1.5) score += 1;
  return score;
}

function buildTimesForDay(count: number, startHour = 7): string[] {
  const times: string[] = [];
  let minutes = startHour * 60;
  for (let i = 0; i < count; i++) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const hour12 = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? "PM" : "AM";
    times.push(
      `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`,
    );
    minutes += prefsGap(count);
  }
  return times;
}

function prefsGap(count: number): number {
  if (count <= 4) return 120;
  if (count <= 6) return 90;
  return 75;
}

function pickPlacesForDay(
  dayIndex: number,
  prefs: TripPreferences,
  used: Set<string>,
): string[] {
  const all = Object.values(TRAIL_PLACES)
    .filter((p) => !used.has(p.id) && p.id !== "final-evening")
    .map((p) => ({ place: p, score: scorePlace(p, prefs) }))
    .sort((a, b) => b.score - a.score);

  const perDay =
    prefs.pace === "relaxed" ? 4 : prefs.pace === "explorer" ? 7 : 5;
  const anchors: string[][] = [
    ["chamundi-hill", "mysuru-palace", "devaraja-market"],
    ["karanji-lake", "lalitha-mahal", "kukkarahalli-lake"],
    ["srirangapatna", "ranganathittu", "brindavan-gardens"],
    ["jaganmohan-palace", "st-philomena", "local-shopping"],
    ["mysuru-zoo", "royal-lunch", "royal-evening"],
  ];

  const chosen: string[] = [];
  for (const id of anchors[dayIndex] ?? []) {
    if (!used.has(id) && TRAIL_PLACES[id]) chosen.push(id);
  }

  for (const { place } of all) {
    if (chosen.length >= perDay) break;
    if (chosen.includes(place.id)) continue;
    // Food bias
    if (
      prefs.interests.includes("food") &&
      !chosen.includes("royal-lunch") &&
      place.id === "royal-lunch"
    ) {
      chosen.splice(Math.min(2, chosen.length), 0, place.id);
      continue;
    }
    chosen.push(place.id);
  }

  if (dayIndex === prefs.days - 1 && !chosen.includes("final-evening")) {
    if (chosen.length >= perDay) chosen[chosen.length - 1] = "final-evening";
    else chosen.push("final-evening");
  }

  return chosen.slice(0, perDay);
}

export function buildPersonalizedTrail(prefs: TripPreferences): {
  days: TrailDay[];
  stops: TrailStop[];
} {
  const used = new Set<string>();
  const stops: TrailStop[] = [];
  const days: TrailDay[] = [];

  for (let d = 0; d < prefs.days; d++) {
    const placeIds = pickPlacesForDay(d, prefs, used);
    placeIds.forEach((id) => used.add(id));
    const times = buildTimesForDay(placeIds.length, d === 2 ? 8 : 7);
    const stopIds: string[] = [];

    placeIds.forEach((placeId, index) => {
      const stopId = `d${d + 1}-s${index + 1}`;
      stopIds.push(stopId);
      const prev = index > 0 ? getPlace(placeIds[index - 1]!) : null;
      const curr = getPlace(placeId);
      stops.push({
        id: stopId,
        placeId,
        day: d + 1,
        time: times[index]!.replace(/\s*(AM|PM)/, ""),
        timeLabel: times[index]!,
        travelFromPrevious:
          index === 0
            ? undefined
            : {
                minutes: Math.max(
                  10,
                  Math.round(
                    Math.abs(curr.distanceFromCentreKm - (prev?.distanceFromCentreKm ?? 0)) * 4 +
                      10,
                  ),
                ),
                distanceKm: Math.max(
                  0.5,
                  Math.round(
                    Math.abs(curr.distanceFromCentreKm - (prev?.distanceFromCentreKm ?? 0)) * 10,
                  ) / 10,
                ),
                mode: curr.distanceFromCentreKm > 10 ? "Drive" : "Auto",
              },
      });
    });

    const meta = DAY_THEMES[d + 1] ?? {
      title: `Day ${d + 1}`,
      theme: "Your royal passage",
    };
    days.push({ day: d + 1, title: meta.title, theme: meta.theme, stopIds });
  }

  return { days, stops };
}

export function getDefaultTrail() {
  return {
    days: DEFAULT_TRAIL_DAYS,
    stops: DEFAULT_TRAIL_STOPS,
    preferences: DEFAULT_PREFERENCES,
  };
}

export function getRecommendationsForStop(
  placeId: string,
  visitedPlaceIds: Set<string>,
  prefs: TripPreferences,
  limit = 4,
): Array<TrailRecommendation & { place: TrailPlace }> {
  const base = PLACE_RECOMMENDATIONS[placeId] ?? [];
  const scored = base
    .filter((r) => !visitedPlaceIds.has(r.placeId))
    .map((r) => {
      const place = getPlace(r.placeId);
      return {
        ...r,
        place,
        score: scorePlace(place, prefs) + (prefs.interests.some((i) => place.categories.includes(i)) ? 2 : 0),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ score: _s, ...rest }) => rest);
}

export function summarizeTrail(stops: TrailStop[]) {
  const places = stops.map((s) => getPlace(s.placeId));
  const hours = places.reduce((sum, p) => sum + p.durationHours, 0);
  const km = stops.reduce(
    (sum, s) => sum + (s.travelFromPrevious?.distanceKm ?? 0),
    0,
  );
  const categories = new Set(places.flatMap((p) => p.categories));
  const days = new Set(stops.map((s) => s.day)).size;
  return {
    days,
    experiences: stops.length,
    km: Math.round(km),
    hours: Math.round(hours),
    bestFor: Array.from(categories).slice(0, 5),
  };
}
