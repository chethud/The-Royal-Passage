import { Link } from "@tanstack/react-router";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import type { BookingSummary } from "@/lib/api/bookings";
import { formatMoney } from "@/lib/money";

type HostTodayBookingsProps = {
  bookings: BookingSummary[];
};

export function HostTodayBookings({ bookings }: HostTodayBookingsProps) {
  if (bookings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No sessions scheduled for today.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((booking) => (
        <li
          key={booking.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[oklch(0.88_0.08_86_/_0.2)] px-4 py-3"
        >
          <div>
            <Link
              to="/host/bookings/$bookingId"
              params={{ bookingId: booking.id }}
              className="font-display text-lg hover:text-ember"
            >
              {booking.experience.title}
            </Link>
            <div className="mt-1 text-sm text-muted-foreground">
              {booking.guestName ?? "Guest"} · {booking.slot.start} · {booking.participantCount}{" "}
              guests · {formatMoney(booking.totalAmount, booking.currencySymbol)}
            </div>
          </div>
          <BookingStatusChip
            bookingStatus={booking.bookingStatus}
            paymentStatus={booking.paymentStatus}
          />
        </li>
      ))}
    </ul>
  );
}
