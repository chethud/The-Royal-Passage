import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Clock3,
  Download,
  XCircle,
} from "lucide-react";
import {
  BookingDecisionDialog,
  type BookingDecisionPayload,
} from "@/components/booking/BookingDecisionDialog";
import { HostBookingActions } from "@/components/host/HostBookingActions";
import {
  CornerFiligree,
  MaharajaEmblem,
  OrnamentalDivider,
  PalaceSilhouette,
} from "@/components/site/RoyalHeritageDecor";
import {
  DashboardTable,
  DashboardTableBody,
  DashboardTableCell,
  DashboardTableFilters,
  DashboardTableHead,
  DashboardTableHeadCell,
  DashboardTableHeadRow,
  DashboardTableRow,
  DashboardTableScroll,
  DashboardFilterCountBadge,
  hostBookingsFilterBtnClass,
} from "@/components/ui/DashboardTable";
import type { BookingSummary } from "@/lib/api/bookings";
import type { BookingListStatus, BookingPaymentFilter, BookingDateView } from "@/lib/dashboard-booking-filters";
import { bookingMatchesDateView } from "@/lib/booking-window";
import { formatDateWeekdayShort } from "@/lib/date-format";
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

const PAGE_SIZE = 10;

function DeckCorners() {
  return (
    <>
      <CornerFiligree className="host-bookings-deck__corner host-bookings-deck__corner--tl" />
      <CornerFiligree className="host-bookings-deck__corner host-bookings-deck__corner--tr" />
      <CornerFiligree className="host-bookings-deck__corner host-bookings-deck__corner--bl" />
      <CornerFiligree className="host-bookings-deck__corner host-bookings-deck__corner--br" />
    </>
  );
}

function FilterStripCorners() {
  return (
    <>
      <CornerFiligree className="host-bookings-strip__corner host-bookings-strip__corner--tl" />
      <CornerFiligree className="host-bookings-strip__corner host-bookings-strip__corner--tr" />
      <CornerFiligree className="host-bookings-strip__corner host-bookings-strip__corner--bl" />
      <CornerFiligree className="host-bookings-strip__corner host-bookings-strip__corner--br" />
    </>
  );
}

function SummaryOrnament() {
  return (
    <svg className="host-bookings-summary__ornament" viewBox="0 0 180 42" fill="none" aria-hidden>
      <path d="M12 38 L18 22 Q 28 8, 46 14 L 54 6 L 62 14 Q 80 6, 90 16 Q 100 6, 118 14 L 126 6 L 134 14 Q 152 8, 162 22 L 168 38" stroke="#C9A227" strokeWidth="0.7" />
      <path d="M46 38 V20 M90 38 V18 M134 38 V20" stroke="#C9A227" strokeWidth="0.45" />
      <path d="M28 38 H152" stroke="#C9A227" strokeWidth="0.5" />
    </svg>
  );
}

function HostBookingsEmptyState({
  onViewAll,
  onClearFilters,
}: {
  onViewAll: () => void;
  onClearFilters: () => void;
}) {
  return (
    <div className="host-bookings-empty">
      <PalaceSilhouette className="host-bookings-empty__palace" />
      <div className="host-bookings-empty__content">
        <span className="host-bookings-empty__medallion" aria-hidden>
          <CalendarDays className="host-bookings-empty__medallion-icon" />
        </span>
        <OrnamentalDivider className="host-bookings-empty__divider" />
        <h3 className="host-bookings-empty__title">No bookings in this view</h3>
        <p className="host-bookings-empty__body">
          Try changing the date range or booking status
          <br />
          to view reservations.
        </p>
        <button type="button" className="host-bookings-empty__primary" onClick={onViewAll}>
          View all bookings
        </button>
        <span className="host-bookings-empty__or" aria-hidden>
          <span className="host-bookings-empty__or-line" />
          <span className="host-bookings-empty__or-text">Or</span>
          <span className="host-bookings-empty__or-line" />
        </span>
        <button type="button" className="host-bookings-empty__secondary" onClick={onClearFilters}>
          Clear filters
        </button>
      </div>
    </div>
  );
}

function guestInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "G";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

function exportLedger(rows: BookingSummary[]) {
  const header = ["Guest", "Email", "Experience", "Date", "Time", "Pax", "Total", "Status", "Reason"];
  const lines = rows.map((booking) =>
    [
      booking.guestName ?? "Guest",
      booking.guestEmail ?? "",
      booking.experience.title,
      booking.slot.date,
      booking.slot.start,
      String(booking.participantCount),
      String(booking.totalAmount),
      booking.bookingStatus,
      booking.rejectionReason ?? "",
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "host-bookings.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function HostLedgerStatus({ booking }: { booking: BookingSummary }) {
  const tone = booking.isPaused
    ? "paused"
    : booking.bookingStatus === "pending"
      ? "pending"
      : booking.bookingStatus === "completed"
        ? "completed"
        : booking.bookingStatus === "cancelled"
          ? "cancelled"
          : "confirmed";
  const label = booking.isPaused
    ? "Paused"
    : booking.bookingStatus === "pending"
      ? "Pending"
      : booking.bookingStatus === "completed"
        ? "Completed"
        : booking.bookingStatus === "cancelled"
          ? "Cancelled"
          : "Confirmed";
  const hint =
    !booking.isPaused && booking.bookingStatus === "confirmed" && booking.paymentStatus !== "paid"
      ? "COD"
      : booking.isPaused
        ? "On hold"
        : null;

  return (
    <span className={`host-bookings-status host-bookings-status--${tone}`}>
      {label}
      {hint ? <span className="host-bookings-status__hint">{hint}</span> : null}
    </span>
  );
}

export function HostBookingTable({
  bookings,
  busyId,
  initialStatus = "today",
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
  const [page, setPage] = useState(1);
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
        status: next.status === "today" ? undefined : next.status,
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

  useEffect(() => {
    setPage(1);
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const bookingCounts = useMemo(() => {
    const countFor = (status: StatusFilter, payment: PaymentFilter = "all") =>
      filterBookings(bookings, status, payment, dateView).length;
    return {
      all: countFor("all"),
      today: countFor("today"),
      pending: countFor("pending"),
      confirmed: countFor("confirmed"),
      completed: countFor("completed"),
      cancelled: countFor("cancelled"),
      "cod-pending": countFor("confirmed", "cod-pending"),
    };
  }, [bookings, dateView]);

  const dateViewButtons: { value: BookingDateView; label: string }[] = [
    { value: "all", label: "All dates" },
    { value: "week", label: "Next 7 days" },
    { value: "history", label: "History" },
  ];

  const todaySelected = statusFilter === "today";

  const applyStatus = (status: StatusFilter, payment: PaymentFilter = "all") => {
    setStatusFilter(status);
    setPaymentFilter(payment);
    syncSearch({ status, payment, dateView });
  };

  const viewAllBookings = () => {
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateView("all");
    syncSearch({ status: "all", payment: "all", dateView: "all" });
  };

  const clearFilters = () => {
    setStatusFilter("today");
    setPaymentFilter("all");
    setDateView("week");
    syncSearch({ status: "today", payment: "all", dateView: "week" });
  };

  const summaryRows: {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
    icon: typeof ClipboardList;
  }[] = [
    {
      label: "Total bookings",
      count: bookingCounts.all,
      active: statusFilter === "all" && paymentFilter === "all" && !todaySelected,
      onClick: () => applyStatus("all"),
      icon: ClipboardList,
    },
    {
      label: "Pending",
      count: bookingCounts.pending,
      active: statusFilter === "pending" && paymentFilter === "all",
      onClick: () => applyStatus("pending"),
      icon: Clock3,
    },
    {
      label: "Confirmed",
      count: bookingCounts.confirmed,
      active: statusFilter === "confirmed" && paymentFilter === "all",
      onClick: () => applyStatus("confirmed"),
      icon: CircleDot,
    },
    {
      label: "Completed",
      count: bookingCounts.completed,
      active: statusFilter === "completed",
      onClick: () => applyStatus("completed"),
      icon: CheckCircle2,
    },
    {
      label: "Cancelled",
      count: bookingCounts.cancelled,
      active: statusFilter === "cancelled",
      onClick: () => applyStatus("cancelled"),
      icon: XCircle,
    },
    {
      label: "COD pending",
      count: bookingCounts["cod-pending"],
      active: paymentFilter === "cod-pending",
      onClick: () => applyStatus("confirmed", "cod-pending"),
      icon: Banknote,
    },
  ];

  return (
    <div className="host-bookings-deck">
      <DeckCorners />
      <div className="host-bookings-strip">
        <FilterStripCorners />
        <div className="host-bookings-strip__bar">
          <DashboardTableFilters>
            {dateViewButtons.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  const nextStatus = statusFilter === "today" ? "all" : statusFilter;
                  setDateView(value);
                  if (statusFilter === "today") setStatusFilter("all");
                  syncSearch({ status: nextStatus, payment: paymentFilter, dateView: value });
                }}
                className={hostBookingsFilterBtnClass(!todaySelected && dateView === value)}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => applyStatus("today")}
              className={hostBookingsFilterBtnClass(todaySelected)}
            >
              Today
              <DashboardFilterCountBadge count={bookingCounts.today} />
            </button>
          </DashboardTableFilters>
          <button type="button" className="host-bookings-export" onClick={() => exportLedger(filtered)}>
            <Download size={13} strokeWidth={1.7} />
            Export
          </button>
        </div>
      </div>

      <div className="host-bookings-workspace">
        <aside className="host-bookings-summary">
          <h2 className="host-bookings-summary__title">
            <MaharajaEmblem className="host-bookings-summary__emblem" />
            Quick summary
          </h2>
          <ul className="host-bookings-summary__list">
            {summaryRows.map((row) => {
              const Icon = row.icon;
              return (
                <li key={row.label}>
                  <button
                    type="button"
                    onClick={row.onClick}
                    className={`host-bookings-summary__row ${row.active ? "is-active" : ""}`}
                  >
                    <span className="host-bookings-summary__icon">
                      <Icon size={14} strokeWidth={1.5} />
                    </span>
                    <span className="host-bookings-summary__label">{row.label}</span>
                    <span className="host-bookings-summary__count">{row.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Link to="/host/revenue" className="host-bookings-summary__cta">
            <BarChart3 size={13} strokeWidth={1.6} />
            View revenue report
          </Link>
          <SummaryOrnament />
        </aside>

        <div className={`host-bookings-ledger${filtered.length > 0 ? " host-bookings-ledger--filled" : ""}`}>
          {filtered.length === 0 ? (
            <HostBookingsEmptyState onViewAll={viewAllBookings} onClearFilters={clearFilters} />
          ) : (
            <>
              <DashboardTableScroll>
                <DashboardTable minWidth="lg" layout="fixed" className="host-bookings-table">
                  <colgroup>
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <DashboardTableHead>
                    <DashboardTableHeadRow>
                      <DashboardTableHeadCell>Guest</DashboardTableHeadCell>
                      <DashboardTableHeadCell>Experience</DashboardTableHeadCell>
                      <DashboardTableHeadCell>When</DashboardTableHeadCell>
                      <DashboardTableHeadCell>Pax</DashboardTableHeadCell>
                      <DashboardTableHeadCell>Total</DashboardTableHeadCell>
                      <DashboardTableHeadCell>Status</DashboardTableHeadCell>
                      <DashboardTableHeadCell>Reason</DashboardTableHeadCell>
                      <DashboardTableHeadCell>Actions</DashboardTableHeadCell>
                    </DashboardTableHeadRow>
                  </DashboardTableHead>
                  <DashboardTableBody>
                    {paged.map((booking) => {
                      const name = booking.guestName ?? "Guest";
                      return (
                      <DashboardTableRow key={booking.id}>
                        <DashboardTableCell>
                          <Link
                            to="/host/bookings/$bookingId"
                            params={{ bookingId: booking.id }}
                            className="host-bookings-guest luxury-panel-link"
                          >
                            <span className="host-bookings-guest__avatar">{guestInitials(name)}</span>
                            <span className="host-bookings-guest__copy">
                              <span className="luxury-panel-heading">{name}</span>
                              {booking.guestEmail ? (
                                <span className="luxury-panel-body">{booking.guestEmail}</span>
                              ) : null}
                            </span>
                          </Link>
                        </DashboardTableCell>
                        <DashboardTableCell>
                          <Link
                            to="/host/bookings/$bookingId"
                            params={{ bookingId: booking.id }}
                            className="luxury-panel-link line-clamp-2 hover:underline"
                          >
                            {booking.experience.title}
                          </Link>
                        </DashboardTableCell>
                        <DashboardTableCell>
                          {formatDateWeekdayShort(booking.slot.date)}
                          <br />
                          <span className="text-[0.58rem] opacity-80">{booking.slot.start}</span>
                        </DashboardTableCell>
                        <DashboardTableCell className="text-center">
                          {booking.participantCount}
                        </DashboardTableCell>
                        <DashboardTableCell variant="heading" className="whitespace-nowrap">
                          {formatMoney(booking.totalAmount, booking.currencySymbol)}
                        </DashboardTableCell>
                        <DashboardTableCell>
                          <HostLedgerStatus booking={booking} />
                        </DashboardTableCell>
                        <DashboardTableCell>
                          {booking.rejectionReason ? (
                            <span className="line-clamp-2 text-[0.58rem] leading-snug">
                              {booking.rejectionReason}
                            </span>
                          ) : (
                            <span className="opacity-50">—</span>
                          )}
                        </DashboardTableCell>
                        <DashboardTableCell>
                          <HostBookingActions
                            booking={booking}
                            busy={busyId === booking.id}
                            surface="light"
                            presentation="menu"
                            onConfirm={() => setDecision({ booking, mode: "accept" })}
                            onReject={() => setDecision({ booking, mode: "reject" })}
                            onMarkPaid={onMarkPaid}
                            onComplete={onComplete}
                            onPause={onPause}
                            onResume={onResume}
                          />
                        </DashboardTableCell>
                      </DashboardTableRow>
                      );
                    })}
                  </DashboardTableBody>
                </DashboardTable>
              </DashboardTableScroll>
              {filtered.length > 0 ? (
                <div className="host-bookings-pager">
                  <span className="host-bookings-pager__flourish" aria-hidden />
                  <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: pageCount }, (_, index) => {
                    const n = index + 1;
                    return (
                      <button
                        key={n}
                        type="button"
                        className={page === n ? "is-active" : ""}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                  >
                    <ChevronRight size={14} />
                  </button>
                  <span className="host-bookings-pager__flourish" aria-hidden />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

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
    </div>
  );
}
