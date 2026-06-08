import { useState } from "react";
import type { HostSlotDetail } from "@/lib/api/host-experiences";
import { formatDateLong } from "@/lib/date-format";

type SlotManagerProps = {
  slots: HostSlotDetail[];
  busy: boolean;
  onAdd: (payload: {
    slotDate: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }) => void;
  onToggleBlock: (slotId: string, isBlocked: boolean) => void;
  onDelete: (slotId: string) => void;
};

export function SlotManager({ slots, busy, onAdd, onToggleBlock, onDelete }: SlotManagerProps) {
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [capacity, setCapacity] = useState(8);

  const btn =
    "rounded-sm border px-2 py-1 text-xs disabled:opacity-50 hover:border-ember/50";

  return (
    <section className="space-y-6">
      <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5">
        <h3 className="font-display text-xl">Add slot</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="eyebrow text-muted-foreground">Date</span>
            <input
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="mt-1 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="eyebrow text-muted-foreground">Start</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="eyebrow text-muted-foreground">End</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2"
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
              className="mt-1 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy || !slotDate}
          className="mt-4 rounded-sm bg-ember px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          onClick={() =>
            onAdd({ slotDate, startTime, endTime: endTime, capacity })
          }
        >
          Add slot
        </button>
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">No slots yet. Add your first session above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-[oklch(0.88_0.08_86_/_0.2)] text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Capacity</th>
                <th className="px-3 py-2">Sold</th>
                <th className="px-3 py-2">Available</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id} className="border-b border-[oklch(0.88_0.08_86_/_0.1)]">
                  <td className="px-3 py-3">{formatDateLong(slot.date)}</td>
                  <td className="px-3 py-3">
                    {slot.start} – {slot.end}
                  </td>
                  <td className="px-3 py-3">{slot.capacity}</td>
                  <td className="px-3 py-3">{slot.seatsSold}</td>
                  <td className="px-3 py-3">{slot.isBlocked ? "Blocked" : slot.available}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        className={btn}
                        onClick={() => onToggleBlock(slot.id, !slot.isBlocked)}
                      >
                        {slot.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        type="button"
                        disabled={busy || slot.seatsSold > 0}
                        className={`${btn} border-destructive/40 text-destructive`}
                        onClick={() => onDelete(slot.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
