import type { CreateHostSlotPayload } from "@/lib/api/host-experiences";
import type { HostSlotDetail } from "@/lib/api/host-experiences";
import { SlotWeekOverview } from "@/components/experience/SlotWeekOverview";
import { WeekdaySlotBuilder } from "@/components/experience/WeekdaySlotBuilder";
import { bookingMatchesDateView } from "@/lib/booking-window";
import { formatDateLong } from "@/lib/date-format";
import { buildBookingWindowDays } from "@/lib/slot-week-overview";
import { formatTime12h } from "@/lib/weekday-slots";
import { useEffect, useMemo, useState } from "react";

type SlotManagerProps = {
  slots: HostSlotDetail[];
  busy: boolean;
  onAddMany: (payloads: CreateHostSlotPayload[]) => void;
  onToggleBlock: (slotId: string, isBlocked: boolean) => void;
  onDelete: (slotId: string) => void;
};

export function SlotManager({
  slots,
  busy,
  onAddMany,
  onToggleBlock,
  onDelete,
}: SlotManagerProps) {
  const weekDays = useMemo(() => buildBookingWindowDays(slots), [slots]);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [showAddForm, setShowAddForm] = useState(() => weekDays.every((day) => !day.hasSessions));

  useEffect(() => {
    if (selectedIso && weekDays.some((day) => day.iso === selectedIso)) return;
    const firstWithSession = weekDays.find((day) => day.hasSessions);
    setSelectedIso(firstWithSession?.iso ?? weekDays[0]?.iso ?? null);
  }, [selectedIso, weekDays]);

  const selectedDay = weekDays.find((day) => day.iso === selectedIso) ?? null;
  const pastSlots = useMemo(
    () => slots.filter((slot) => bookingMatchesDateView(slot.date, "history")),
    [slots],
  );

  const actionBtn =
    "rounded-sm border px-3 py-1.5 text-xs disabled:opacity-50 hover:border-ember/50";

  return (
    <section className="space-y-8">
      <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5 sm:p-6">
        <SlotWeekOverview
          days={weekDays}
          selectedIso={selectedIso}
          onSelectDay={setSelectedIso}
        />

        {selectedDay ? (
          <div className="mt-6 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-6">
            <h4 className="font-display text-lg text-ink">
              {formatDateLong(selectedDay.iso)}
            </h4>

            {selectedDay.slots.length === 0 ? (
              <div className="mt-3 rounded-md border border-dashed border-[oklch(0.88_0.08_86_/_0.3)] bg-background/5 px-4 py-5">
                <p className="text-sm text-muted-foreground">
                  No session on this day yet. Use the form below to add one.
                </p>
                <button
                  type="button"
                  className="mt-3 text-sm font-medium text-ember hover:underline"
                  onClick={() => setShowAddForm(true)}
                >
                  Add a session for {selectedDay.weekdayShort} →
                </button>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {selectedDay.slots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[oklch(0.88_0.08_86_/_0.2)] bg-background/10 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-ink">
                        {formatTime12h(slot.start)} – {formatTime12h(slot.end)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {slot.isBlocked
                          ? "Blocked — not bookable"
                          : `${slot.available} of ${slot.capacity} spots available · ${slot.seatsSold} booked`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        className={actionBtn}
                        onClick={() => onToggleBlock(slot.id, !slot.isBlocked)}
                      >
                        {slot.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        type="button"
                        disabled={busy || slot.seatsSold > 0}
                        className={`${actionBtn} border-destructive/40 text-destructive`}
                        onClick={() => onDelete(slot.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl text-ink">Add sessions</h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Choose dates and weekdays, add one or more session times per day, then confirm.
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-ember hover:underline"
            onClick={() => setShowAddForm((open) => !open)}
          >
            {showAddForm ? "Hide form" : "Show form"}
          </button>
        </div>

        {showAddForm ? (
          <div className="mt-5 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-5">
            <WeekdaySlotBuilder
              busy={busy}
              focusDateIso={selectedDay?.hasSessions ? null : selectedIso}
              onAddSlots={onAddMany}
            />
          </div>
        ) : null}
      </div>

      {pastSlots.length > 0 ? (
        <div className="rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 text-left"
            onClick={() => setShowPast((open) => !open)}
          >
            <span className="font-display text-lg text-ink">Past sessions ({pastSlots.length})</span>
            <span className="text-sm text-muted-foreground">{showPast ? "Hide" : "Show"}</span>
          </button>

          {showPast ? (
            <ul className="mt-4 space-y-2 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-4 text-sm text-muted-foreground">
              {pastSlots.map((slot) => (
                <li key={slot.id}>
                  {formatDateLong(slot.date)} · {formatTime12h(slot.start)} –{" "}
                  {formatTime12h(slot.end)}
                  {slot.seatsSold > 0 ? ` · ${slot.seatsSold} guest${slot.seatsSold === 1 ? "" : "s"}` : ""}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
