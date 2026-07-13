import type { Experience, Slot } from "@/data/experiences";
import { filterSlotsWithinBookingWindow } from "@/lib/booking-window";

export type SmartBadgeId =
  | "few_seats"
  | "fast_filling"
  | "best_weekend"
  | "rain_safe"
  | "morning"
  | "sunset";

export type SmartBadge = {
  id: SmartBadgeId;
  label: string;
};

const RAIN_SAFE_PATTERN =
  /\b(rain[-\s]?safe|indoor|covered|monsoon[-\s]?friendly|all[-\s]?weather|shelter)\b/i;

function parseMinutes(hhmm: string): number | null {
  const [h, m] = hhmm.slice(0, 5).split(":").map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function bookableSlots(exp: Experience): Slot[] {
  return filterSlotsWithinBookingWindow(exp.slots).filter((slot) => slot.available > 0);
}

function isWeekendDate(isoDate: string): boolean {
  const day = new Date(`${isoDate.slice(0, 10)}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

function isRainSafe(exp: Experience): boolean {
  const haystack = [...(exp.inclusions ?? []), ...(exp.requirements ?? []), exp.tagline, exp.description]
    .filter(Boolean)
    .join(" ");
  return RAIN_SAFE_PATTERN.test(haystack);
}

/**
 * Derive up to `limit` smart availability badges from live slot inventory + listing copy.
 */
export function getExperienceSmartBadges(exp: Experience, limit = 2): SmartBadge[] {
  const slots = bookableSlots(exp);
  const badges: SmartBadge[] = [];

  if (slots.length > 0) {
    const scarcest = slots.reduce((best, slot) =>
      slot.available < best.available ? slot : best,
    );
    const fillRatio =
      scarcest.capacity > 0 ? (scarcest.capacity - scarcest.available) / scarcest.capacity : 0;

    if (scarcest.available > 0 && (scarcest.available <= 3 || scarcest.available / scarcest.capacity <= 0.25)) {
      badges.push({ id: "few_seats", label: "Few seats left" });
    } else if (fillRatio >= 0.5) {
      badges.push({ id: "fast_filling", label: "Fast filling" });
    }

    if (slots.some((slot) => isWeekendDate(slot.date))) {
      badges.push({ id: "best_weekend", label: "Best weekend" });
    }

    const starts = slots
      .map((slot) => parseMinutes(slot.start))
      .filter((minutes): minutes is number => minutes != null);
    if (starts.length > 0) {
      const allMorning = starts.every((minutes) => minutes < 12 * 60);
      const allSunset = starts.every((minutes) => minutes >= 16 * 60 && minutes < 19 * 60 + 30);
      if (allMorning) badges.push({ id: "morning", label: "Morning only" });
      else if (allSunset) badges.push({ id: "sunset", label: "Sunset only" });
    }
  }

  if (isRainSafe(exp)) {
    badges.push({ id: "rain_safe", label: "Rain-safe" });
  }

  const priority: SmartBadgeId[] = [
    "few_seats",
    "fast_filling",
    "morning",
    "sunset",
    "best_weekend",
    "rain_safe",
  ];

  const ranked = priority
    .map((id) => badges.find((badge) => badge.id === id))
    .filter((badge): badge is SmartBadge => Boolean(badge));

  return ranked.slice(0, limit);
}
