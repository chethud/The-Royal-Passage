import { useState } from "react";
import type { OwnerHomestayDetail } from "@/lib/api/owner-homestays";
import { formatDateLong } from "@/lib/date-format";

type OwnerAvailabilityManagerProps = {
  homestay: OwnerHomestayDetail;
  busy?: boolean;
  onUpsert: (payload: {
    date: string;
    isBlocked: boolean;
    note?: string;
  }) => Promise<void>;
  onDelete: (availabilityId: string) => Promise<void>;
};

function isBlockedEntry(entry: OwnerHomestayDetail["availability"][number]) {
  return entry.isBlocked;
}

export function OwnerAvailabilityManager({
  homestay,
  busy = false,
  onUpsert,
  onDelete,
}: OwnerAvailabilityManagerProps) {
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const blockedEntries = homestay.availability.filter(isBlockedEntry);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onUpsert({
      date,
      isBlocked: true,
      note: note.trim() || undefined,
    });
    setDate("");
    setNote("");
  };

  return (
    <div className="space-y-6">
      <p className="luxury-panel-body text-sm">
        Block dates when the property is unavailable. Use the Holiday pricing tab to raise rates on
        special dates.
      </p>

      <ul className="divide-y luxury-panel-divider">
        {blockedEntries.length === 0 ? (
          <li className="luxury-panel-body py-4 text-sm">No blocked dates yet.</li>
        ) : (
          blockedEntries.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="luxury-panel-heading font-medium">{formatDateLong(entry.date)}</p>
                <p className="luxury-panel-body text-xs">
                  Blocked{entry.note ? ` · ${entry.note}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="luxury-btn-sm luxury-btn-panel-outline"
                disabled={busy}
                onClick={() => void onDelete(entry.id)}
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="grid gap-3 border-t luxury-panel-divider pt-6 md:grid-cols-3"
      >
        <input
          className="luxury-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={busy}
        />
        <input
          className="luxury-input md:col-span-2"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={busy}
        />
        <button type="submit" className="luxury-btn-sm luxury-btn-primary md:col-span-3 md:w-fit" disabled={busy}>
          Block date
        </button>
      </form>
    </div>
  );
}
