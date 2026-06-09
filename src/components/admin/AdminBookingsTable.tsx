import type { AdminBookingRow } from "@/lib/api/admin";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import { formatMoney } from "@/lib/money";

type AdminBookingsTableProps = {
  bookings: AdminBookingRow[];
  commissionPercent?: number;
};

export function AdminBookingsTable({ bookings, commissionPercent = 10 }: AdminBookingsTableProps) {
  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">No bookings yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead>
          <tr className="border-b border-[oklch(0.88_0.08_86_/_0.2)] text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <th className="px-3 py-2">Guest</th>
            <th className="px-3 py-2">Experience</th>
            <th className="px-3 py-2">Host</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2">Platform ({commissionPercent}%)</th>
            <th className="px-3 py-2">Host payout</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-[oklch(0.88_0.08_86_/_0.1)]">
              <td className="px-3 py-3">
                <div>{booking.guestName ?? "Guest"}</div>
                <div className="text-xs text-muted-foreground">{booking.guestEmail}</div>
              </td>
              <td className="px-3 py-3">{booking.experienceTitle}</td>
              <td className="px-3 py-3">{booking.hostName ?? "—"}</td>
              <td className="px-3 py-3">
                {formatMoney(booking.totalAmount, booking.currencySymbol)}
              </td>
              <td className="px-3 py-3 text-ember">
                {formatMoney(booking.platformFeeMinor, booking.currencySymbol)}
              </td>
              <td className="px-3 py-3">
                {formatMoney(booking.hostPayoutMinor, booking.currencySymbol)}
              </td>
              <td className="px-3 py-3">
                <BookingStatusChip
                  bookingStatus={booking.bookingStatus}
                  paymentStatus={booking.paymentStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
