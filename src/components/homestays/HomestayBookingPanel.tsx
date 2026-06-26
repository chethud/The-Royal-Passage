import { PayAtHomestayBadge } from "@/components/homestays/PayAtHomestayBadge";
import {
  BookingFieldGrid,
  BookingFieldLabel,
  BookingIntro,
  BookingNotesField,
  BookingPanelFootnote,
  BookingPanelStack,
  BookingStepper,
  BookingStepperGroup,
  BookingTotalSummary,
  bookingOptionCardClass,
  bookingPanelFieldClass,
} from "@/components/booking/BookingPanelPrimitives";
import type { Homestay } from "@/data/homestays";
import { formatDateLong } from "@/lib/date-format";
import {
  formatWeekdayWeekendRates,
  weekdayPriceMajor,
  weekendPriceMajor,
} from "@/lib/homestay-day-pricing";
import { getActiveRooms, extraBedsPerRoomForSelection } from "@/lib/homestay-room-pricing";
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
  const rateLabel = formatWeekdayWeekendRates(
    sym,
    weekdayPriceMajor(stay, selectedRoom),
    weekendPriceMajor(stay, selectedRoom),
  );
  const extraBedPrice = selectedRoom?.extraBedPricePerNight ?? stay.extraBedPricePerNight ?? 0;
  const extraBedsPerRoom = extraBedsPerRoomForSelection(stay, selectedRoom);
  const showExtraBeds = maxExtraBeds > 0;
  const extraBedUnit = selectedRoom || getActiveRooms(stay).length > 0 ? "room" : "bedroom";

  return (
    <BookingPanelStack>
      <BookingIntro label="Your stay">
        Check-in from {formatTime12h(stay.checkInTime)} · Check-out by {formatTime12h(stay.checkOutTime)}
      </BookingIntro>

      <BookingFieldGrid>
        <label className="block">
          <BookingFieldLabel>Check-in</BookingFieldLabel>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(event) => onCheckInChange(event.target.value)}
            className={bookingPanelFieldClass}
          />
        </label>
        <label className="block">
          <BookingFieldLabel>Check-out</BookingFieldLabel>
          <input
            type="date"
            min={checkIn}
            value={checkOut}
            onChange={(event) => onCheckOutChange(event.target.value)}
            className={bookingPanelFieldClass}
          />
        </label>
      </BookingFieldGrid>

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
                    {formatWeekdayWeekendRates(
                      sym,
                      weekdayPriceMajor(stay, room),
                      weekendPriceMajor(stay, room),
                    )}
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
            hint={`${sym}${extraBedPrice.toLocaleString("en-IN")}/night each · up to ${extraBedsPerRoom} per ${extraBedUnit} (${maxExtraBeds} max)`}
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
              ? ` + ${sym}${extraBedPrice.toLocaleString("en-IN")} × ${extraBedCount} extra bed${extraBedCount === 1 ? "" : "s"}`
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
