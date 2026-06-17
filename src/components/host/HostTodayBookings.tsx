import { Link } from "@tanstack/react-router";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import type { BookingSummary } from "@/lib/api/bookings";
import { formatMoney } from "@/lib/money";

type HostTodayBookingsProps = {
  bookings: BookingSummary[];
};

export function HostTodayBookings({ bookings }: HostTodayBookingsProps) {
  if (bookings.length === 0) {
    return <p className="luxury-panel-body py-4 text-sm">No sessions scheduled for today.</p>;
  }

  return (
    <ul className="divide-y divide-[rgb(88_16_0/0.12)]">
      {bookings.map((booking) => (
        <li key={booking.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
          <div>
            <Link
              to="/host/bookings/$bookingId"
              params={{ bookingId: booking.id }}
              className="luxury-panel-link font-display text-lg hover:underline"
            >
              {booking.experience.title}
            </Link>
            <div className="luxury-panel-body mt-1 text-sm">
              {booking.guestName ?? "Guest"} · {booking.slot.start} · {booking.participantCount}{" "}
              guests · {formatMoney(booking.totalAmount, booking.currencySymbol)}
            </div>
          </div>
          <BookingStatusChip
            bookingStatus={booking.bookingStatus}
            paymentStatus={booking.paymentStatus}
            isPaused={booking.isPaused}
            surface="light"
          />
        </li>
      ))}
    </ul>
  );
}
