import { parseTime24h, toTime24h } from "@/lib/weekday-slots";

type Time12hFieldProps = {
  value: string;
  onChange: (value24: string) => void;
  disabled?: boolean;
  className?: string;
};

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

const selectClass =
  "w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.45)] bg-[oklch(0.14_0.05_22_/_0.85)] px-2 py-2.5 text-sm text-ink [color-scheme:dark]";

export function Time12hField({ value, onChange, disabled = false, className }: Time12hFieldProps) {
  const { hour12, minute, period } = parseTime24h(value);

  const update = (next: Partial<{ hour12: number; minute: number; period: "AM" | "PM" }>) => {
    onChange(
      toTime24h(
        next.hour12 ?? hour12,
        next.minute ?? minute,
        next.period ?? period,
      ),
    );
  };

  return (
    <div className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 ${className ?? ""}`}>
      <select
        value={hour12}
        disabled={disabled}
        onChange={(e) => update({ hour12: Number(e.target.value) })}
        className={selectClass}
        aria-label="Hour"
      >
        {HOURS.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <select
        value={minute}
        disabled={disabled}
        onChange={(e) => update({ minute: Number(e.target.value) })}
        className={selectClass}
        aria-label="Minute"
      >
        {MINUTES.map((min) => (
          <option key={min} value={min}>
            {String(min).padStart(2, "0")}
          </option>
        ))}
      </select>
      <select
        value={period}
        disabled={disabled}
        onChange={(e) => update({ period: e.target.value as "AM" | "PM" })}
        className={`${selectClass} min-w-[4.5rem]`}
        aria-label="AM or PM"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
