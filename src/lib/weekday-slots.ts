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
  return expandWeekdaySchedule({
    weekdays: params.weekdays,
    fromDate: params.fromDate,
    toDate: params.toDate,
    sessions: [
      {
        startTime: params.startTime,
        endTime: params.endTime,
        capacity: params.capacity,
      },
    ],
  });
}

export type SessionBlockInput = {
  startTime: string;
  endTime: string;
  capacity: number;
};

export function expandWeekdaySchedule(params: {
  weekdays: WeekdayKey[];
  fromDate: string;
  toDate: string;
  sessions: SessionBlockInput[];
}): CreateHostSlotPayload[] {
  const jsDays = new Set(
    params.weekdays.map((key) => WEEKDAY_OPTIONS.find((d) => d.key === key)?.jsDay).filter(
      (day): day is number => day !== undefined,
    ),
  );
  if (jsDays.size === 0 || params.sessions.length === 0) return [];

  const start = parseLocalDate(params.fromDate);
  const end = parseLocalDate(params.toDate);
  if (start > end) return [];

  const slots: CreateHostSlotPayload[] = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    if (!jsDays.has(cursor.getDay())) continue;
    const slotDate = formatLocalDate(cursor);
    for (const session of params.sessions) {
      slots.push({
        slotDate,
        startTime: session.startTime,
        endTime: session.endTime,
        capacity: session.capacity,
      });
    }
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

const WEEKDAY_ORDER: WeekdayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function sortWeekdays(weekdays: WeekdayKey[]): WeekdayKey[] {
  return WEEKDAY_ORDER.filter((day) => weekdays.includes(day));
}

export function formatWeekdayLabels(weekdays: WeekdayKey[]): string {
  const sorted = sortWeekdays(weekdays);
  if (sorted.length === 0) return "No days selected";
  if (sorted.length === 7) return "Every day";

  const labels = sorted.map((key) => WEEKDAY_OPTIONS.find((d) => d.key === key)?.label ?? key);
  if (sorted.join(",") === "mon,tue,wed,thu,fri") return "Monday–Friday";
  if (sorted.join(",") === "sat,sun") return "Saturday & Sunday";

  return labels.join(", ");
}

export function formatTime12h(time24: string): string {
  const [hourPart, minutePart] = time24.split(":");
  const hour = Number.parseInt(hourPart ?? "0", 10);
  const minute = Number.parseInt(minutePart ?? "0", 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time24;

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function formatDateReadable(isoDate: string): string {
  const date = parseLocalDate(isoDate);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export type SchedulePreview = {
  count: number;
  weekdayLabel: string;
  timeLabel: string;
  dateRangeLabel: string;
  sampleDates: string[];
  isValid: boolean;
  validationMessage: string | null;
};

export function buildSchedulePreview(params: {
  weekdays: WeekdayKey[];
  fromDate: string;
  toDate: string;
  sessions: SessionBlockInput[];
}): SchedulePreview {
  const weekdayLabel = formatWeekdayLabels(params.weekdays);
  const timeLabel = params.sessions
    .map(
      (session) =>
        `${formatTime12h(session.startTime)} – ${formatTime12h(session.endTime)} (${session.capacity} guests)`,
    )
    .join(" · ");
  const dateRangeLabel =
    params.fromDate && params.toDate
      ? `${formatDateReadable(params.fromDate)} → ${formatDateReadable(params.toDate)}`
      : "Choose a date range";

  if (params.weekdays.length === 0) {
    return {
      count: 0,
      weekdayLabel,
      timeLabel,
      dateRangeLabel,
      sampleDates: [],
      isValid: false,
      validationMessage: "Select at least one weekday.",
    };
  }
  if (!params.fromDate || !params.toDate) {
    return {
      count: 0,
      weekdayLabel,
      timeLabel,
      dateRangeLabel,
      isValid: false,
      validationMessage: "Choose the first and last dates.",
    };
  }
  if (params.fromDate > params.toDate) {
    return {
      count: 0,
      weekdayLabel,
      timeLabel,
      dateRangeLabel,
      isValid: false,
      validationMessage: "Last date must be on or after the first date.",
    };
  }
  if (params.sessions.length === 0) {
    return {
      count: 0,
      weekdayLabel,
      timeLabel,
      dateRangeLabel,
      isValid: false,
      validationMessage: "Add at least one session time.",
    };
  }

  for (const session of params.sessions) {
    if (session.startTime >= session.endTime) {
      return {
        count: 0,
        weekdayLabel,
        timeLabel,
        dateRangeLabel,
        isValid: false,
        validationMessage: "Each session must end after it starts.",
      };
    }
    if (session.capacity < 1) {
      return {
        count: 0,
        weekdayLabel,
        timeLabel,
        dateRangeLabel,
        isValid: false,
        validationMessage: "Capacity must be at least 1 guest per session.",
      };
    }
  }

  const slots = expandWeekdaySchedule(params);
  if (slots.length === 0) {
    return {
      count: 0,
      weekdayLabel,
      timeLabel,
      dateRangeLabel,
      isValid: false,
      validationMessage: "No sessions match these weekdays in the selected date range.",
    };
  }

  return {
    count: slots.length,
    weekdayLabel,
    timeLabel,
    dateRangeLabel,
    sampleDates: slots.slice(0, 4).map((slot) => {
      const time = `${formatTime12h(slot.startTime)} – ${formatTime12h(slot.endTime)}`;
      return `${formatDateReadable(slot.slotDate)} · ${time}`;
    }),
    isValid: true,
    validationMessage: null,
  };
}
