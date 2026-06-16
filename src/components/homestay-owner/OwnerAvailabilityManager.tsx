import { useState } from "react";
import type { OwnerHomestayDetail } from "@/lib/api/owner-homestays";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney, parseRupeeMajorInput } from "@/lib/money";

type OwnerAvailabilityManagerProps = {
  homestay: OwnerHomestayDetail;
  busy?: boolean;
  onUpsert: (payload: {
    date: string;
    roomId?: string;
    isBlocked: boolean;
    priceOverrideMinor?: number;
    note?: string;
  }) => Promise<void>;
  onDelete: (availabilityId: string) => Promise<void>;
};

export function OwnerAvailabilityManager({
  homestay,
  busy = false,
  onUpsert,
  onDelete,
}: OwnerAvailabilityManagerProps) {
  const [date, setDate] = useState("");
  const [isBlocked, setIsBlocked] = useState(true);
  const [priceMajor, setPriceMajor] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const priceMinor = parseRupeeMajorInput(priceMajor);
    await onUpsert({
      date,
      isBlocked,
      priceOverrideMinor: !isBlocked && priceMinor > 0 ? priceMinor * 100 : undefined,
      note: note.trim() || undefined,
    });
    setDate("");
    setPriceMajor("");
    setNote("");
  };

  return (
    <div className="space-y-6">
      <p className="luxury-panel-body text-sm">
        Block dates or set seasonal pricing overrides for the next 120 days.
      </p>

      <ul className="divide-y luxury-panel-divider">
        {homestay.availability.length === 0 ? (
          <li className="luxury-panel-body py-4 text-sm">No calendar overrides yet.</li>
        ) : (
          homestay.availability.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="luxury-panel-heading font-medium">{formatDateLong(entry.date)}</p>
                <p className="luxury-panel-body text-xs">
                  {entry.isBlocked
                    ? "Blocked"
                    : entry.priceOverrideMinor
                      ? `Price override ${formatMoney(entry.priceOverrideMinor, homestay.currencySymbol)}`
                      : "Open"}
                  {entry.note ? ` · ${entry.note}` : ""}
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

      <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-3 border-t luxury-panel-divider pt-6 md:grid-cols-4">
        <input
          className="luxury-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={busy}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isBlocked}
            onChange={(e) => setIsBlocked(e.target.checked)}
            disabled={busy}
          />
          Block date
        </label>
        {!isBlocked ? (
          <input
            className="luxury-input"
            placeholder="Override price (₹)"
            value={priceMajor}
            onChange={(e) => setPriceMajor(e.target.value)}
            disabled={busy}
          />
        ) : (
          <div />
        )}
        <input
          className="luxury-input"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={busy}
        />
        <button type="submit" className="luxury-btn-sm luxury-btn-primary md:col-span-1" disabled={busy}>
          Save date
        </button>
      </form>
    </div>
  );
}
