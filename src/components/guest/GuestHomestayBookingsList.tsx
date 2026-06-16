import { Link } from "@tanstack/react-router";
import { HomestayCashPaymentNotice } from "@/components/homestays/HomestayCashPaymentNotice";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import type { HomestayBookingSummary } from "@/lib/api/owner-homestay-bookings";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

type GuestHomestayBookingsListProps = {
  bookings: HomestayBookingSummary[];
  surface?: "light" | "dark";
};

export function GuestHomestayBookingsList({
  bookings,
  surface = "light",
}: GuestHomestayBookingsListProps) {
  if (bookings.length === 0) return null;

  return (
    <ul className="divide-y luxury-panel-divider">
      {bookings.map((booking) => (
        <li key={booking.id} className="flex flex-wrap items-start justify-between gap-4 py-5 first:pt-0">
          <div>
            <p className="luxury-panel-heading font-display text-lg">{booking.homestayTitle}</p>
            <p className="luxury-panel-body mt-1 text-sm">
              {formatDateLong(booking.checkIn)} → {formatDateLong(booking.checkOut)} · {booking.nights}{" "}
              night{booking.nights !== 1 ? "s" : ""} · {booking.guestCount} guest
              {booking.guestCount !== 1 ? "s" : ""}
            </p>
            {booking.roomName ? (
              <p className="luxury-panel-body mt-1 text-xs">{booking.roomName}</p>
            ) : null}
            <p className="luxury-panel-body mt-2 text-sm">
              {formatMoney(booking.totalAmount, booking.currencySymbol)} · Cash at homestay
            </p>
            <div className="mt-2">
              <HomestayCashPaymentNotice booking={booking} surface={surface} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <BookingStatusChip
              bookingStatus={booking.bookingStatus}
              paymentStatus={booking.paymentStatus}
              pendingPaymentLabel="Pay in cash"
              surface={surface}
            />
            <Link
              to="/stays/$bookingId"
              params={{ bookingId: booking.id }}
              className="luxury-panel-link text-xs hover:underline"
            >
              View stay details
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
