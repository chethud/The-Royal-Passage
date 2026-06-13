import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import { HostBookingActions } from "@/components/host/HostBookingActions";
import type { BookingSummary } from "@/lib/api/bookings";
import type { BookingListStatus, BookingPaymentFilter } from "@/lib/dashboard-booking-filters";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

type HostBookingTableProps = {
  bookings: BookingSummary[];
  busyId: string | null;
  initialStatus?: BookingListStatus;
  initialPayment?: BookingPaymentFilter;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onComplete: (id: string) => void;
};

type StatusFilter = BookingListStatus;
type PaymentFilter = BookingPaymentFilter;

function filterBookings(
  bookings: BookingSummary[],
  status: StatusFilter,
  payment: PaymentFilter,
): BookingSummary[] {
  const today = new Date().toISOString().slice(0, 10);

  return bookings.filter((booking) => {
    if (status === "today") {
      if (!["pending", "confirmed"].includes(booking.bookingStatus)) return false;
      if (booking.slot.date.slice(0, 10) !== today) return false;
    } else if (status !== "all" && booking.bookingStatus !== status) {
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

export function HostBookingTable({
  bookings,
  busyId,
  initialStatus = "all",
  initialPayment = "all",
  onConfirm,
  onReject,
  onMarkPaid,
  onComplete,
}: HostBookingTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>(initialPayment);

  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setPaymentFilter(initialPayment);
  }, [initialPayment]);

  const filtered = useMemo(
    () => filterBookings(bookings, statusFilter, paymentFilter),
    [bookings, paymentFilter, statusFilter],
  );

  const statusButtons: StatusFilter[] = [
    "all",
    "today",
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
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bookings in this view.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-[oklch(0.88_0.08_86_/_0.2)] text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-3 py-2">Guest</th>
                <th className="px-3 py-2">Experience</th>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Guests</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-[oklch(0.88_0.08_86_/_0.1)] last:border-0"
                >
                  <td className="px-3 py-3">
                    <Link
                      to="/host/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="block hover:text-ember"
                    >
                      <div>{booking.guestName ?? "Guest"}</div>
                      <div className="text-xs text-muted-foreground">{booking.guestEmail}</div>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      to="/host/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="hover:text-ember"
                    >
                      {booking.experience.title}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDateLong(booking.slot.date)}
                    <br />
                    <span className="text-xs">{booking.slot.start}</span>
                  </td>
                  <td className="px-3 py-3">{booking.participantCount}</td>
                  <td className="px-3 py-3 font-display text-lg">
                    {formatMoney(booking.totalAmount, booking.currencySymbol)}
                  </td>
                  <td className="px-3 py-3">
                    <BookingStatusChip
                      bookingStatus={booking.bookingStatus}
                      paymentStatus={booking.paymentStatus}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <HostBookingActions
                      booking={booking}
                      busy={busyId === booking.id}
                      onConfirm={onConfirm}
                      onReject={onReject}
                      onMarkPaid={onMarkPaid}
                      onComplete={onComplete}
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
