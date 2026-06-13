import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { AdminBookingRow } from "@/lib/api/admin";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import type { BookingListStatus, BookingPaymentFilter } from "@/lib/dashboard-booking-filters";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

type AdminBookingsTableProps = {
  bookings: AdminBookingRow[];
  commissionPercent?: number;
  initialStatus?: BookingListStatus;
  initialPayment?: BookingPaymentFilter;
};

function filterAdminBookings(
  bookings: AdminBookingRow[],
  status: BookingListStatus,
  payment: BookingPaymentFilter,
): AdminBookingRow[] {
  return bookings.filter((booking) => {
    if (status !== "all" && booking.bookingStatus !== status) {
      return false;
    }
    if (payment === "cod-pending") {
      return booking.bookingStatus === "confirmed" && booking.paymentStatus !== "paid";
    }
    if (payment === "collected") {
      return booking.paymentStatus === "paid";
    }
    return true;
  });
}

export function AdminBookingsTable({
  bookings,
  commissionPercent = 10,
  initialStatus = "all",
  initialPayment = "all",
}: AdminBookingsTableProps) {
  const [statusFilter, setStatusFilter] = useState<BookingListStatus>(initialStatus);
  const [paymentFilter, setPaymentFilter] = useState<BookingPaymentFilter>(initialPayment);

  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setPaymentFilter(initialPayment);
  }, [initialPayment]);

  const filtered = useMemo(
    () => filterAdminBookings(bookings, statusFilter, paymentFilter),
    [bookings, paymentFilter, statusFilter],
  );

  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">No bookings yet.</p>;
  }

  const statusButtons: BookingListStatus[] = [
    "all",
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {statusButtons.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setStatusFilter(value);
              if (value !== "confirmed") setPaymentFilter("all");
            }}
            className={`rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
              statusFilter === value && paymentFilter === "all"
                ? "border-ember/70 bg-ember/10 text-ember"
                : "border-[oklch(0.88_0.08_86_/_0.35)] text-foreground/80"
            }`}
          >
            {value}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("confirmed");
            setPaymentFilter("cod-pending");
          }}
          className={`rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
            paymentFilter === "cod-pending"
              ? "border-ember/70 bg-ember/10 text-ember"
              : "border-[oklch(0.88_0.08_86_/_0.35)] text-foreground/80"
          }`}
        >
          COD pending
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setPaymentFilter("collected");
          }}
          className={`rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
            paymentFilter === "collected"
              ? "border-ember/70 bg-ember/10 text-ember"
              : "border-[oklch(0.88_0.08_86_/_0.35)] text-foreground/80"
          }`}
        >
          Collected
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bookings in this view.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b border-[oklch(0.88_0.08_86_/_0.2)] text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-3 py-2">Guest</th>
                <th className="px-3 py-2">Experience</th>
                <th className="px-3 py-2">Host</th>
                <th className="px-3 py-2">Booked</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Platform ({commissionPercent}%)</th>
                <th className="px-3 py-2">Host payout</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking.id} className="border-b border-[oklch(0.88_0.08_86_/_0.1)]">
                  <td className="px-3 py-3">
                    <Link
                      to="/admin/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="block hover:text-ember"
                    >
                      <div>{booking.guestName ?? "Guest"}</div>
                      <div className="text-xs text-muted-foreground">{booking.guestEmail}</div>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      to="/admin/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="hover:text-ember"
                    >
                      {booking.experienceTitle}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{booking.hostName ?? "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDateLong(booking.createdAt.slice(0, 10))}
                  </td>
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
      )}
    </section>
  );
}
