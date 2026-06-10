import type { CreateHostSlotPayload } from "@/lib/api/host-experiences";

export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEKDAY_OPTIONS: { key: WeekdayKey; label: string; jsDay: number }[] = [
  { key: "mon", label: "Mon", jsDay: 1 },
  { key: "tue", label: "Tue", jsDay: 2 },
  { key: "wed", label: "Wed", jsDay: 3 },
  { key: "thu", label: "Thu", jsDay: 4 },
  { key: "fri", label: "Fri", jsDay: 5 },
  { key: "sat", label: "Sat", jsDay: 6 },
  { key: "sun", label: "Sun", jsDay: 0 },
];

export const DEFAULT_WEEKDAYS: WeekdayKey[] = ["mon", "tue", "wed", "thu", "fri"];

function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(isoDate: string, days: number): string {
  const date = parseLocalDate(isoDate);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

export function expandWeekdaySlots(params: {
  weekdays: WeekdayKey[];
  fromDate: string;
  toDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
}): CreateHostSlotPayload[] {
  const jsDays = new Set(
    params.weekdays.map((key) => WEEKDAY_OPTIONS.find((d) => d.key === key)?.jsDay).filter(
      (day): day is number => day !== undefined,
    ),
  );
  if (jsDays.size === 0) return [];

  const start = parseLocalDate(params.fromDate);
  const end = parseLocalDate(params.toDate);
  if (start > end) return [];

  const slots: CreateHostSlotPayload[] = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    if (!jsDays.has(cursor.getDay())) continue;
    slots.push({
      slotDate: formatLocalDate(cursor),
      startTime: params.startTime,
      endTime: params.endTime,
      capacity: params.capacity,
    });
  }
  return slots;
}

export function mergeUniqueSlots(
  existing: CreateHostSlotPayload[],
  incoming: CreateHostSlotPayload[],
): CreateHostSlotPayload[] {
  const seen = new Set(
    existing.map((slot) => `${slot.slotDate}|${slot.startTime}|${slot.endTime}`),
  );
  const merged = [...existing];
  for (const slot of incoming) {
    const key = `${slot.slotDate}|${slot.startTime}|${slot.endTime}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(slot);
  }
  return merged;
}
