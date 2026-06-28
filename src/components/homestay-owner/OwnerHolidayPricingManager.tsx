import { useMemo, useState } from "react";
import type { OwnerHomestayDetail } from "@/lib/api/owner-homestays";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney, parseRupeeMajorInput } from "@/lib/money";
import { eachNightBetween } from "@/lib/homestay-day-pricing";

const HOLIDAY_TYPES = [
  "Government holiday",
  "Festival / long holiday",
  "Peak season",
  "Custom",
] as const;

type HolidayType = (typeof HOLIDAY_TYPES)[number];

type OwnerHolidayPricingManagerProps = {
  homestay: OwnerHomestayDetail;
  busy?: boolean;
  onUpsert: (payload: {
    date: string;
    isBlocked: boolean;
    priceOverrideMinor?: number;
    note?: string;
  }) => Promise<void>;
  onDelete: (availabilityId: string) => Promise<void>;
};

function isHolidayPriceEntry(entry: OwnerHomestayDetail["availability"][number]) {
  return !entry.isBlocked && Boolean(entry.priceOverrideMinor);
}

export function OwnerHolidayPricingManager({
  homestay,
  busy = false,
  onUpsert,
  onDelete,
}: OwnerHolidayPricingManagerProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [holidayType, setHolidayType] = useState<HolidayType>("Government holiday");
  const [customLabel, setCustomLabel] = useState("");
  const [priceMajor, setPriceMajor] = useState("");
  const [savingRange, setSavingRange] = useState(false);

  const holidayEntries = useMemo(
    () =>
      homestay.availability
        .filter(isHolidayPriceEntry)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [homestay.availability],
  );

  const resolvedLabel =
    holidayType === "Custom" ? customLabel.trim() || "Custom holiday" : holidayType;

  const dayAfter = (isoDate: string) => {
    const next = new Date(`${isoDate}T12:00:00`);
    next.setDate(next.getDate() + 1);
    return next.toISOString().slice(0, 10);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const priceMinor = parseRupeeMajorInput(priceMajor);
    if (priceMinor <= 0) return;

    const rangeEnd = endDate && endDate >= startDate ? endDate : startDate;
    const nights = eachNightBetween(startDate, dayAfter(rangeEnd));
    if (nights.length === 0) return;

    setSavingRange(true);
    try {
      for (const night of nights) {
        await onUpsert({
          date: night,
          isBlocked: false,
          priceOverrideMinor: priceMinor * 100,
          note: resolvedLabel,
        });
      }
      setStartDate("");
      setEndDate("");
      setPriceMajor("");
      setCustomLabel("");
    } finally {
      setSavingRange(false);
    }
  };

  const sym = homestay.currencySymbol ?? "₹";
  const disabled = busy || savingRange;

  return (
    <div className="space-y-6">
      <p className="luxury-panel-body text-sm leading-relaxed">
        Set higher nightly rates for government holidays, festivals, and other special dates.
        These prices override weekday and weekend rates for the selected nights.
      </p>

      <ul className="divide-y luxury-panel-divider">
        {holidayEntries.length === 0 ? (
          <li className="luxury-panel-body py-4 text-sm">No holiday prices set yet.</li>
        ) : (
          holidayEntries.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="luxury-panel-heading font-medium">{formatDateLong(entry.date)}</p>
                <p className="luxury-panel-body text-xs">
                  {formatMoney(entry.priceOverrideMinor ?? 0, sym)} / night
                  {entry.note ? ` · ${entry.note}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="luxury-btn-sm luxury-btn-panel-outline"
                disabled={disabled}
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
        className="grid gap-4 border-t luxury-panel-divider pt-6 md:grid-cols-2"
      >
        <label className="block">
          <span className="eyebrow luxury-panel-label mb-2 block">Start date</span>
          <input
            className="luxury-input w-full"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            disabled={disabled}
          />
        </label>
        <label className="block">
          <span className="eyebrow luxury-panel-label mb-2 block">End date (optional)</span>
          <input
            className="luxury-input w-full"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={disabled}
          />
          <p className="luxury-panel-body mt-1 text-xs">Leave blank for a single night.</p>
        </label>

        <label className="block md:col-span-2">
          <span className="eyebrow luxury-panel-label mb-2 block">Holiday type</span>
          <select
            className="luxury-input w-full"
            value={holidayType}
            onChange={(e) => setHolidayType(e.target.value as HolidayType)}
            disabled={disabled}
          >
            {HOLIDAY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        {holidayType === "Custom" ? (
          <label className="block md:col-span-2">
            <span className="eyebrow luxury-panel-label mb-2 block">Custom label</span>
            <input
              className="luxury-input w-full"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g. Dasara week"
              disabled={disabled}
            />
          </label>
        ) : null}

        <label className="block">
          <span className="eyebrow luxury-panel-label mb-2 block">Price per night (₹)</span>
          <input
            className="luxury-input w-full"
            placeholder="e.g. 6500"
            value={priceMajor}
            onChange={(e) => setPriceMajor(e.target.value)}
            required
            disabled={disabled}
          />
        </label>

        <div className="flex items-end">
          <button type="submit" className="luxury-btn-sm luxury-btn-primary w-full" disabled={disabled}>
            {savingRange ? "Saving…" : "Save holiday price"}
          </button>
        </div>
      </form>
    </div>
  );
}
