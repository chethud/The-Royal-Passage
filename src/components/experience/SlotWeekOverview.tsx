import type { WeekDayOverview } from "@/lib/slot-week-overview";
import { formatTime12h } from "@/lib/weekday-slots";

type SlotWeekOverviewProps = {
  days: WeekDayOverview[];
  selectedIso: string | null;
  onSelectDay: (iso: string) => void;
};

export function SlotWeekOverview({ days, selectedIso, onSelectDay }: SlotWeekOverviewProps) {
  const filled = days.filter((day) => day.hasSessions).length;
  const open = days.length - filled;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-[#D4AF6A]/90">Your booking window</p>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-ink">{filled}</span> day{filled === 1 ? "" : "s"}{" "}
            with sessions ·{" "}
            <span className="font-medium text-ink">{open}</span> open day{open === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ember" aria-hidden />
            Has session
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-dashed border-[oklch(0.88_0.08_86_/_0.45)]" aria-hidden />
            No session yet
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((day) => {
          const selected = selectedIso === day.iso;
          const activeSlots = day.slots.filter((slot) => !slot.isBlocked);

          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => onSelectDay(day.iso)}
              className={`rounded-md border px-3 py-3 text-left transition-colors ${
                selected
                  ? "border-ember/80 bg-ember/12 ring-1 ring-ember/35"
                  : day.hasSessions
                    ? "border-ember/45 bg-ember/8 hover:border-ember/60"
                    : day.isBlockedOnly
                      ? "border-destructive/35 bg-destructive/5 hover:border-destructive/50"
                      : "border-dashed border-[oklch(0.88_0.08_86_/_0.35)] bg-background/5 hover:border-ember/35"
              }`}
            >
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {day.weekdayShort}
                {day.isToday ? (
                  <span className="ml-1 text-ember">· Today</span>
                ) : null}
              </div>
              <div className="mt-1 font-display text-2xl leading-none text-ink">{day.dayNumber}</div>

              {day.hasSessions ? (
                <div className="mt-2 space-y-1 text-[0.68rem] leading-snug text-ink/90">
                  {activeSlots.slice(0, 2).map((slot) => (
                      <p key={slot.id}>
                        {formatTime12h(slot.start)} – {formatTime12h(slot.end)}
                      </p>
                    ))}
                  <p className="text-muted-foreground">
                    {activeSlots.length > 1
                      ? `${activeSlots.length} sessions`
                      : `${activeSlots[0]?.available ?? 0} spots left`}
                  </p>
                </div>
              ) : day.isBlockedOnly ? (
                <p className="mt-2 text-[0.68rem] text-destructive/90">Blocked</p>
              ) : (
                <p className="mt-2 text-[0.68rem] text-muted-foreground">No session</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
