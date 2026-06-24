import { addDays } from "@/lib/weekday-slots";
import type { BookingDateView } from "@/lib/dashboard-booking-filters";
import { formatDateShort } from "@/lib/date-format";

/** Guests may book sessions within this many calendar days starting today (inclusive). */
export const BOOKING_WINDOW_DAYS = 7;

/** Default date span in the host add-sessions form (not a scheduling cap). */
export const HOST_SCHEDULE_DEFAULT_DAYS = 30;

export function hostScheduleDefaultEndIso(fromToday = todayIsoDate()): string {
  return addDays(fromToday, HOST_SCHEDULE_DEFAULT_DAYS - 1);
}

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

function parseTimeToMinutes(time24: string | undefined): number {
  if (!time24?.trim()) return 0;
  const [hourPart, minutePart] = time24.slice(0, 5).split(":");
  const hour = Number.parseInt(hourPart ?? "0", 10);
  const minute = Number.parseInt(minutePart ?? "0", 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
  return hour * 60 + minute;
}

/** True when the slot is inside the 7-day window and has not started yet (same-day past times excluded). */
export function isGuestBookableSlot(
  slot: { date: string; start?: string },
  referenceToday = todayIsoDate(),
  now = new Date(),
): boolean {
  if (!isWithinBookingWindow(slot.date, referenceToday)) return false;
  if (!slot.start?.trim()) return true;

  const day = normalizeIsoDate(slot.date);
  const today = normalizeIsoDate(referenceToday);
  if (day > today) return true;
  if (day < today) return false;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return parseTimeToMinutes(slot.start) > nowMinutes;
}

export function isBeforeToday(isoDate: string, referenceToday = todayIsoDate()): boolean {
  return normalizeIsoDate(isoDate) < normalizeIsoDate(referenceToday);
}

export function isAfterBookingWindow(isoDate: string, referenceToday = todayIsoDate()): boolean {
  return normalizeIsoDate(isoDate) > bookingWindowEndIso(referenceToday);
}

export function filterSlotsWithinBookingWindow<T extends { date: string; start?: string }>(
  slots: T[],
  referenceToday = todayIsoDate(),
  now = new Date(),
): T[] {
  return slots.filter((slot) => isGuestBookableSlot(slot, referenceToday, now));
}

export function bookingWindowRange(referenceToday = todayIsoDate()) {
  const start = normalizeIsoDate(referenceToday);
  const end = bookingWindowEndIso(start);
  return { start, end };
}

export function formatBookingWindowRange(referenceToday = todayIsoDate()): string {
  const { start, end } = bookingWindowRange(referenceToday);
  return `${formatDateShort(start)} – ${formatDateShort(end)}`;
}

export function withGuestBookableSlots<T extends { slots: { date: string }[] }>(
  experience: T,
  referenceToday = todayIsoDate(),
): T {
  return {
    ...experience,
    slots: filterSlotsWithinBookingWindow(experience.slots, referenceToday),
  };
}

export function bookingMatchesDateView(slotDateIso: string | undefined, view: BookingDateView): boolean {
  if (!slotDateIso?.trim()) return view === "all";
  if (view === "all") return true;
  if (view === "week") return isWithinBookingWindow(slotDateIso);
  return isBeforeToday(slotDateIso);
}

export const BOOKING_WINDOW_LABEL = "Next 7 days";
