import type { CreateHostSlotPayload } from "@/lib/api/host-experiences";
import type { HostSlotDetail } from "@/lib/api/host-experiences";
import { WeekdaySlotBuilder } from "@/components/experience/WeekdaySlotBuilder";
import { formatDateLong } from "@/lib/date-format";

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
  const btn =
    "rounded-sm border px-2 py-1 text-xs disabled:opacity-50 hover:border-ember/50";

  return (
    <section className="space-y-6">
      <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5">
        <h3 className="font-display text-xl">Weekly schedule</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select weekdays such as Monday–Friday, choose a date range, and generate bookable
          sessions in bulk.
        </p>
        <div className="mt-4">
          <WeekdaySlotBuilder busy={busy} onAddSlots={onAddMany} />
        </div>
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">No slots yet. Add your first weekly schedule above.</p>
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
