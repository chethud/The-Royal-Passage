import { useMemo } from "react";
import type { AdminBookingRow } from "@/lib/api/admin";
import type { AdminHomestayBookingRow } from "@/lib/api/admin-homestays";
import { isPendingBookingOverdue } from "@/hooks/use-admin-module-alerts";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import {
  DashboardTable,
  DashboardTableBody,
  DashboardTableCell,
  DashboardTableEmpty,
  DashboardTableHead,
  DashboardTableHeadCell,
  DashboardTableHeadRow,
  DashboardTableLinkCell,
  DashboardTableRow,
  DashboardTableScroll,
  DashboardTableSection,
} from "@/components/ui/DashboardTable";

function OverdueChip({ overdue }: { overdue: boolean }) {
  if (!overdue) {
    return (
      <span className="inline-flex rounded-sm border border-[oklch(0.72_0.08_78_/_0.35)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ember/90">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-sm border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-destructive">
      Overdue
    </span>
  );
}

function sortByOverdueFirst<T extends { createdAt: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const aOverdue = isPendingBookingOverdue(a.createdAt) ? 1 : 0;
    const bOverdue = isPendingBookingOverdue(b.createdAt) ? 1 : 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

type ExperiencePendingProps = {
  bookings: AdminBookingRow[];
};

export function AdminExperiencePendingBookingsTable({ bookings }: ExperiencePendingProps) {
  const rows = useMemo(() => sortByOverdueFirst(bookings), [bookings]);

  if (rows.length === 0) {
    return <DashboardTableEmpty>No pending bookings awaiting host accept.</DashboardTableEmpty>;
  }

  return (
    <DashboardTableSection>
      <DashboardTableScroll>
        <DashboardTable>
          <DashboardTableHead>
            <DashboardTableHeadRow>
              <DashboardTableHeadCell>Guest</DashboardTableHeadCell>
              <DashboardTableHeadCell>Experience</DashboardTableHeadCell>
              <DashboardTableHeadCell>Host</DashboardTableHeadCell>
              <DashboardTableHeadCell>Requested</DashboardTableHeadCell>
              <DashboardTableHeadCell>Status</DashboardTableHeadCell>
              <DashboardTableHeadCell>Total</DashboardTableHeadCell>
            </DashboardTableHeadRow>
          </DashboardTableHead>
          <DashboardTableBody>
            {rows.map((booking) => {
              const overdue = isPendingBookingOverdue(booking.createdAt);
              return (
                <DashboardTableRow key={booking.id}>
                  <DashboardTableLinkCell
                    to="/admin/bookings/$bookingId"
                    params={{ bookingId: booking.id }}
                    title={booking.guestName || booking.guestEmail || "Guest"}
                    subtitle={booking.guestEmail || undefined}
                  />
                  <DashboardTableCell>{booking.experienceTitle}</DashboardTableCell>
                  <DashboardTableCell>{booking.hostName || "—"}</DashboardTableCell>
                  <DashboardTableCell>{formatDateLong(booking.createdAt)}</DashboardTableCell>
                  <DashboardTableCell>
                    <OverdueChip overdue={overdue} />
                  </DashboardTableCell>
                  <DashboardTableCell>
                    {formatMoney(booking.totalAmount, booking.currencySymbol)}
                  </DashboardTableCell>
                </DashboardTableRow>
              );
            })}
          </DashboardTableBody>
        </DashboardTable>
      </DashboardTableScroll>
    </DashboardTableSection>
  );
}

type HomestayPendingProps = {
  bookings: AdminHomestayBookingRow[];
};

export function AdminHomestayPendingBookingsTable({ bookings }: HomestayPendingProps) {
  const rows = useMemo(() => sortByOverdueFirst(bookings), [bookings]);

  if (rows.length === 0) {
    return <DashboardTableEmpty>No pending stay bookings awaiting owner accept.</DashboardTableEmpty>;
  }

  return (
    <DashboardTableSection>
      <DashboardTableScroll>
        <DashboardTable>
          <DashboardTableHead>
            <DashboardTableHeadRow>
              <DashboardTableHeadCell>Guest</DashboardTableHeadCell>
              <DashboardTableHeadCell>Homestay</DashboardTableHeadCell>
              <DashboardTableHeadCell>Check-in</DashboardTableHeadCell>
              <DashboardTableHeadCell>Check-out</DashboardTableHeadCell>
              <DashboardTableHeadCell>Requested</DashboardTableHeadCell>
              <DashboardTableHeadCell>Status</DashboardTableHeadCell>
            </DashboardTableHeadRow>
          </DashboardTableHead>
          <DashboardTableBody>
            {rows.map((booking) => {
              const overdue = isPendingBookingOverdue(booking.createdAt);
              return (
                <DashboardTableRow key={booking.id}>
                  <DashboardTableCell>{booking.guestName || "Guest"}</DashboardTableCell>
                  <DashboardTableLinkCell
                    to="/admin/homestays/$homestayId"
                    params={{ homestayId: booking.homestayId }}
                    title={booking.homestayTitle}
                  />
                  <DashboardTableCell>{formatDateLong(booking.checkIn)}</DashboardTableCell>
                  <DashboardTableCell>{formatDateLong(booking.checkOut)}</DashboardTableCell>
                  <DashboardTableCell>{formatDateLong(booking.createdAt)}</DashboardTableCell>
                  <DashboardTableCell>
                    <OverdueChip overdue={overdue} />
                  </DashboardTableCell>
                </DashboardTableRow>
              );
            })}
          </DashboardTableBody>
        </DashboardTable>
      </DashboardTableScroll>
    </DashboardTableSection>
  );
}
