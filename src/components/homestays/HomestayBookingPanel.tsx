import { Minus, Plus } from "lucide-react";
import { PayAtHomestayBadge } from "@/components/homestays/PayAtHomestayBadge";
import type { Homestay } from "@/data/homestays";
import { formatDateLong } from "@/lib/date-format";
import { getActiveRooms, extraBedsPerRoomForSelection } from "@/lib/homestay-room-pricing";
import { formatMoney } from "@/lib/money";
import { formatTime12h } from "@/lib/weekday-slots";

const bookingFieldClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body focus:border-[#4A0000]/50 focus:outline-none";
const bookingTextareaClass = `${bookingFieldClass} resize-none`;

type HomestayBookingPanelProps = {
  stay: Homestay;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomId?: string;
  roomCount: number;
  extraBedCount: number;
  maxGuests: number;
  maxRooms: number;
  maxExtraBeds: number;
  notes: string;
  nights: number;
  totalMinor: number;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onGuestsChange: (value: number) => void;
  onRoomIdChange?: (value: string) => void;
  onRoomCountChange?: (value: number) => void;
  onExtraBedCountChange?: (value: number) => void;
  onNotesChange: (value: string) => void;
  onConfirm?: () => void;
  busy?: boolean;
  error?: string | null;
  hideActions?: boolean;
  bookable?: boolean;
};

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 sm:gap-6">
      <div className="min-w-0">
        <div className="eyebrow luxury-panel-label">{label}</div>
        {hint ? <p className="luxury-panel-body mt-1 text-xs leading-relaxed">{hint}</p> : null}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="inline-flex h-9 w-9 items-center justify-center text-[#4A0000]/80 transition-colors hover:text-[#4A0000] disabled:opacity-35"
        >
          <Minus className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <span className="w-8 text-center font-display text-2xl text-[#4A0000]">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="inline-flex h-9 w-9 items-center justify-center text-[#4A0000]/80 transition-colors hover:text-[#4A0000] disabled:opacity-35"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

export function HomestayBookingPanel({
  stay,
  checkIn,
  checkOut,
  guests,
  roomId,
  roomCount,
  extraBedCount,
  maxGuests,
  maxRooms,
  maxExtraBeds,
  notes,
  nights,
  totalMinor,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onRoomIdChange,
  onRoomCountChange,
  onExtraBedCountChange,
  onNotesChange,
  onConfirm,
  busy = false,
  error = null,
  hideActions = false,
  bookable = true,
}: HomestayBookingPanelProps) {
  const sym = stay.currencySymbol ?? "₹";
  const today = new Date().toISOString().slice(0, 10);
  const rooms = getActiveRooms(stay);
  const selectedRoom = rooms.find((room) => room.id === roomId) ?? (rooms.length === 1 ? rooms[0] : undefined);
  const nightlyRate = selectedRoom?.pricePerNight ?? stay.pricePerNight;
  const extraBedPrice = selectedRoom?.extraBedPricePerNight ?? stay.extraBedPricePerNight ?? 0;
  const extraBedsPerRoom = extraBedsPerRoomForSelection(stay, selectedRoom);
  const showExtraBeds = maxExtraBeds > 0;
  const extraBedUnit = selectedRoom || getActiveRooms(stay).length > 0 ? "room" : "bedroom";

  return (
    <div className="space-y-6 sm:space-y-8">
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
            className={bookingFieldClass}
          />
        </label>
        <label className="block">
          <span className="eyebrow luxury-panel-label mb-2 block">Check-out</span>
          <input
            type="date"
            min={checkIn}
            value={checkOut}
            onChange={(event) => onCheckOutChange(event.target.value)}
            className={bookingFieldClass}
          />
        </label>
      </div>

      {rooms.length > 1 ? (
        <div className="space-y-3">
          <div className="eyebrow luxury-panel-label">Room type</div>
          <div className="grid gap-2">
            {rooms.map((room) => {
              const active = roomId === room.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => onRoomIdChange?.(room.id)}
                  className={`rounded-sm border px-4 py-3 text-left text-sm transition-colors ${
                    active
                      ? "border-[#4A0000]/50 bg-[rgb(74_0_0/0.06)] luxury-panel-heading"
                      : "border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.45)] luxury-panel-body hover:border-[#4A0000]/35"
                  }`}
                >
                  <span className="font-medium">{room.name}</span>
                  <span className="mt-1 block text-xs">
                    {room.capacity} guests · up to {room.totalUnits} room{room.totalUnits === 1 ? "" : "s"} ·{" "}
                    {sym}
                    {room.pricePerNight.toLocaleString("en-IN")}/night
                    {room.extraBedAvailable
                      ? ` · extra bed ${sym}${room.extraBedPricePerNight.toLocaleString("en-IN")}/night`
                      : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        {rooms.length > 0 && selectedRoom ? (
          <Stepper
            label="Rooms"
            hint={`Up to ${maxRooms} available`}
            value={roomCount}
            min={1}
            max={maxRooms}
            onChange={(value) => onRoomCountChange?.(value)}
          />
        ) : null}

        <Stepper
          label="Guests"
          hint={`Up to ${maxGuests} with this selection`}
          value={guests}
          min={1}
          max={maxGuests}
          onChange={onGuestsChange}
        />

        {showExtraBeds ? (
          <Stepper
            label="Extra beds"
            hint={`${sym}${extraBedPrice.toLocaleString("en-IN")}/night each · up to ${extraBedsPerRoom} per ${extraBedUnit} (${maxExtraBeds} max)`}
            value={extraBedCount}
            min={0}
            max={maxExtraBeds}
            onChange={(value) => onExtraBedCountChange?.(value)}
          />
        ) : null}
      </div>

      <div>
        <div className="eyebrow luxury-panel-label mb-3">Notes (optional)</div>
        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          rows={3}
          placeholder="Arrival time, dietary needs, or special requests…"
          className={`${bookingTextareaClass} placeholder:text-[rgb(58_0_0/0.4)]`}
        />
      </div>

      <div className="hairline" />

      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow luxury-panel-label">Estimated total</div>
          <div className="luxury-panel-body mt-1 text-xs">
            {sym}
            {nightlyRate.toLocaleString("en-IN")} × {roomCount} room{roomCount === 1 ? "" : "s"}
            {extraBedCount > 0
              ? ` + ${sym}${extraBedPrice.toLocaleString("en-IN")} × ${extraBedCount} extra bed${extraBedCount === 1 ? "" : "s"}`
              : ""}{" "}
            × {nights} night{nights === 1 ? "" : "s"}
          </div>
          {checkIn && checkOut ? (
            <div className="luxury-panel-body mt-1 text-xs">
              {formatDateLong(checkIn)} → {formatDateLong(checkOut)}
            </div>
          ) : null}
        </div>
        <div className="font-display text-3xl tracking-tight text-[#4A0000]">
          {formatMoney(totalMinor, sym)}
        </div>
      </div>

      <PayAtHomestayBadge surface="light" />

      {!bookable ? (
        <p className="rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.45)] px-4 py-3 text-sm luxury-panel-body">
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
