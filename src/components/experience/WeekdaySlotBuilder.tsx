import { CalendarDays, Clock3, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { CreateHostSlotPayload } from "@/lib/api/host-experiences";
import {
  buildSchedulePreview,
  DEFAULT_WEEKDAYS,
  expandWeekdaySlots,
  formatDateReadable,
  formatTime12h,
  WEEKDAY_OPTIONS,
  type WeekdayKey,
} from "@/lib/weekday-slots";
import { BOOKING_WINDOW_DAYS, bookingWindowEndIso } from "@/lib/booking-window";

type WeekdaySlotBuilderProps = {
  busy?: boolean;
  onAddSlots: (slots: CreateHostSlotPayload[]) => void;
};

const fieldClass =
  "mt-1.5 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.45)] bg-[oklch(0.14_0.05_22_/_0.85)] px-3 py-2.5 text-sm text-ink [color-scheme:dark]";

const WEEKDAY_PRESETS: { label: string; days: WeekdayKey[] }[] = [
  { label: "Mon–Fri", days: ["mon", "tue", "wed", "thu", "fri"] },
  { label: "Weekends", days: ["sat", "sun"] },
  { label: "Every day", days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] },
];

export function WeekdaySlotBuilder({ busy = false, onAddSlots }: WeekdaySlotBuilderProps) {
  const today = useMemo(() => formatToday(), []);
  const windowEnd = useMemo(() => bookingWindowEndIso(today), [today]);
  const [weekdays, setWeekdays] = useState<WeekdayKey[]>(DEFAULT_WEEKDAYS);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(windowEnd);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [capacity, setCapacity] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const preview = useMemo(
    () =>
      buildSchedulePreview({
        weekdays,
        fromDate,
        toDate,
        startTime,
        endTime,
        capacity,
      }),
    [capacity, endTime, fromDate, startTime, toDate, weekdays],
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
      fromDate,
      toDate,
      startTime,
      endTime,
      capacity,
    });

    setError(null);
    setSuccess(
      `Added ${slots.length} session${slots.length === 1 ? "" : "s"}: ${preview.weekdayLabel}, ${preview.timeLabel}.`,
    );
    onAddSlots(slots);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] bg-background/10 p-4 sm:p-5">
        <h4 className="font-display text-base text-ink">1. Which days does this session run?</h4>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Select the weekdays when guests can book this experience. Use a quick preset or pick days
          individually.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
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
      </section>

      <section className="rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] bg-background/10 p-4 sm:p-5">
        <div className="flex items-start gap-2">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden />
          <div className="min-w-0 flex-1">
            <h4 className="font-display text-base text-ink">2. When can guests book?</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Guests can only book within the next {BOOKING_WINDOW_DAYS} days. Set dates from today
              through {formatDateReadable(windowEnd)}.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="eyebrow text-muted-foreground">First bookable date</span>
            <input
              type="date"
              value={fromDate}
              min={today}
              max={windowEnd}
              disabled={busy}
              onChange={(e) => {
                setSuccess(null);
                const next = e.target.value;
                setFromDate(next);
                if (next > toDate) setToDate(next);
              }}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm">
            <span className="eyebrow text-muted-foreground">Last bookable date</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || today}
              max={windowEnd}
              onChange={(e) => {
                setSuccess(null);
                setToDate(e.target.value);
              }}
              className={fieldClass}
            />
          </label>
        </div>
      </section>

      <section className="rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] bg-background/10 p-4 sm:p-5">
        <div className="flex items-start gap-2">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden />
          <div className="min-w-0 flex-1">
            <h4 className="font-display text-base text-ink">3. What time is each session?</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              On every selected weekday, one session opens at the start time and ends at the end
              time.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="eyebrow text-muted-foreground">Session starts</span>
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
            <span className="eyebrow text-muted-foreground">Session ends</span>
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
        </div>
      </section>

      <section className="rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] bg-background/10 p-4 sm:p-5">
        <div className="flex items-start gap-2">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden />
          <div className="min-w-0 flex-1">
            <h4 className="font-display text-base text-ink">4. How many guests per session?</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Maximum number of guests who can book each generated session.
            </p>
          </div>
        </div>

        <label className="mt-4 block max-w-xs text-sm">
          <span className="eyebrow text-muted-foreground">Capacity (guests)</span>
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
      </section>

      <div className="rounded-md border border-ember/35 bg-ember/8 p-4 sm:p-5">
        <p className="eyebrow text-ember">Schedule preview</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">Days</dt>
            <dd className="font-medium text-ink">{preview.weekdayLabel}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">Date range</dt>
            <dd className="text-right font-medium text-ink">{preview.dateRangeLabel}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">Session time</dt>
            <dd className="font-medium text-ink">{preview.timeLabel}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">Guests per session</dt>
            <dd className="font-medium text-ink">{capacity}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-ember/20 pt-2">
            <dt className="text-muted-foreground">Sessions to create</dt>
            <dd className="font-display text-lg text-ember">
              {preview.count > 0 ? preview.count : "—"}
            </dd>
          </div>
        </dl>

        {preview.sampleDates.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Example dates:</p>
            <ul className="mt-2 space-y-1 text-sm text-ink/90">
              {preview.sampleDates.map((date) => (
                <li key={date}>
                  {date} · {preview.timeLabel}
                </li>
              ))}
              {preview.count > preview.sampleDates.length ? (
                <li className="text-xs text-muted-foreground">
                  …and {preview.count - preview.sampleDates.length} more
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
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
          ? `Add ${preview.count} session${preview.count === 1 ? "" : "s"} to schedule`
          : "Add sessions to schedule"}
      </button>
    </div>
  );
}

function formatToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
