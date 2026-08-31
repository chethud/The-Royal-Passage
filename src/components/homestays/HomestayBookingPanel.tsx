import { PayAtHomestayBadge } from "@/components/homestays/PayAtHomestayBadge";
import {
  BookingFieldLabel,
  BookingIntro,
  BookingNotesField,
  BookingPanelFootnote,
  BookingPanelStack,
  BookingStepper,
  BookingStepperGroup,
  BookingTotalSummary,
  bookingOptionCardClass,
} from "@/components/booking/BookingPanelPrimitives";
import type { Homestay } from "@/data/homestays";
import { formatDateLong } from "@/lib/date-format";
import {
  formatStartingNightRate,
  weekdayPriceMajor,
  weekendPriceMajor,
} from "@/lib/homestay-day-pricing";
import {
  getActiveRooms,
  extraBedsPerRoomForSelection,
  weekdayExtraBedPriceMajor,
  weekendExtraBedPriceMajor,
} from "@/lib/homestay-room-pricing";
import { formatMoney } from "@/lib/money";
import { formatTime12h } from "@/lib/weekday-slots";

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

const dateFieldClass =
  "w-full min-w-0 rounded-sm border border-[rgb(74_0_0/0.22)] bg-white px-2.5 py-2 text-sm text-[#2A0000] focus:border-[#2A0000]/45 focus:outline-none";

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
  const rooms = getActiveRooms(stay);
  const selectedRoom = rooms.find((room) => room.id === roomId) ?? (rooms.length === 1 ? rooms[0] : undefined);
  const rateLabel = formatStartingNightRate(
    sym,
    weekdayPriceMajor(stay, selectedRoom),
    weekendPriceMajor(stay, selectedRoom),
  );
  const extraBedWeekdayPrice = weekdayExtraBedPriceMajor(stay, selectedRoom);
  const extraBedWeekendPrice = weekendExtraBedPriceMajor(stay, selectedRoom);
  const extraBedRateLabel = formatStartingNightRate(sym, extraBedWeekdayPrice, extraBedWeekendPrice);
  const extraBedsPerRoom = extraBedsPerRoomForSelection(stay, selectedRoom);
  const showExtraBeds = maxExtraBeds > 0;
  const extraBedUnit = selectedRoom || getActiveRooms(stay).length > 0 ? "room" : "bedroom";
  const today = new Date().toISOString().slice(0, 10);
  const checkOutMin = checkIn || today;

  const handleCheckInChange = (next: string) => {
    onCheckInChange(next);
    if (next && checkOut && checkOut <= next) {
      onCheckOutChange("");
    }
  };

  return (
    <BookingPanelStack>
      <BookingIntro label="Your stay">
        Check-in from {formatTime12h(stay.checkInTime)} · Check-out by {formatTime12h(stay.checkOutTime)}
      </BookingIntro>

      <div>
        <BookingFieldLabel>Stay dates</BookingFieldLabel>
        <p className="luxury-panel-body mb-3 mt-1 leading-relaxed text-[#2A0000]/90">
          Choose your check-in and check-out dates. Weekend and holiday prices apply automatically.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="eyebrow luxury-panel-label mb-1.5 block text-[#2A0000]">Check-in</span>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(event) => handleCheckInChange(event.target.value)}
              className={dateFieldClass}
            />
          </label>
          <label className="block min-w-0">
            <span className="eyebrow luxury-panel-label mb-1.5 block text-[#2A0000]">Check-out</span>
            <input
              type="date"
              min={checkOutMin}
              value={checkOut}
              onChange={(event) => onCheckOutChange(event.target.value)}
              className={dateFieldClass}
            />
          </label>
        </div>
        {checkIn && checkOut && checkOut > checkIn ? (
          <p className="luxury-panel-body mt-2">
            {formatDateLong(checkIn)} → {formatDateLong(checkOut)} · {nights} night
            {nights === 1 ? "" : "s"}
          </p>
        ) : null}
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
                  className={bookingOptionCardClass(active)}
                >
                  <span className="font-medium">{room.name}</span>
                  <span className="mt-1 block text-xs">
                    {room.capacity} guests · up to {room.totalUnits} room{room.totalUnits === 1 ? "" : "s"} ·{" "}
                    {formatStartingNightRate(
                      sym,
                      weekdayPriceMajor(stay, room),
                      weekendPriceMajor(stay, room),
                    )}
                    {room.extraBedAvailable
                      ? ` · extra bed ${formatStartingNightRate(
                          sym,
                          weekdayExtraBedPriceMajor(stay, room),
                          weekendExtraBedPriceMajor(stay, room),
                        )}`
                      : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <BookingStepperGroup>
        {rooms.length > 0 && selectedRoom ? (
          <BookingStepper
            label="Rooms"
            hint={`Up to ${maxRooms} available`}
            value={roomCount}
            min={1}
            max={maxRooms}
            onChange={(value) => onRoomCountChange?.(value)}
          />
        ) : null}

        <BookingStepper
          label="Guests"
          hint={`Up to ${maxGuests} with this selection`}
          value={guests}
          min={1}
          max={maxGuests}
          onChange={onGuestsChange}
        />

        {showExtraBeds ? (
          <BookingStepper
            label="Extra beds"
            hint={`${extraBedRateLabel} each · up to ${extraBedsPerRoom} per ${extraBedUnit} (${maxExtraBeds} max)`}
            value={extraBedCount}
            min={0}
            max={maxExtraBeds}
            onChange={(value) => onExtraBedCountChange?.(value)}
          />
        ) : null}
      </BookingStepperGroup>

      <BookingNotesField
        value={notes}
        onChange={onNotesChange}
        placeholder="Arrival time, dietary needs, or special requests…"
      />

      <div className="hairline" />

      <BookingTotalSummary
        breakdown={
          <>
            {rateLabel} × {roomCount} room{roomCount === 1 ? "" : "s"}
            {extraBedCount > 0
              ? ` + ${extraBedRateLabel} × ${extraBedCount} extra bed${extraBedCount === 1 ? "" : "s"}`
              : ""}{" "}
            × {nights} night{nights === 1 ? "" : "s"}
          </>
        }
        total={formatMoney(totalMinor, sym)}
        footer={checkIn && checkOut ? `${formatDateLong(checkIn)} → ${formatDateLong(checkOut)}` : undefined}
      />

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
          <BookingPanelFootnote>
            Your host will confirm. Pay the full amount in cash at check-in.
          </BookingPanelFootnote>
        </>
      )}
    </BookingPanelStack>
  );
}
