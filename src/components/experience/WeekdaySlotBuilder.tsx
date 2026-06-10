import { useMemo, useState } from "react";
import type { CreateHostSlotPayload } from "@/lib/api/host-experiences";
import {
  addDays,
  DEFAULT_WEEKDAYS,
  expandWeekdaySlots,
  WEEKDAY_OPTIONS,
  type WeekdayKey,
} from "@/lib/weekday-slots";

type WeekdaySlotBuilderProps = {
  busy?: boolean;
  onAddSlots: (slots: CreateHostSlotPayload[]) => void;
};

const inputClass =
  "mt-1 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm";

export function WeekdaySlotBuilder({ busy = false, onAddSlots }: WeekdaySlotBuilderProps) {
  const today = useMemo(() => formatToday(), []);
  const [weekdays, setWeekdays] = useState<WeekdayKey[]>(DEFAULT_WEEKDAYS);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(addDays(today, 56));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [capacity, setCapacity] = useState(8);
  const [error, setError] = useState<string | null>(null);

  const toggleWeekday = (key: WeekdayKey) => {
    setWeekdays((prev) =>
      prev.includes(key) ? prev.filter((day) => day !== key) : [...prev, key],
    );
  };

  const handleGenerate = () => {
    if (weekdays.length === 0) {
      setError("Select at least one weekday.");
      return;
    }
    if (!fromDate || !toDate) {
      setError("Choose a date range.");
      return;
    }
    if (fromDate > toDate) {
      setError("End date must be on or after the start date.");
      return;
    }
    if (startTime >= endTime) {
      setError("End time must be after start time.");
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
    if (slots.length === 0) {
      setError("No slots match the selected weekdays in this date range.");
      return;
    }

    setError(null);
    onAddSlots(slots);
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="eyebrow text-muted-foreground">Weekdays</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {WEEKDAY_OPTIONS.map((day) => {
            const active = weekdays.includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                disabled={busy}
                onClick={() => toggleWeekday(day.key)}
                className={`rounded-sm border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] disabled:opacity-50 ${
                  active
                    ? "border-ember/70 bg-ember/10 text-ember"
                    : "border-[oklch(0.88_0.08_86_/_0.25)] text-muted-foreground"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          <span className="eyebrow text-muted-foreground">From</span>
          <input
            type="date"
            value={fromDate}
            min={today}
            onChange={(e) => setFromDate(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="eyebrow text-muted-foreground">To</span>
          <input
            type="date"
            value={toDate}
            min={fromDate || today}
            onChange={(e) => setToDate(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="eyebrow text-muted-foreground">Start</span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="eyebrow text-muted-foreground">End</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm">
          <span className="eyebrow text-muted-foreground">Capacity</span>
          <input
            type="number"
            min={1}
            max={100}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className={inputClass}
          />
        </label>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Generates bookable sessions for each selected weekday between the from and to dates.
        </p>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={handleGenerate}
        className="rounded-sm border border-ember/50 px-4 py-2 text-sm hover:bg-ember/10 disabled:opacity-50"
      >
        Add weekly schedule
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
