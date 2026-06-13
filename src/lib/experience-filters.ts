import type { Experience } from "@/data/experiences";
import { filterSlotsWithinBookingWindow, isWithinBookingWindow } from "@/lib/booking-window";

export type ExperienceSearch = {
  category?: string;
  city?: string;
  q?: string;
  duration?: "short" | "half" | "full" | "multi";
  availability?: "today" | "tomorrow" | "week" | "weekend";
  page?: number;
};

export const PAGE_SIZE = 9;

/** True when the experience has at least one open slot in the booking window. */
export function hasBookableSlot(exp: Experience): boolean {
  return filterSlotsWithinBookingWindow(exp.slots).some((slot) => slot.available > 0);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function slotDate(slotDate: string): Date {
  return startOfDay(new Date(slotDate.slice(0, 10)));
}

function hasAvailableSlot(exp: Experience, predicate: (d: Date) => boolean): boolean {
  return exp.slots.some((s) => s.available > 0 && predicate(slotDate(s.date)));
}

function matchesDuration(hours: number, duration?: ExperienceSearch["duration"]): boolean {
  if (!duration) return true;
  if (duration === "short") return hours <= 2;
  if (duration === "half") return hours > 2 && hours <= 5;
  if (duration === "full") return hours > 5 && hours <= 10;
  return hours > 10;
}

function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function matchesAvailability(exp: Experience, availability?: ExperienceSearch["availability"]): boolean {
  if (!availability) return true;
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 6);

  if (availability === "today") {
    return hasAvailableSlot(exp, (d) => d.getTime() === today.getTime());
  }
  if (availability === "tomorrow") {
    return hasAvailableSlot(exp, (d) => d.getTime() === tomorrow.getTime());
  }
  if (availability === "week") {
    return hasAvailableSlot(exp, (d) => isWithinBookingWindow(formatLocalDate(d)));
  }
  const day = today.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  const sat = new Date(today);
  sat.setDate(sat.getDate() + daysUntilSaturday);
  const sun = new Date(sat);
  sun.setDate(sun.getDate() + 1);
  return hasAvailableSlot(
    exp,
    (d) => d.getTime() === sat.getTime() || d.getTime() === sun.getTime(),
  );
}

export function filterExperiences(
  experiences: Experience[],
  search: ExperienceSearch,
  cityOptions: { slug: string; name: string }[],
): Experience[] {
  const q = search.q?.trim().toLowerCase();

  return experiences.filter((e) => {
    if (!hasBookableSlot(e)) return false;

    if (search.category && e.category !== search.category) return false;

    if (search.city) {
      const citySlug = search.city.toLowerCase();
      const matchesSlug = e.citySlug === citySlug;
      const cityRow = cityOptions.find((c) => c.slug === citySlug);
      const matchesName =
        e.city.toLowerCase() === citySlug ||
        (cityRow ? e.city.toLowerCase() === cityRow.name.toLowerCase() : false);
      if (!matchesSlug && !matchesName) return false;
    }

    if (q) {
      const haystack = [e.title, e.tagline, e.description, e.city, e.category, e.hostName]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (!matchesDuration(e.durationHours, search.duration)) return false;
    if (!matchesAvailability(e, search.availability)) return false;

    return true;
  });
}

export function paginateExperiences<T>(items: T[], page = 1, pageSize = PAGE_SIZE): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPages(count: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(count / pageSize));
}
