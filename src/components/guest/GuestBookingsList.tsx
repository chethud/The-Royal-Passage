import { useState } from "react";
import { BookingCard } from "@/components/booking/BookingCard";
import type { BookingSummary } from "@/lib/api/bookings";
import { cancelBooking } from "@/lib/api/bookings";
import { toErrorMessage } from "@/lib/api/client";

type GuestBookingsListProps = {
  bookings: BookingSummary[];
  accessToken: string;
  allowCancel?: boolean;
  onUpdated?: (bookingId: string) => void;
  surface?: "light" | "dark";
};

export function GuestBookingsList({
  bookings,
  accessToken,
  allowCancel = false,
  onUpdated,
  surface = "dark",
}: GuestBookingsListProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLight = surface === "light";

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    setError(null);
    try {
      await cancelBooking(accessToken, bookingId);
      onUpdated?.(bookingId);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to cancel booking."));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      {error ? (
        <p className="mb-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <ul className={isLight ? "divide-y divide-[rgb(74_0_0/0.15)]" : "space-y-4"}>
        {bookings.map((booking) => (
          <li key={booking.id}>
            <BookingCard
              booking={booking}
              showActions={allowCancel}
              cancelling={cancellingId === booking.id}
              onCancel={allowCancel ? (id) => void handleCancel(id) : undefined}
              surface={surface}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
