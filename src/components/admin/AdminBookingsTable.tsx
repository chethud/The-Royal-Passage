import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { AdminBookingRow } from "@/lib/api/admin";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import type { BookingListStatus, BookingPaymentFilter, BookingDateView } from "@/lib/dashboard-booking-filters";
import { bookingMatchesDateView } from "@/lib/booking-window";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

type AdminBookingsTableProps = {
  bookings: AdminBookingRow[];
  commissionPercent?: number;
  initialStatus?: BookingListStatus;
  initialPayment?: BookingPaymentFilter;
  initialDateView?: BookingDateView;
};

function filterBtn(active: boolean) {
  return active ? "luxury-btn-sm luxury-btn-primary" : "luxury-btn-sm luxury-btn-panel-outline";
}

function filterAdminBookings(
  bookings: AdminBookingRow[],
  status: BookingListStatus,
  payment: BookingPaymentFilter,
  dateView: BookingDateView,
): AdminBookingRow[] {
  return bookings.filter((booking) => {
    if (status !== "today" && !bookingMatchesDateView(booking.slotDate, dateView)) {
      return false;
    }
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
  initialDateView = "week",
}: AdminBookingsTableProps) {
  const [statusFilter, setStatusFilter] = useState<BookingListStatus>(initialStatus);
  const [paymentFilter, setPaymentFilter] = useState<BookingPaymentFilter>(initialPayment);
  const [dateView, setDateView] = useState<BookingDateView>(initialDateView);

  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setPaymentFilter(initialPayment);
  }, [initialPayment]);

  useEffect(() => {
    setDateView(initialDateView);
  }, [initialDateView]);

  const filtered = useMemo(
    () => filterAdminBookings(bookings, statusFilter, paymentFilter, dateView),
    [bookings, dateView, paymentFilter, statusFilter],
  );

  if (bookings.length === 0) {
    return <p className="luxury-panel-body py-8 text-sm">No bookings yet.</p>;
  }

  const dateViewButtons: { value: BookingDateView; label: string }[] = [
    { value: "week", label: "Next 7 days" },
    { value: "all", label: "All dates" },
    { value: "history", label: "History" },
  ];

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
        {dateViewButtons.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setDateView(value)}
            className={filterBtn(dateView === value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {statusButtons.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setStatusFilter(value);
              if (value !== "confirmed") setPaymentFilter("all");
            }}
            className={filterBtn(statusFilter === value && paymentFilter === "all")}
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
          className={filterBtn(paymentFilter === "cod-pending")}
        >
          COD pending
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setPaymentFilter("collected");
          }}
          className={filterBtn(paymentFilter === "collected")}
        >
          Collected
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="luxury-panel-body py-8 text-sm">No bookings in this view.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-[0.14em] luxury-panel-divider luxury-panel-label">
                <th className="px-3 py-2 font-normal">Guest</th>
                <th className="px-3 py-2 font-normal">Experience</th>
                <th className="px-3 py-2 font-normal">Host</th>
                <th className="px-3 py-2 font-normal">Session</th>
                <th className="px-3 py-2 font-normal">Booked</th>
                <th className="px-3 py-2 font-normal">Total</th>
                <th className="px-3 py-2 font-normal">Platform ({commissionPercent}%)</th>
                <th className="px-3 py-2 font-normal">Host payout</th>
                <th className="px-3 py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking.id} className="border-b border-[rgb(88_16_0/0.12)] last:border-0">
                  <td className="px-3 py-3">
                    <Link
                      to="/admin/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="luxury-panel-link block hover:underline"
                    >
                      <div className="luxury-panel-heading">{booking.guestName ?? "Guest"}</div>
                      <div className="luxury-panel-body text-xs">{booking.guestEmail}</div>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      to="/admin/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="luxury-panel-link hover:underline"
                    >
                      {booking.experienceTitle}
                    </Link>
                  </td>
                  <td className="luxury-panel-body px-3 py-3">{booking.hostName ?? "—"}</td>
                  <td className="luxury-panel-body px-3 py-3">
                    {formatDateLong(booking.slotDate)}
                  </td>
                  <td className="luxury-panel-body px-3 py-3">
                    {formatDateLong(booking.createdAt.slice(0, 10))}
                  </td>
                  <td className="luxury-panel-heading px-3 py-3">
                    {formatMoney(booking.totalAmount, booking.currencySymbol)}
                  </td>
                  <td className="luxury-panel-body px-3 py-3">
                    {formatMoney(booking.platformFeeMinor, booking.currencySymbol)}
                  </td>
                  <td className="luxury-panel-body px-3 py-3">
                    {formatMoney(booking.hostPayoutMinor, booking.currencySymbol)}
                  </td>
                  <td className="px-3 py-3">
                    <BookingStatusChip
                      bookingStatus={booking.bookingStatus}
                      paymentStatus={booking.paymentStatus}
                      isPaused={booking.isPaused}
                      surface="light"
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
