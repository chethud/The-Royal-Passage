import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import {
  CornerFiligree,
  MaharajaEmblem,
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
  hostBookingsFilterBtnClass,
} from "@/components/ui/DashboardTable";
import type {
  AdminTravelAgentBookingSummary,
  TravelAgentBookingSummary,
} from "@/lib/api/travel-agent-bookings";
import type { BookingListStatus } from "@/lib/dashboard-booking-filters";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { formatTime12h } from "@/lib/weekday-slots";

type TravelAgentBookingsTableProps = {
  bookings: TravelAgentBookingSummary[] | AdminTravelAgentBookingSummary[];
  initialStatus?: BookingListStatus;
  showAgentColumn?: boolean;
  compact?: boolean;
};

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

function bookingDateLabel(row: TravelAgentBookingSummary): string {
  if (row.kind === "homestay" && row.checkIn) {
    const out = row.checkOut ? ` → ${formatDateLong(row.checkOut)}` : "";
    return `${formatDateLong(row.checkIn)}${out}`;
  }
  if (row.slotDate) {
    const time =
      row.slotStart && row.slotEnd
        ? ` · ${formatTime12h(row.slotStart)} – ${formatTime12h(row.slotEnd)}`
        : "";
    return `${formatDateLong(row.slotDate)}${time}`;
  }
  return "—";
}

function filterRows(bookings: TravelAgentBookingSummary[], status: BookingListStatus) {
  const today = new Date().toISOString().slice(0, 10);
  return bookings.filter((row) => {
    if (status === "all") return true;
    if (status === "today") {
      if (!["pending", "confirmed"].includes(row.bookingStatus)) return false;
      const day = row.kind === "homestay" ? row.checkIn : row.slotDate;
      return day?.slice(0, 10) === today;
    }
    return row.bookingStatus === status;
  });
}

function TravelAgentBookingsEmptyState({ onViewAll }: { onViewAll: () => void }) {
  return (
    <div className="host-bookings-empty">
      <PalaceSilhouette className="host-bookings-empty__palace" />
      <div className="host-bookings-empty__content">
        <span className="host-bookings-empty__medallion" aria-hidden>
          <CalendarDays className="host-bookings-empty__medallion-icon" />
        </span>
        <h3 className="host-bookings-empty__title">No bookings in this view</h3>
        <p className="host-bookings-empty__body">
          Try another status filter
          <br />
          or book for a client from the catalog.
        </p>
        <Link to="/travel-agent/catalog" className="host-bookings-empty__primary no-underline">
          Book for client
        </Link>
        <button type="button" className="host-bookings-empty__secondary" onClick={onViewAll}>
          View all bookings
        </button>
      </div>
    </div>
  );
}

export function TravelAgentBookingsTable({
  bookings,
  initialStatus = "all",
  showAgentColumn = false,
  compact = false,
}: TravelAgentBookingsTableProps) {
  const [status, setStatus] = useState<BookingListStatus>(initialStatus);

  const filtered = useMemo(() => filterRows(bookings, status), [bookings, status]);

  const counts = useMemo(() => {
    const map: Record<BookingListStatus, number> = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      today: 0,
    };
    for (const row of bookings) {
      if (row.bookingStatus in map) {
        map[row.bookingStatus as keyof typeof map] += 1;
      }
      if (["pending", "confirmed"].includes(row.bookingStatus)) {
        const day = row.kind === "homestay" ? row.checkIn : row.slotDate;
        if (day?.slice(0, 10) === new Date().toISOString().slice(0, 10)) {
          map.today += 1;
        }
      }
    }
    return map;
  }, [bookings]);

  const filters: { id: BookingListStatus; label: string }[] = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const summaryRows = [
    { label: "All bookings", count: counts.all, status: "all" as const, icon: ClipboardList },
    { label: "Today", count: counts.today, status: "today" as const, icon: CalendarDays },
    { label: "Pending", count: counts.pending, status: "pending" as const, icon: Clock3 },
    { label: "Confirmed", count: counts.confirmed, status: "confirmed" as const, icon: ShieldCheck },
    { label: "Completed", count: counts.completed, status: "completed" as const, icon: CheckCircle2 },
    { label: "Cancelled", count: counts.cancelled, status: "cancelled" as const, icon: XCircle },
  ];

  if (bookings.length === 0) {
    return (
      <div className="host-overview-panel host-overview-action">
        <p className="host-overview-action__empty">
          No client bookings yet.{" "}
          <Link to="/travel-agent/catalog" className="luxury-panel-link underline">
            Browse the catalog
          </Link>{" "}
          to place your first booking.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="host-overview-action__list">
        {filtered.slice(0, 5).map((row) => (
          <div
            key={`${row.kind}-${row.id}`}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgb(74_0_0/0.1)] py-3 last:border-0"
          >
            <div>
              <p className="luxury-panel-heading text-base">{row.title}</p>
              <p className="luxury-panel-body text-sm">
                {row.clientName ?? "Client"} · {bookingDateLabel(row)}
              </p>
            </div>
            <BookingStatusChip status={row.bookingStatus} paymentStatus={row.paymentStatus} surface="light" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="host-bookings-deck">
      <DeckCorners />
      <div className="host-bookings-strip">
        <FilterStripCorners />
        <div className="host-bookings-strip__bar">
          <DashboardTableFilters>
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={hostBookingsFilterBtnClass(status === filter.id)}
                onClick={() => setStatus(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </DashboardTableFilters>
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
                    onClick={() => setStatus(row.status)}
                    className={`host-bookings-summary__row ${status === row.status ? "is-active" : ""}`}
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
          <Link to="/travel-agent/catalog" className="host-bookings-summary__cta">
            Book for client →
          </Link>
        </aside>

        <div className={`host-bookings-ledger${filtered.length > 0 ? " host-bookings-ledger--filled" : ""}`}>
          {filtered.length === 0 ? (
            <TravelAgentBookingsEmptyState onViewAll={() => setStatus("all")} />
          ) : (
            <DashboardTableScroll>
              <DashboardTable minWidth="lg" layout="fixed" className="host-bookings-table">
                <DashboardTableHead>
                  <DashboardTableHeadRow>
                    <DashboardTableHeadCell>Type</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Listing</DashboardTableHeadCell>
                    {showAgentColumn ? <DashboardTableHeadCell>Agency</DashboardTableHeadCell> : null}
                    <DashboardTableHeadCell>Client</DashboardTableHeadCell>
                    <DashboardTableHeadCell>When</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Total</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Status</DashboardTableHeadCell>
                  </DashboardTableHeadRow>
                </DashboardTableHead>
                <DashboardTableBody>
                  {filtered.map((row) => (
                    <DashboardTableRow key={`${row.kind}-${row.id}`}>
                      <DashboardTableCell>
                        <span className="luxury-panel-label text-[0.62rem]">
                          {row.kind === "experience" ? "Experience" : "Homestay"}
                        </span>
                      </DashboardTableCell>
                      <DashboardTableCell variant="heading">{row.title}</DashboardTableCell>
                      {showAgentColumn ? (
                        <DashboardTableCell>
                          <p className="luxury-panel-heading text-sm">
                            {(row as AdminTravelAgentBookingSummary).agentCompanyName ?? "—"}
                          </p>
                          <p className="luxury-panel-body text-xs">
                            {(row as AdminTravelAgentBookingSummary).agentContactName ?? ""}
                          </p>
                        </DashboardTableCell>
                      ) : null}
                      <DashboardTableCell>
                        <p className="luxury-panel-heading text-sm">{row.clientName ?? "—"}</p>
                        {row.clientEmail ? (
                          <p className="luxury-panel-body text-xs">{row.clientEmail}</p>
                        ) : null}
                      </DashboardTableCell>
                      <DashboardTableCell>{bookingDateLabel(row)}</DashboardTableCell>
                      <DashboardTableCell variant="heading" className="whitespace-nowrap">
                        {formatMoney(row.totalAmount, row.currencySymbol)}
                        {row.agentMarkupMinor > 0 ? (
                          <span className="luxury-panel-body mt-0.5 block text-[0.62rem] font-normal normal-case tracking-normal">
                            +{formatMoney(row.agentMarkupMinor, row.currencySymbol)} markup
                          </span>
                        ) : null}
                      </DashboardTableCell>
                      <DashboardTableCell>
                        <BookingStatusChip
                          status={row.bookingStatus}
                          paymentStatus={row.paymentStatus}
                          surface="light"
                        />
                      </DashboardTableCell>
                    </DashboardTableRow>
                  ))}
                </DashboardTableBody>
              </DashboardTable>
            </DashboardTableScroll>
          )}
        </div>
      </div>
    </div>
  );
}
