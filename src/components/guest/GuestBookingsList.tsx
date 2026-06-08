import { useState } from "react";
import { BookingCard } from "@/components/booking/BookingCard";
import type { BookingSummary } from "@/lib/api/bookings";
import { cancelBooking } from "@/lib/api/bookings";
import { toErrorMessage } from "@/lib/api/client";

type GuestBookingsListProps = {
  bookings: BookingSummary[];
  accessToken: string;
  allowCancel?: boolean;
  onUpdated?: () => void;
};

export function GuestBookingsList({
  bookings,
  accessToken,
  allowCancel = false,
  onUpdated,
}: GuestBookingsListProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    setError(null);
    try {
      await cancelBooking(accessToken, bookingId);
      onUpdated?.();
    } catch (err) {
      setError(toErrorMessage(err, "Failed to cancel booking."));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          showActions={allowCancel}
          cancelling={cancellingId === booking.id}
          onCancel={allowCancel ? (id) => void handleCancel(id) : undefined}
        />
      ))}
    </div>
  );
}
