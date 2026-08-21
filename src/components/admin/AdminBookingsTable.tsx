import { Link, useNavigate } from "@tanstack/react-router";
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
import { formatDateWeekdayShort } from "@/lib/date-format";
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
  const navigate = useNavigate({ from: "/admin/bookings/" });
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

  const syncSearch = (next: {
    status: BookingListStatus;
    payment: BookingPaymentFilter;
    dateView: BookingDateView;
  }) => {
    void navigate({
      search: {
        status: next.status === "all" ? undefined : next.status,
        payment: next.payment === "all" ? undefined : next.payment,
        dateView: next.dateView === "week" ? undefined : next.dateView,
      },
      replace: true,
    });
  };

  const filtered = useMemo(
    () => filterAdminBookings(bookings, statusFilter, paymentFilter, dateView),
    [bookings, dateView, paymentFilter, statusFilter],
  );

  if (bookings.length === 0) {
    return <DashboardTableEmpty>No bookings yet.</DashboardTableEmpty>;
  }

  const dateViewButtons: { value: BookingDateView; label: string }[] = [
    { value: "all", label: "All dates" },
    { value: "week", label: "Next 7 days" },
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
            onClick={() => {
              setDateView(value);
              syncSearch({ status: statusFilter, payment: paymentFilter, dateView: value });
            }}
            className={dashboardFilterBtnClass(dateView === value)}
          >
            {label}
          </button>
        ))}
      </DashboardTableFilters>

      <DashboardTableFilters orientation="vertical">
        {statusButtons.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              const nextPayment = value !== "confirmed" ? "all" : paymentFilter;
              setStatusFilter(value);
              if (value !== "confirmed") setPaymentFilter("all");
              syncSearch({ status: value, payment: nextPayment, dateView });
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
            syncSearch({ status: "confirmed", payment: "cod-pending", dateView });
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
            syncSearch({ status: "all", payment: "collected", dateView });
          }}
          className={dashboardFilterBtnClass(paymentFilter === "collected")}
        >
          Collected
        </button>
      </DashboardTableFilters>

      {filtered.length === 0 ? (
        <DashboardTableEmpty>No bookings in this view.</DashboardTableEmpty>
      ) : (
        <DashboardTableScroll scroll={false}>
          <DashboardTable minWidth="none" layout="fixed" className="text-xs">
            <DashboardTableHead>
              <DashboardTableHeadRow className="!text-[0.65rem] !tracking-[0.08em]">
                <DashboardTableHeadCell className="w-[14%] text-[0.65rem] leading-tight tracking-[0.08em]">
                  Guest
                </DashboardTableHeadCell>
                <DashboardTableHeadCell className="w-[18%] text-[0.65rem] leading-tight tracking-[0.08em]">
                  Experience
                </DashboardTableHeadCell>
                <DashboardTableHeadCell className="w-[12%] text-[0.65rem] leading-tight tracking-[0.08em]">
                  Session
                </DashboardTableHeadCell>
                <DashboardTableHeadCell className="w-[11%] text-[0.65rem] leading-tight tracking-[0.08em]">
                  Booked
                </DashboardTableHeadCell>
                <DashboardTableHeadCell className="w-[9%] text-[0.65rem] leading-tight tracking-[0.08em]">
                  Total
                </DashboardTableHeadCell>
                <DashboardTableHeadCell className="w-[11%] text-[0.65rem] leading-tight tracking-[0.08em]">
                  Plat. ({commissionPercent}%)
                </DashboardTableHeadCell>
                <DashboardTableHeadCell className="w-[11%] text-[0.65rem] leading-tight tracking-[0.08em]">
                  Payout
                </DashboardTableHeadCell>
                <DashboardTableHeadCell className="w-[14%] text-[0.65rem] leading-tight tracking-[0.08em]">
                  Status
                </DashboardTableHeadCell>
              </DashboardTableHeadRow>
            </DashboardTableHead>
            <DashboardTableBody>
              {filtered.map((booking) => (
                <DashboardTableRow key={booking.id}>
                  <DashboardTableLinkCell
                    to="/admin/bookings/$bookingId"
                    params={{ bookingId: booking.id }}
                    title={<span className="text-sm leading-snug">{booking.guestName ?? "Guest"}</span>}
                    subtitle={
                      booking.guestEmail ? (
                        <span className="break-all text-[0.65rem] leading-snug">{booking.guestEmail}</span>
                      ) : undefined
                    }
                  />
                  <DashboardTableCell className="break-words">
                    <Link
                      to="/admin/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="luxury-panel-link hover:underline"
                    >
                      {booking.experienceTitle}
                    </Link>
                  </DashboardTableCell>
                  <DashboardTableCell className="whitespace-nowrap">
                    {formatDateWeekdayShort(booking.slotDate)}
                  </DashboardTableCell>
                  <DashboardTableCell className="whitespace-nowrap">
                    {formatDateWeekdayShort(booking.createdAt.slice(0, 10))}
                  </DashboardTableCell>
                  <DashboardTableCell className="whitespace-nowrap font-semibold">
                    {formatMoney(booking.totalAmount, booking.currencySymbol)}
                  </DashboardTableCell>
                  <DashboardTableCell className="whitespace-nowrap">
                    {formatMoney(booking.platformFeeMinor, booking.currencySymbol)}
                  </DashboardTableCell>
                  <DashboardTableCell className="whitespace-nowrap">
                    {formatMoney(booking.hostPayoutMinor, booking.currencySymbol)}
                  </DashboardTableCell>
                  <DashboardTableCell className="align-middle">
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
