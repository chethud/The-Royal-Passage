import { addDays } from "@/lib/weekday-slots";
import type { BookingDateView } from "@/lib/dashboard-booking-filters";

/** Guests may book sessions within this many calendar days starting today (inclusive). */
export const BOOKING_WINDOW_DAYS = 7;

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIsoDate(): string {
  return formatLocalDate(new Date());
}

export function bookingWindowEndIso(fromToday = todayIsoDate()): string {
  return addDays(fromToday, BOOKING_WINDOW_DAYS - 1);
}

export function normalizeIsoDate(isoDate: string): string {
  return isoDate.slice(0, 10);
}

export function isWithinBookingWindow(isoDate: string, referenceToday = todayIsoDate()): boolean {
  const day = normalizeIsoDate(isoDate);
  const start = normalizeIsoDate(referenceToday);
  const end = bookingWindowEndIso(start);
  return day >= start && day <= end;
}

export function isBeforeToday(isoDate: string, referenceToday = todayIsoDate()): boolean {
  return normalizeIsoDate(isoDate) < normalizeIsoDate(referenceToday);
}

export function isAfterBookingWindow(isoDate: string, referenceToday = todayIsoDate()): boolean {
  return normalizeIsoDate(isoDate) > bookingWindowEndIso(referenceToday);
}

export function filterSlotsWithinBookingWindow<T extends { date: string }>(slots: T[]): T[] {
  return slots.filter((slot) => isWithinBookingWindow(slot.date));
}

export function withGuestBookableSlots<T extends { slots: { date: string }[] }>(experience: T): T {
  return {
    ...experience,
    slots: filterSlotsWithinBookingWindow(experience.slots),
  };
}

export function bookingMatchesDateView(slotDateIso: string | undefined, view: BookingDateView): boolean {
  if (!slotDateIso?.trim()) return view === "all";
  if (view === "all") return true;
  if (view === "week") return isWithinBookingWindow(slotDateIso);
  return isBeforeToday(slotDateIso);
}

export const BOOKING_WINDOW_LABEL = "Next 7 days";
