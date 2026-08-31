import { useMemo, useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
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
};

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

export function TravelAgentBookingsTable({
  bookings,
  initialStatus = "all",
  showAgentColumn = false,
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
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "today", label: "Today" },
  ];

  if (bookings.length === 0) {
    return (
      <p className="text-sm luxury-panel-body">
        No client bookings yet. Browse the catalog to place your first booking.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <DashboardTableFilters>
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={hostBookingsFilterBtnClass(status === filter.id)}
            onClick={() => setStatus(filter.id)}
          >
            {filter.label}
            <DashboardFilterCountBadge count={counts[filter.id]} />
          </button>
        ))}
      </DashboardTableFilters>

      <DashboardTableScroll>
        <DashboardTable>
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
            {filtered.length === 0 ? (
              <DashboardTableRow>
                <DashboardTableCell colSpan={showAgentColumn ? 7 : 6}>
                  <span className="text-sm text-muted-foreground">No bookings match this filter.</span>
                </DashboardTableCell>
              </DashboardTableRow>
            ) : (
              filtered.map((row) => (
                <DashboardTableRow key={`${row.kind}-${row.id}`}>
                  <DashboardTableCell>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                      {row.kind === "experience" ? "Experience" : "Homestay"}
                    </span>
                  </DashboardTableCell>
                  <DashboardTableCell>
                    <span className="font-medium">{row.title}</span>
                  </DashboardTableCell>
                  {showAgentColumn ? (
                    <DashboardTableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {(row as AdminTravelAgentBookingSummary).agentCompanyName ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(row as AdminTravelAgentBookingSummary).agentContactName ?? ""}
                        </p>
                      </div>
                    </DashboardTableCell>
                  ) : null}
                  <DashboardTableCell>
                    <div className="text-sm">
                      <p>{row.clientName ?? "—"}</p>
                      {row.clientEmail ? (
                        <p className="text-xs text-muted-foreground">{row.clientEmail}</p>
                      ) : null}
                    </div>
                  </DashboardTableCell>
                  <DashboardTableCell>{bookingDateLabel(row)}</DashboardTableCell>
                  <DashboardTableCell>
                    <div className="text-sm">
                      <p>{formatMoney(row.totalAmount, row.currencySymbol)}</p>
                      {row.agentMarkupMinor > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          incl. markup {formatMoney(row.agentMarkupMinor, row.currencySymbol)}
                        </p>
                      ) : null}
                    </div>
                  </DashboardTableCell>
                  <DashboardTableCell>
                    <BookingStatusChip status={row.bookingStatus} paymentStatus={row.paymentStatus} />
                  </DashboardTableCell>
                </DashboardTableRow>
              ))
            )}
          </DashboardTableBody>
        </DashboardTable>
      </DashboardTableScroll>
    </div>
  );
}
