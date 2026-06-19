import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { AdminBookingRow } from "@/lib/api/admin";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import {
  DashboardTable,
  DashboardTableBody,
  DashboardTableCell,
  DashboardTableEmpty,
  DashboardTableFilters,
  DashboardTableHead,
  DashboardTableHeadCell,
  DashboardTableHeadRow,
  DashboardTableLinkCell,
  DashboardTableRow,
  DashboardTableScroll,
  DashboardTableSection,
  dashboardFilterBtnClass,
} from "@/components/ui/DashboardTable";
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
    return <DashboardTableEmpty>No bookings yet.</DashboardTableEmpty>;
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
    <DashboardTableSection>
      <DashboardTableFilters>
        {dateViewButtons.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setDateView(value)}
            className={dashboardFilterBtnClass(dateView === value)}
          >
            {label}
          </button>
        ))}
      </DashboardTableFilters>

      <DashboardTableFilters>
        {statusButtons.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setStatusFilter(value);
              if (value !== "confirmed") setPaymentFilter("all");
            }}
            className={dashboardFilterBtnClass(statusFilter === value && paymentFilter === "all")}
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
          className={dashboardFilterBtnClass(paymentFilter === "cod-pending")}
        >
          COD pending
        </button>
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setPaymentFilter("collected");
          }}
          className={dashboardFilterBtnClass(paymentFilter === "collected")}
        >
          Collected
        </button>
      </DashboardTableFilters>

      {filtered.length === 0 ? (
        <DashboardTableEmpty>No bookings in this view.</DashboardTableEmpty>
      ) : (
        <DashboardTableScroll>
          <DashboardTable minWidth="2xl">
            <DashboardTableHead>
              <DashboardTableHeadRow>
                <DashboardTableHeadCell>Guest</DashboardTableHeadCell>
                <DashboardTableHeadCell>Experience</DashboardTableHeadCell>
                <DashboardTableHeadCell>Host</DashboardTableHeadCell>
                <DashboardTableHeadCell>Session</DashboardTableHeadCell>
                <DashboardTableHeadCell>Booked</DashboardTableHeadCell>
                <DashboardTableHeadCell>Total</DashboardTableHeadCell>
                <DashboardTableHeadCell>Platform ({commissionPercent}%)</DashboardTableHeadCell>
                <DashboardTableHeadCell>Host payout</DashboardTableHeadCell>
                <DashboardTableHeadCell>Status</DashboardTableHeadCell>
              </DashboardTableHeadRow>
            </DashboardTableHead>
            <DashboardTableBody>
              {filtered.map((booking) => (
                <DashboardTableRow key={booking.id}>
                  <DashboardTableLinkCell
                    to="/admin/bookings/$bookingId"
                    params={{ bookingId: booking.id }}
                    title={booking.guestName ?? "Guest"}
                    subtitle={booking.guestEmail}
                  />
                  <DashboardTableCell>
                    <Link
                      to="/admin/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="luxury-panel-link hover:underline"
                    >
                      {booking.experienceTitle}
                    </Link>
                  </DashboardTableCell>
                  <DashboardTableCell>{booking.hostName ?? "—"}</DashboardTableCell>
                  <DashboardTableCell>{formatDateLong(booking.slotDate)}</DashboardTableCell>
                  <DashboardTableCell>
                    {formatDateLong(booking.createdAt.slice(0, 10))}
                  </DashboardTableCell>
                  <DashboardTableCell variant="heading">
                    {formatMoney(booking.totalAmount, booking.currencySymbol)}
                  </DashboardTableCell>
                  <DashboardTableCell>
                    {formatMoney(booking.platformFeeMinor, booking.currencySymbol)}
                  </DashboardTableCell>
                  <DashboardTableCell>
                    {formatMoney(booking.hostPayoutMinor, booking.currencySymbol)}
                  </DashboardTableCell>
                  <DashboardTableCell>
                    <BookingStatusChip
                      bookingStatus={booking.bookingStatus}
                      paymentStatus={booking.paymentStatus}
                      isPaused={booking.isPaused}
                      surface="light"
                    />
                  </DashboardTableCell>
                </DashboardTableRow>
              ))}
            </DashboardTableBody>
          </DashboardTable>
        </DashboardTableScroll>
      )}
    </DashboardTableSection>
  );
}
