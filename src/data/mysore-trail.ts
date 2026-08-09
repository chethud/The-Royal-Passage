export type TrailStop = {
  id: string;
  time: string;
  title: string;
  note: string;
};

export type TrailDay = {
  id: string;
  label: string;
  theme: string;
  stops: TrailStop[];
};

export type MysoreTrailItinerary = {
  title: string;
  subtitle: string;
  days: TrailDay[];
};

export const MYSORE_TRAIL_SETTING_KEY = "mysore_trail";
export const MYSORE_TRAIL_STORAGE_KEY = "trp.mysore-trail.itinerary.v1";

function stopId() {
  return `stop-${Math.random().toString(36).slice(2, 9)}`;
}

function dayId() {
  return `day-${Math.random().toString(36).slice(2, 9)}`;
}

/** Canonical published starter — editors/admins update this for all visitors. */
export const DEFAULT_MYSORE_TRAIL: MysoreTrailItinerary = {
  title: "Mysore Trail",
  subtitle: "A slow passage through palace streets, hill temples, and host kitchens.",
  days: [
    {
      id: "day-royal-heart",
      label: "Day 1",
      theme: "Royal heart",
      stops: [
        {
          id: "stop-palace",
          time: "09:30",
          title: "Mysuru Palace",
          note: "Morning light on the Ambavilas facade — walk the grounds before the crowds thicken.",
        },
        {
          id: "stop-lunch",
          time: "13:00",
          title: "Heritage lunch",
          note: "Book a host-led dining experience near the old city.",
        },
        {
          id: "stop-market",
          time: "17:30",
          title: "Devaraja Market",
          note: "Spice lanes, silk, and marigold — an unhurried dusk walk.",
        },
      ],
    },
    {
      id: "day-hills-craft",
      label: "Day 2",
      theme: "Hills & craft",
      stops: [
        {
          id: "stop-chamundi",
          time: "07:00",
          title: "Chamundi Hills",
          note: "Sunrise at the summit temple, then descend with the city waking below.",
        },
        {
          id: "stop-workshop",
          time: "11:00",
          title: "Artisan workshop",
          note: "Pottery, weaving, or outdoor cooking — pick one curated experience.",
        },
        {
          id: "stop-homestay",
          time: "19:00",
          title: "Homestay evening",
          note: "Settle into a Mysuru stay and share the day's stories with your hosts.",
        },
      ],
    },
  ],
};

export function createEmptyStop(): TrailStop {
  return { id: stopId(), time: "10:00", title: "", note: "" };
}

export function createEmptyDay(index: number): TrailDay {
  return {
    id: dayId(),
    label: `Day ${index}`,
    theme: "",
    stops: [createEmptyStop()],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Normalize DB / client payloads into a safe itinerary. */
export function normalizeMysoreTrail(raw: unknown): MysoreTrailItinerary {
  if (!isRecord(raw)) return structuredClone(DEFAULT_MYSORE_TRAIL);

  const title =
    typeof raw.title === "string" && raw.title.trim()
      ? raw.title.trim().slice(0, 120)
      : DEFAULT_MYSORE_TRAIL.title;
  const subtitle =
    typeof raw.subtitle === "string" ? raw.subtitle.trim().slice(0, 400) : DEFAULT_MYSORE_TRAIL.subtitle;

  const daysRaw = Array.isArray(raw.days) ? raw.days : [];
  const days: TrailDay[] = [];

  for (const dayRaw of daysRaw) {
    if (!isRecord(dayRaw)) continue;
    const stopsRaw = Array.isArray(dayRaw.stops) ? dayRaw.stops : [];
    const stops: TrailStop[] = [];
    for (const stopRaw of stopsRaw) {
      if (!isRecord(stopRaw)) continue;
      stops.push({
        id: typeof stopRaw.id === "string" && stopRaw.id ? stopRaw.id : stopId(),
        time: typeof stopRaw.time === "string" && stopRaw.time ? stopRaw.time : "10:00",
        title: typeof stopRaw.title === "string" ? stopRaw.title.slice(0, 120) : "",
        note: typeof stopRaw.note === "string" ? stopRaw.note.slice(0, 500) : "",
      });
    }
    if (stops.length === 0) stops.push(createEmptyStop());
    days.push({
      id: typeof dayRaw.id === "string" && dayRaw.id ? dayRaw.id : dayId(),
      label:
        typeof dayRaw.label === "string" && dayRaw.label.trim()
          ? dayRaw.label.trim().slice(0, 60)
          : `Day ${days.length + 1}`,
      theme: typeof dayRaw.theme === "string" ? dayRaw.theme.slice(0, 80) : "",
      stops,
    });
  }

  if (days.length === 0) return structuredClone(DEFAULT_MYSORE_TRAIL);
  return { title, subtitle, days };
}
