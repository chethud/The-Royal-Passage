import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookingDecisionDialog,
  type BookingDecisionPayload,
} from "@/components/booking/BookingDecisionDialog";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import { HostBookingActions } from "@/components/host/HostBookingActions";
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
  onConfirm: (id: string, decision: BookingDecisionPayload) => Promise<void>;
  onReject: (id: string, decision: BookingDecisionPayload) => Promise<void>;
  onMarkPaid: (id: string) => void;
  onComplete: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
};

type StatusFilter = BookingListStatus;
type PaymentFilter = BookingPaymentFilter;

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
  const navigate = useNavigate({ from: "/host/bookings/" });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>(initialPayment);
  const [dateView, setDateView] = useState<BookingDateView>(initialDateView);
  const [decision, setDecision] = useState<{
    booking: BookingSummary;
    mode: "accept" | "reject";
  } | null>(null);

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
    status: StatusFilter;
    payment: PaymentFilter;
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
    () => filterBookings(bookings, statusFilter, paymentFilter, dateView),
    [bookings, dateView, paymentFilter, statusFilter],
  );

  const dateViewButtons: { value: BookingDateView; label: string }[] = [
    { value: "all", label: "All dates" },
    { value: "week", label: "Next 7 days" },
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

      <DashboardTableFilters>
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
      </DashboardTableFilters>

      {filtered.length === 0 ? (
        <DashboardTableEmpty>No bookings in this view.</DashboardTableEmpty>
      ) : (
        <DashboardTableScroll>
          <DashboardTable minWidth="xl">
            <DashboardTableHead>
              <DashboardTableHeadRow>
                <DashboardTableHeadCell>Guest</DashboardTableHeadCell>
                <DashboardTableHeadCell>Experience</DashboardTableHeadCell>
                <DashboardTableHeadCell>When</DashboardTableHeadCell>
                <DashboardTableHeadCell>Guests</DashboardTableHeadCell>
                <DashboardTableHeadCell>Total</DashboardTableHeadCell>
                <DashboardTableHeadCell>Status</DashboardTableHeadCell>
                <DashboardTableHeadCell>Reason</DashboardTableHeadCell>
                <DashboardTableHeadCell>Actions</DashboardTableHeadCell>
              </DashboardTableHeadRow>
            </DashboardTableHead>
            <DashboardTableBody>
              {filtered.map((booking) => (
                <DashboardTableRow key={booking.id}>
                  <DashboardTableLinkCell
                    to="/host/bookings/$bookingId"
                    params={{ bookingId: booking.id }}
                    title={booking.guestName ?? "Guest"}
                    subtitle={booking.guestEmail}
                  />
                  <DashboardTableCell>
                    <Link
                      to="/host/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="luxury-panel-link hover:underline"
                    >
                      {booking.experience.title}
                    </Link>
                  </DashboardTableCell>
                  <DashboardTableCell>
                    {formatDateLong(booking.slot.date)}
                    <br />
                    <span className="text-xs">{booking.slot.start}</span>
                  </DashboardTableCell>
                  <DashboardTableCell>{booking.participantCount}</DashboardTableCell>
                  <DashboardTableCell variant="money">
                    {formatMoney(booking.totalAmount, booking.currencySymbol)}
                  </DashboardTableCell>
                  <DashboardTableCell>
                    <BookingStatusChip
                      bookingStatus={booking.bookingStatus}
                      paymentStatus={booking.paymentStatus}
                      isPaused={booking.isPaused}
                      surface="light"
                    />
                  </DashboardTableCell>
                  <DashboardTableCell>
                    {booking.rejectionReason ? (
                      <span className="text-xs leading-snug">{booking.rejectionReason}</span>
                    ) : (
                      <span className="text-xs opacity-50">—</span>
                    )}
                  </DashboardTableCell>
                  <DashboardTableCell>
                    <HostBookingActions
                      booking={booking}
                      busy={busyId === booking.id}
                      surface="light"
                      onConfirm={() => setDecision({ booking, mode: "accept" })}
                      onReject={() => setDecision({ booking, mode: "reject" })}
                      onMarkPaid={onMarkPaid}
                      onComplete={onComplete}
                      onPause={onPause}
                      onResume={onResume}
                    />
                  </DashboardTableCell>
                </DashboardTableRow>
              ))}
            </DashboardTableBody>
          </DashboardTable>
        </DashboardTableScroll>
      )}

      <BookingDecisionDialog
        open={Boolean(decision)}
        mode={decision?.mode ?? "accept"}
        title={decision?.mode === "reject" ? "Reject booking" : "Accept booking"}
        description={
          decision
            ? decision.mode === "reject"
              ? `Decline ${decision.booking.guestName ?? "the guest"}'s request for ${decision.booking.experience.title}. Enter your contact details and a reason.`
              : `Accept ${decision.booking.guestName ?? "the guest"}'s request for ${decision.booking.experience.title}. Enter your contact details to confirm.`
            : ""
        }
        busy={Boolean(decision && busyId === decision.booking.id)}
        onClose={() => setDecision(null)}
        onConfirm={async (payload) => {
          if (!decision) return;
          if (decision.mode === "reject") {
            await onReject(decision.booking.id, payload);
          } else {
            await onConfirm(decision.booking.id, payload);
          }
        }}
      />
    </DashboardTableSection>
  );
}
