import { useEffect, useMemo, useState } from "react";
import type { CreateHostSlotPayload } from "@/lib/api/host-experiences";
import { bookingWindowEndIso } from "@/lib/booking-window";
import { isoToWeekdayKey } from "@/lib/slot-week-overview";
import {
  buildSchedulePreview,
  DEFAULT_WEEKDAYS,
  expandWeekdaySlots,
  formatDateReadable,
  formatTime12h,
  WEEKDAY_OPTIONS,
  type WeekdayKey,
} from "@/lib/weekday-slots";

type WeekdaySlotBuilderProps = {
  busy?: boolean;
  focusDateIso?: string | null;
  onAddSlots: (slots: CreateHostSlotPayload[]) => void;
};

const fieldClass =
  "mt-1.5 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.45)] bg-[oklch(0.14_0.05_22_/_0.85)] px-3 py-2.5 text-sm text-ink [color-scheme:dark]";

const WEEKDAY_PRESETS: { label: string; days: WeekdayKey[] }[] = [
  { label: "Mon–Fri", days: ["mon", "tue", "wed", "thu", "fri"] },
  { label: "Weekends", days: ["sat", "sun"] },
  { label: "Every day", days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] },
];

function formatToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function WeekdaySlotBuilder({
  busy = false,
  focusDateIso = null,
  onAddSlots,
}: WeekdaySlotBuilderProps) {
  const today = useMemo(() => formatToday(), []);
  const windowEnd = useMemo(() => bookingWindowEndIso(today), [today]);
  const [weekdays, setWeekdays] = useState<WeekdayKey[]>(DEFAULT_WEEKDAYS);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [capacity, setCapacity] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!focusDateIso) return;
    setWeekdays([isoToWeekdayKey(focusDateIso)]);
    setSuccess(null);
    setError(null);
  }, [focusDateIso]);

  const preview = useMemo(
    () =>
      buildSchedulePreview({
        weekdays,
        fromDate: today,
        toDate: windowEnd,
        startTime,
        endTime,
        capacity,
      }),
    [capacity, endTime, startTime, today, weekdays, windowEnd],
  );

  const toggleWeekday = (key: WeekdayKey) => {
    setSuccess(null);
    setWeekdays((prev) =>
      prev.includes(key) ? prev.filter((day) => day !== key) : [...prev, key],
    );
  };

  const applyPreset = (days: WeekdayKey[]) => {
    setSuccess(null);
    setWeekdays(days);
  };

  const handleGenerate = () => {
    if (!preview.isValid) {
      setError(preview.validationMessage);
      setSuccess(null);
      return;
    }

    const slots = expandWeekdaySlots({
      weekdays,
      fromDate: today,
      toDate: windowEnd,
      startTime,
      endTime,
      capacity,
    });

    setError(null);
    setSuccess(
      `Added ${slots.length} session${slots.length === 1 ? "" : "s"} (${preview.timeLabel}).`,
    );
    onAddSlots(slots);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-ink">Which days?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {WEEKDAY_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={busy}
              onClick={() => applyPreset(preset.days)}
              className="rounded-sm border border-ember/40 px-3 py-1.5 text-xs font-medium text-ember hover:bg-ember/10 disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {WEEKDAY_OPTIONS.map((day) => {
            const active = weekdays.includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                disabled={busy}
                onClick={() => toggleWeekday(day.key)}
                className={`min-w-[3.25rem] rounded-sm border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] disabled:opacity-50 ${
                  active
                    ? "border-ember/70 bg-ember/15 text-ember"
                    : "border-[oklch(0.88_0.08_86_/_0.3)] text-muted-foreground hover:border-ember/35"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="eyebrow text-muted-foreground">Starts</span>
          <input
            type="time"
            value={startTime}
            disabled={busy}
            onChange={(e) => {
              setSuccess(null);
              setStartTime(e.target.value);
            }}
            className={fieldClass}
          />
          <span className="mt-1 block text-[0.68rem] text-muted-foreground">
            {formatTime12h(startTime)}
          </span>
        </label>
        <label className="block text-sm">
          <span className="eyebrow text-muted-foreground">Ends</span>
          <input
            type="time"
            value={endTime}
            disabled={busy}
            onChange={(e) => {
              setSuccess(null);
              setEndTime(e.target.value);
            }}
            className={fieldClass}
          />
          <span className="mt-1 block text-[0.68rem] text-muted-foreground">
            {formatTime12h(endTime)}
          </span>
        </label>
        <label className="block text-sm">
          <span className="eyebrow text-muted-foreground">Guests</span>
          <input
            type="number"
            min={1}
            max={100}
            value={capacity}
            disabled={busy}
            onChange={(e) => {
              setSuccess(null);
              setCapacity(Number(e.target.value));
            }}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="rounded-md border border-ember/30 bg-ember/8 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Will create </span>
        <span className="font-display text-lg text-ember">
          {preview.count > 0 ? preview.count : "—"}
        </span>
        <span className="text-muted-foreground">
          {" "}
          session{preview.count === 1 ? "" : "s"} · {preview.weekdayLabel} ·{" "}
          {formatDateReadable(today)} – {formatDateReadable(windowEnd)}
        </span>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-300/90">{success}</p> : null}

      <button
        type="button"
        disabled={busy || !preview.isValid || preview.count === 0}
        onClick={handleGenerate}
        className="rounded-sm bg-ember px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] hover:bg-ember/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {preview.count > 0
          ? `Add ${preview.count} session${preview.count === 1 ? "" : "s"}`
          : "Add sessions"}
      </button>
    </div>
  );
}
