import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import type { HomestayDatePrice } from "@/data/homestays";
import { isHomestayWeekend } from "@/lib/homestay-day-pricing";
import { cn } from "@/lib/utils";

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromIsoDate(iso: string) {
  if (!iso) return undefined;
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function addDaysIso(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

type HomestayDateCalendarProps = {
  checkIn?: string;
  checkOut?: string;
  datePrices?: HomestayDatePrice[];
  blockedDates?: string[];
  currencySymbol?: string;
  onRangeChange: (checkIn: string, checkOut: string) => void;
  className?: string;
  /** When true, selecting a single day sets both ends (owner holiday pick). */
  singleNightOk?: boolean;
  /** Show custom prices under day numbers (owner pricing). */
  showDayPrices?: boolean;
  hint?: string;
};

export function HomestayDateCalendar({
  checkIn = "",
  checkOut = "",
  datePrices = [],
  blockedDates = [],
  currencySymbol = "₹",
  onRangeChange,
  className,
  singleNightOk = false,
  showDayPrices = false,
  hint,
}: HomestayDateCalendarProps) {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    return now;
  }, []);

  const [month, setMonth] = useState(() => startOfMonth(fromIsoDate(checkIn) ?? today));

  useEffect(() => {
    const selected = fromIsoDate(checkIn);
    if (!selected) return;
    setMonth((current) => {
      if (
        selected.getFullYear() === current.getFullYear() &&
        selected.getMonth() === current.getMonth()
      ) {
        return current;
      }
      return startOfMonth(selected);
    });
  }, [checkIn]);

  const calendarEndMonth = useMemo(
    () => new Date(today.getFullYear() + 2, 11, 1, 12, 0, 0, 0),
    [today],
  );

  const holidayMap = useMemo(() => {
    const map = new Map<string, HomestayDatePrice>();
    for (const entry of datePrices) {
      map.set(entry.date, entry);
    }
    return map;
  }, [datePrices]);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const holidayMatchers = useMemo(
    () =>
      datePrices.map((entry) => {
        const date = fromIsoDate(entry.date);
        return date ?? new Date(0);
      }),
    [datePrices],
  );

  const weekendMatcher = (date: Date) => isHomestayWeekend(toIsoDate(date));
  const blockedMatcher = (date: Date) => blockedSet.has(toIsoDate(date));

  const selected: DateRange | undefined = useMemo(() => {
    const from = fromIsoDate(checkIn);
    if (!from) return undefined;
    const checkout = fromIsoDate(checkOut);
    if (!checkout || checkout <= from) return { from, to: from };
    return { from, to: checkout };
  }, [checkIn, checkOut]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      onRangeChange("", "");
      return;
    }
    const fromIso = toIsoDate(range.from);
    if (!range.to || toIsoDate(range.to) === fromIso) {
      onRangeChange(fromIso, addDaysIso(fromIso, 1));
      return;
    }
    const toIso = toIsoDate(range.to);
    onRangeChange(fromIso, toIso);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Calendar
        mode="range"
        month={month}
        onMonthChange={setMonth}
        startMonth={startOfMonth(today)}
        endMonth={calendarEndMonth}
        captionLayout={showDayPrices ? "dropdown" : "label"}
        selected={selected}
        onSelect={handleSelect}
        disabled={[{ before: today }, blockedMatcher]}
        modifiers={{
          weekend: weekendMatcher,
          holiday: holidayMatchers,
        }}
        modifiersClassNames={{
          weekend: "homestay-cal-weekend",
          holiday: "homestay-cal-holiday",
        }}
        className={cn(
          "w-full rounded-sm border border-[rgb(74_0_0/0.12)] bg-[rgb(255_248_230/0.5)]",
          showDayPrices
            ? "[--cell-size:3.1rem] sm:[--cell-size:3.35rem]"
            : "[--cell-size:2.45rem] sm:[--cell-size:2.7rem]",
        )}
        classNames={{
          root: "w-full",
          months: "w-full",
          month: "w-full gap-3",
          nav: "relative flex w-full items-center justify-between gap-2",
          button_previous: cn(
            "h-9 w-9 rounded-sm border border-[rgb(74_0_0/0.18)] bg-[rgb(255_255_255/0.55)] text-[#8B4A2B]",
            "hover:bg-[rgb(200_162_90/0.22)] hover:text-[#5C2E12] disabled:opacity-35",
          ),
          button_next: cn(
            "h-9 w-9 rounded-sm border border-[rgb(74_0_0/0.18)] bg-[rgb(255_255_255/0.55)] text-[#8B4A2B]",
            "hover:bg-[rgb(200_162_90/0.22)] hover:text-[#5C2E12] disabled:opacity-35",
          ),
          month_caption: "flex h-10 w-full items-center justify-center px-10",
          caption_label: "font-display text-sm tracking-[0.08em] text-[#5C2E12]",
          dropdowns: "flex items-center justify-center gap-2",
          dropdown_root:
            "rounded-sm border border-[rgb(74_0_0/0.18)] bg-[rgb(255_255_255/0.7)] text-[#5C2E12] shadow-none",
          dropdown: "cursor-pointer bg-transparent text-[#5C2E12]",
        }}
        components={{
          DayButton: ({ day, modifiers, className: dayClassName, ...props }) => {
            const iso = toIsoDate(day.date);
            const holiday = holidayMap.get(iso);
            const weekend = modifiers.weekend && !holiday;
            return (
              <button
                type="button"
                data-day={iso}
                className={cn(
                  "relative flex h-full w-full min-w-(--cell-size) flex-col items-center justify-center gap-0.5 rounded-md p-0.5 text-sm leading-none transition-colors",
                  "hover:bg-[rgb(200_162_90/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]/60",
                  modifiers.selected && "bg-[#C8A25A] text-[#3B2208] hover:bg-[#C8A25A]",
                  modifiers.range_middle &&
                    !modifiers.range_start &&
                    !modifiers.range_end &&
                    "rounded-none bg-[rgb(200_162_90/0.28)] text-[#3B2208]",
                  modifiers.disabled && "pointer-events-none opacity-35",
                  !modifiers.selected && weekend && "text-[#8B4A2B]",
                  !modifiers.selected && holiday && "font-semibold text-[#8B1E1E]",
                  dayClassName,
                )}
                title={
                  holiday
                    ? `${holiday.label ?? "Custom price"} · ${currencySymbol}${holiday.pricePerNight.toLocaleString("en-IN")}/night`
                    : weekend
                      ? "Weekend"
                      : undefined
                }
                {...props}
              >
                <span>{day.date.getDate()}</span>
                {showDayPrices && holiday ? (
                  <span
                    className={cn(
                      "max-w-full truncate px-0.5 text-[0.52rem] leading-none",
                      modifiers.selected ? "text-[#3B2208]/90" : "text-[#8B1E1E]",
                    )}
                  >
                    {currencySymbol}
                    {holiday.pricePerNight >= 1000
                      ? `${Math.round(holiday.pricePerNight / 1000)}k`
                      : holiday.pricePerNight}
                  </span>
                ) : holiday ? (
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full",
                      modifiers.selected ? "bg-[#3B2208]" : "bg-[#B33A3A]",
                    )}
                    aria-hidden
                  />
                ) : weekend ? (
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full",
                      modifiers.selected ? "bg-[#3B2208]/70" : "bg-[#C47A4A]",
                    )}
                    aria-hidden
                  />
                ) : (
                  <span className={showDayPrices ? "h-3" : "h-1 w-1"} aria-hidden />
                )}
              </button>
            );
          },
        }}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.7rem] text-[rgb(74_0_0/0.72)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#C47A4A]" aria-hidden />
          Weekend
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#B33A3A]" aria-hidden />
          Custom / holiday price
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[#C8A25A]" aria-hidden />
          Selected
        </span>
      </div>

      {hint ? (
        <p className="text-xs text-[rgb(74_0_0/0.75)]">{hint}</p>
      ) : checkIn ? (
        <p className="text-xs text-[rgb(74_0_0/0.75)]">
          {checkOut && checkOut > checkIn
            ? `Selected: ${checkIn} → ${checkOut}`
            : singleNightOk
              ? `Selected night: ${checkIn}. Tap another day to expand the range, or set a custom price below.`
              : `Check-in ${checkIn} · tap a second date for check-out`}
        </p>
      ) : (
        <p className="text-xs text-[rgb(74_0_0/0.75)]">
          {singleNightOk
            ? "Tap any day to set a custom price for that night, or drag a range."
            : "Tap a start date, then an end date to book."}
        </p>
      )}
    </div>
  );
}
