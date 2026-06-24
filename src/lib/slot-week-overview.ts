import type { HostSlotDetail } from "@/lib/api/host-experiences";
import { bookingWindowEndIso, todayIsoDate } from "@/lib/booking-window";
import { addDays } from "@/lib/weekday-slots";

export type WeekDayOverview = {
  iso: string;
  weekdayShort: string;
  dayNumber: number;
  isToday: boolean;
  slots: HostSlotDetail[];
  hasSessions: boolean;
  isBlockedOnly: boolean;
};

function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function buildBookingWindowDays(
  slots: HostSlotDetail[],
  referenceToday = todayIsoDate(),
): WeekDayOverview[] {
  let end = bookingWindowEndIso(referenceToday);
  const byDate = new Map<string, HostSlotDetail[]>();

  for (const slot of slots) {
    const day = slot.date.slice(0, 10);
    if (day >= referenceToday && day > end) {
      end = day;
    }
    const list = byDate.get(day) ?? [];
    list.push(slot);
    byDate.set(day, list);
  }

  const days: WeekDayOverview[] = [];
  for (let cursor = referenceToday; cursor <= end; cursor = addDays(cursor, 1)) {
    const daySlots = byDate.get(cursor) ?? [];
    const date = parseLocalDate(cursor);
    const activeSlots = daySlots.filter((slot) => !slot.isBlocked);

    days.push({
      iso: cursor,
      weekdayShort: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      dayNumber: date.getDate(),
      isToday: cursor === referenceToday,
      slots: daySlots,
      hasSessions: activeSlots.length > 0,
      isBlockedOnly: daySlots.length > 0 && activeSlots.length === 0,
    });
  }

  return days;
}

export function isoToWeekdayKey(iso: string): "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun" {
  const jsDay = parseLocalDate(iso).getDay();
  const map: Record<number, "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat"> = {
    0: "sun",
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
    6: "sat",
  };
  return map[jsDay] ?? "mon";
}
