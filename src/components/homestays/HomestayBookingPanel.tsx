import { Minus, Plus } from "lucide-react";
import { PayAtHomestayBadge } from "@/components/homestays/PayAtHomestayBadge";
import type { Homestay } from "@/data/homestays";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { formatTime12h } from "@/lib/weekday-slots";

type HomestayBookingPanelProps = {
  stay: Homestay;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes: string;
  nights: number;
  totalMinor: number;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onGuestsChange: (value: number) => void;
  onNotesChange: (value: string) => void;
  onConfirm?: () => void;
  busy?: boolean;
  error?: string | null;
  hideActions?: boolean;
  bookable?: boolean;
};

export function HomestayBookingPanel({
  stay,
  checkIn,
  checkOut,
  guests,
  notes,
  nights,
  totalMinor,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onNotesChange,
  onConfirm,
  busy = false,
  error = null,
  hideActions = false,
  bookable = true,
}: HomestayBookingPanelProps) {
  const sym = stay.currencySymbol ?? "₹";
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow luxury-panel-label mb-2">Your stay</div>
        <p className="luxury-panel-body text-xs leading-relaxed">
          Check-in from {formatTime12h(stay.checkInTime)} · Check-out by {formatTime12h(stay.checkOutTime)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow luxury-panel-label mb-2 block">Check-in</span>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(event) => onCheckInChange(event.target.value)}
            className="w-full rounded-sm border border-[rgb(88_16_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body focus:border-brand-maroon-deep/50 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="eyebrow luxury-panel-label mb-2 block">Check-out</span>
          <input
            type="date"
            min={checkIn}
            value={checkOut}
            onChange={(event) => onCheckOutChange(event.target.value)}
            className="w-full rounded-sm border border-[rgb(88_16_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body focus:border-brand-maroon-deep/50 focus:outline-none"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div>
          <div className="eyebrow luxury-panel-label">Guests</div>
          <p className="luxury-panel-body mt-1 text-xs">Up to {stay.maxGuests} guests</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Decrease guest count"
            disabled={guests <= 1}
            onClick={() => onGuestsChange(Math.max(1, guests - 1))}
            className="inline-flex h-9 w-9 items-center justify-center text-brand-maroon-deep/80 transition-colors hover:text-brand-maroon-deep disabled:opacity-35"
          >
            <Minus className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <span className="w-8 text-center font-display text-2xl text-brand-maroon-deep">{guests}</span>
          <button
            type="button"
            aria-label="Increase guest count"
            disabled={guests >= stay.maxGuests}
            onClick={() => onGuestsChange(Math.min(stay.maxGuests, guests + 1))}
            className="inline-flex h-9 w-9 items-center justify-center text-brand-maroon-deep/80 transition-colors hover:text-brand-maroon-deep disabled:opacity-35"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div>
        <h2 className="eyebrow luxury-panel-label mb-3">Notes (optional)</h2>
        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          rows={3}
          placeholder="Arrival time, dietary needs, or special requests…"
          className="w-full resize-none rounded-sm border border-[rgb(88_16_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body placeholder:text-[rgb(27_23_22/0.4)] focus:border-brand-maroon-deep/50 focus:outline-none"
        />
      </div>

      <div className="hairline" />

      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow luxury-panel-label">Estimated total</div>
          <div className="luxury-panel-body mt-1 text-xs">
            {sym}
            {stay.pricePerNight.toLocaleString("en-IN")} × {nights} night{nights === 1 ? "" : "s"}
          </div>
          {checkIn && checkOut ? (
            <div className="luxury-panel-body mt-1 text-xs">
              {formatDateLong(checkIn)} → {formatDateLong(checkOut)}
            </div>
          ) : null}
        </div>
        <div className="font-display text-3xl tracking-tight text-brand-maroon-deep">
          {formatMoney(totalMinor, sym)}
        </div>
      </div>

      <PayAtHomestayBadge surface="light" />

      {!bookable ? (
        <p className="rounded-sm border border-[rgb(88_16_0/0.2)] bg-[rgb(255_255_255/0.45)] px-4 py-3 text-sm luxury-panel-body">
          Live booking opens once homestay listings are published in the database. Browse the property
          details below for now.
        </p>
      ) : null}

      {error && !hideActions ? <p className="text-sm text-destructive">{error}</p> : null}

      {hideActions || !bookable ? null : (
        <>
          <button
            type="button"
            disabled={busy || nights < 1}
            onClick={() => onConfirm?.()}
            className="luxury-btn-sm luxury-btn-primary w-full disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Request stay"}
          </button>
          <p className="luxury-panel-body text-center text-[0.65rem] tracking-wide">
            Your host will confirm. Pay the full amount in cash at check-in.
          </p>
        </>
      )}
    </div>
  );
}
