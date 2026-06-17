import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import { HostBookingActions } from "@/components/host/HostBookingActions";
import type { BookingSummary } from "@/lib/api/bookings";
import type { BookingListStatus, BookingPaymentFilter, BookingDateView } from "@/lib/dashboard-booking-filters";
import { bookingMatchesDateView } from "@/lib/booking-window";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

type HostBookingTableProps = {
  bookings: BookingSummary[];
  busyId: string | null;
  initialStatus?: BookingListStatus;
  initialPayment?: BookingPaymentFilter;
  initialDateView?: BookingDateView;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onComplete: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
};

type StatusFilter = BookingListStatus;
type PaymentFilter = BookingPaymentFilter;

function filterBtn(active: boolean) {
  return active ? "luxury-btn-sm luxury-btn-primary" : "luxury-btn-sm luxury-btn-panel-outline";
}

function filterBookings(
  bookings: BookingSummary[],
  status: StatusFilter,
  payment: PaymentFilter,
  dateView: BookingDateView,
): BookingSummary[] {
  const today = new Date().toISOString().slice(0, 10);

  return bookings.filter((booking) => {
    if (status !== "today" && !bookingMatchesDateView(booking.slot.date, dateView)) {
      return false;
    }

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
  initialDateView = "week",
  onConfirm,
  onReject,
  onMarkPaid,
  onComplete,
  onPause,
  onResume,
}: HostBookingTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>(initialPayment);
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
    () => filterBookings(bookings, statusFilter, paymentFilter, dateView),
    [bookings, dateView, paymentFilter, statusFilter],
  );

  const dateViewButtons: { value: BookingDateView; label: string }[] = [
    { value: "week", label: "Next 7 days" },
    { value: "all", label: "All dates" },
    { value: "history", label: "History" },
  ];

  const statusButtons: StatusFilter[] = [
    "all",
    "today",
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ];

  return (
    <section className="space-y-5">
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
      </div>

      {filtered.length === 0 ? (
        <p className="luxury-panel-body py-8 text-sm">No bookings in this view.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-[0.14em] luxury-panel-divider luxury-panel-label">
                <th className="px-3 py-2 font-normal">Guest</th>
                <th className="px-3 py-2 font-normal">Experience</th>
                <th className="px-3 py-2 font-normal">When</th>
                <th className="px-3 py-2 font-normal">Guests</th>
                <th className="px-3 py-2 font-normal">Total</th>
                <th className="px-3 py-2 font-normal">Status</th>
                <th className="px-3 py-2 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-[rgb(74_0_0/0.12)] last:border-0"
                >
                  <td className="px-3 py-3">
                    <Link
                      to="/host/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="luxury-panel-link block hover:underline"
                    >
                      <div className="luxury-panel-heading">{booking.guestName ?? "Guest"}</div>
                      <div className="luxury-panel-body text-xs">{booking.guestEmail}</div>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      to="/host/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="luxury-panel-link hover:underline"
                    >
                      {booking.experience.title}
                    </Link>
                  </td>
                  <td className="luxury-panel-body px-3 py-3">
                    {formatDateLong(booking.slot.date)}
                    <br />
                    <span className="text-xs">{booking.slot.start}</span>
                  </td>
                  <td className="luxury-panel-body px-3 py-3">{booking.participantCount}</td>
                  <td className="luxury-panel-heading px-3 py-3 font-display text-lg">
                    {formatMoney(booking.totalAmount, booking.currencySymbol)}
                  </td>
                  <td className="px-3 py-3">
                    <BookingStatusChip
                      bookingStatus={booking.bookingStatus}
                      paymentStatus={booking.paymentStatus}
                      isPaused={booking.isPaused}
                      surface="light"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <HostBookingActions
                      booking={booking}
                      busy={busyId === booking.id}
                      surface="light"
                      onConfirm={onConfirm}
                      onReject={onReject}
                      onMarkPaid={onMarkPaid}
                      onComplete={onComplete}
                      onPause={onPause}
                      onResume={onResume}
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
