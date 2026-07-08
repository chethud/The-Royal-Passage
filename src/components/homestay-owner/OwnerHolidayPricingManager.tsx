import { useEffect, useMemo, useState } from "react";
import { HomestayDateCalendar } from "@/components/homestays/HomestayDateCalendar";
import type { HomestayDatePrice } from "@/data/homestays";
import type { OwnerHomestayDetail } from "@/lib/api/owner-homestays";
import { formatDateLong } from "@/lib/date-format";
import { eachNightBetween } from "@/lib/homestay-day-pricing";
import { formatMoney, parseRupeeMajorInput } from "@/lib/money";

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

function dayAfter(isoDate: string) {
  const next = new Date(`${isoDate}T12:00:00`);
  next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10);
}

function lastNightFromExclusiveCheckout(checkIn: string, checkOut: string) {
  if (!checkIn) return "";
  if (!checkOut || checkOut <= checkIn) return checkIn;
  const last = new Date(`${checkOut}T12:00:00`);
  last.setDate(last.getDate() - 1);
  return last.toISOString().slice(0, 10);
}

export function OwnerHolidayPricingManager({
  homestay,
  busy = false,
  onUpsert,
  onDelete,
}: OwnerHolidayPricingManagerProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [holidayType, setHolidayType] = useState<HolidayType>("Custom");
  const [customLabel, setCustomLabel] = useState("");
  const [priceMajor, setPriceMajor] = useState("");
  const [savingRange, setSavingRange] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlinePrice, setInlinePrice] = useState("");
  const [inlineLabel, setInlineLabel] = useState("");
  const [inlineBusy, setInlineBusy] = useState(false);

  const holidayEntries = useMemo(
    () =>
      homestay.availability
        .filter(isHolidayPriceEntry)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [homestay.availability],
  );

  const datePrices: HomestayDatePrice[] = useMemo(
    () =>
      holidayEntries.map((entry) => ({
        date: entry.date,
        pricePerNight: Math.round((entry.priceOverrideMinor ?? 0) / 100),
        label: entry.note ?? undefined,
      })),
    [holidayEntries],
  );

  const blockedDates = useMemo(
    () => homestay.availability.filter((entry) => entry.isBlocked).map((entry) => entry.date),
    [homestay.availability],
  );

  const selectedNights = useMemo(() => {
    if (!startDate) return [] as string[];
    const rangeEnd = endDate && endDate >= startDate ? endDate : startDate;
    return eachNightBetween(startDate, dayAfter(rangeEnd));
  }, [startDate, endDate]);

  const isSingleNight = selectedNights.length === 1;

  const resolvedLabel = (() => {
    if (holidayType === "Custom") {
      return customLabel.trim() || (isSingleNight ? "Custom day price" : "Custom holiday");
    }
    return holidayType;
  })();

  // When selecting a single existing priced day, prefill the form for quick edit.
  useEffect(() => {
    if (!isSingleNight || !startDate) return;
    const existing = holidayEntries.find((entry) => entry.date === startDate);
    if (!existing) return;
    setPriceMajor(String(Math.round((existing.priceOverrideMinor ?? 0) / 100)));
    const note = existing.note?.trim() ?? "";
    if (note && !(HOLIDAY_TYPES as readonly string[]).includes(note)) {
      setHolidayType("Custom");
      setCustomLabel(note);
    } else if ((HOLIDAY_TYPES as readonly string[]).includes(note)) {
      setHolidayType(note as HolidayType);
      setCustomLabel("");
    }
  }, [isSingleNight, startDate, holidayEntries]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const priceMinor = parseRupeeMajorInput(priceMajor);
    if (priceMinor <= 0 || selectedNights.length === 0) return;

    setSavingRange(true);
    try {
      for (const night of selectedNights) {
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

  const handleInlineSave = async (entry: OwnerHomestayDetail["availability"][number]) => {
    const priceMinor = parseRupeeMajorInput(inlinePrice);
    if (priceMinor <= 0) return;
    setInlineBusy(true);
    try {
      await onUpsert({
        date: entry.date,
        isBlocked: false,
        priceOverrideMinor: priceMinor * 100,
        note: inlineLabel.trim() || entry.note || "Custom day price",
      });
      setEditingId(null);
      setInlinePrice("");
      setInlineLabel("");
    } finally {
      setInlineBusy(false);
    }
  };

  const sym = homestay.currencySymbol ?? "₹";
  const disabled = busy || savingRange;
  const checkoutExclusive =
    startDate && endDate && endDate >= startDate
      ? dayAfter(endDate)
      : startDate
        ? dayAfter(startDate)
        : "";

  return (
    <div className="space-y-6">
      <p className="luxury-panel-body text-sm leading-relaxed">
        Set a custom price for any single night or a full date range. These prices override weekday
        and weekend rates for the selected nights.
      </p>

      <div>
        <h3 className="eyebrow luxury-panel-label mb-2">Custom pricing calendar</h3>
        <p className="luxury-panel-body mb-3 text-xs leading-relaxed">
          Tap one day to price that night only, or select a range. Saved custom prices show on the
          calendar.
        </p>
        <HomestayDateCalendar
          checkIn={startDate}
          checkOut={checkoutExclusive}
          datePrices={datePrices}
          blockedDates={blockedDates}
          currencySymbol={sym}
          singleNightOk
          showDayPrices
          onRangeChange={(nextCheckIn, nextCheckOut) => {
            setStartDate(nextCheckIn);
            setEndDate(lastNightFromExclusiveCheckout(nextCheckIn, nextCheckOut));
          }}
        />
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="grid gap-4 rounded-sm border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.35)] p-4 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <h3 className="eyebrow luxury-panel-label">
            {selectedNights.length === 0
              ? "Set price"
              : isSingleNight
                ? `Custom price for ${formatDateLong(selectedNights[0]!)}`
                : `Custom price for ${selectedNights.length} nights`}
          </h3>
          {selectedNights.length > 1 ? (
            <p className="luxury-panel-body mt-1 text-xs">
              {formatDateLong(selectedNights[0]!)} → {formatDateLong(selectedNights[selectedNights.length - 1]!)}
            </p>
          ) : null}
        </div>

        <label className="block">
          <span className="eyebrow luxury-panel-label mb-2 block">Start date</span>
          <input
            className="luxury-input w-full"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
            }}
            required
            disabled={disabled}
          />
        </label>
        <label className="block">
          <span className="eyebrow luxury-panel-label mb-2 block">End date</span>
          <input
            className="luxury-input w-full"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={disabled}
          />
          <p className="luxury-panel-body mt-1 text-xs">
            Same as start date = single night. Different date = full range.
          </p>
        </label>

        <label className="block md:col-span-2">
          <span className="eyebrow luxury-panel-label mb-2 block">Price label</span>
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
            <span className="eyebrow luxury-panel-label mb-2 block">Custom label (optional)</span>
            <input
              className="luxury-input w-full"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g. Dasara special, Friday only, Concert night"
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

        <div className="flex flex-wrap items-end gap-2">
          <button
            type="submit"
            className="luxury-btn-sm luxury-btn-primary flex-1"
            disabled={disabled || selectedNights.length === 0}
          >
            {savingRange
              ? "Saving…"
              : isSingleNight
                ? "Save this day"
                : `Save ${selectedNights.length || ""} nights`}
          </button>
          {startDate ? (
            <button
              type="button"
              className="luxury-btn-sm luxury-btn-panel-outline"
              disabled={disabled}
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPriceMajor("");
                setCustomLabel("");
              }}
            >
              Clear
            </button>
          ) : null}
        </div>
      </form>

      <div>
        <h3 className="eyebrow luxury-panel-label mb-2">Saved custom day prices</h3>
        <ul className="divide-y luxury-panel-divider">
          {holidayEntries.length === 0 ? (
            <li className="luxury-panel-body py-4 text-sm">
              No custom prices yet. Tap any day on the calendar to start.
            </li>
          ) : (
            holidayEntries.map((entry) => {
              const editing = editingId === entry.id;
              return (
                <li key={entry.id} className="space-y-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="luxury-panel-heading font-medium">{formatDateLong(entry.date)}</p>
                      <p className="luxury-panel-body text-xs">
                        {formatMoney(entry.priceOverrideMinor ?? 0, sym)} / night
                        {entry.note ? ` · ${entry.note}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="luxury-btn-sm luxury-btn-panel-outline"
                        disabled={disabled || inlineBusy}
                        onClick={() => {
                          setStartDate(entry.date);
                          setEndDate(entry.date);
                          setEditingId(editing ? null : entry.id);
                          setInlinePrice(String(Math.round((entry.priceOverrideMinor ?? 0) / 100)));
                          setInlineLabel(entry.note ?? "");
                        }}
                      >
                        {editing ? "Cancel" : "Edit day"}
                      </button>
                      <button
                        type="button"
                        className="luxury-btn-sm luxury-btn-panel-outline"
                        disabled={disabled || inlineBusy}
                        onClick={() => void onDelete(entry.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {editing ? (
                    <div className="grid gap-3 rounded-sm border border-[rgb(74_0_0/0.1)] bg-[rgb(255_248_230/0.45)] p-3 md:grid-cols-[1fr_1fr_auto]">
                      <label className="block">
                        <span className="eyebrow luxury-panel-label mb-1 block text-[0.65rem]">
                          Price (₹)
                        </span>
                        <input
                          className="luxury-input w-full"
                          value={inlinePrice}
                          onChange={(e) => setInlinePrice(e.target.value)}
                          disabled={inlineBusy}
                        />
                      </label>
                      <label className="block">
                        <span className="eyebrow luxury-panel-label mb-1 block text-[0.65rem]">
                          Label
                        </span>
                        <input
                          className="luxury-input w-full"
                          value={inlineLabel}
                          onChange={(e) => setInlineLabel(e.target.value)}
                          placeholder="Optional label"
                          disabled={inlineBusy}
                        />
                      </label>
                      <div className="flex items-end">
                        <button
                          type="button"
                          className="luxury-btn-sm luxury-btn-primary w-full"
                          disabled={inlineBusy}
                          onClick={() => void handleInlineSave(entry)}
                        >
                          {inlineBusy ? "Saving…" : "Update"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
