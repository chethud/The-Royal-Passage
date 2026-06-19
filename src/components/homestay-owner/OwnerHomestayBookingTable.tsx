import { useState } from "react";
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
  DashboardTableRow,
  DashboardTableScroll,
  DashboardTableSection,
  dashboardFilterBtnClass,
} from "@/components/ui/DashboardTable";
import type { HomestayBookingSummary } from "@/lib/api/owner-homestay-bookings";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

type OwnerHomestayBookingTableProps = {
  bookings: HomestayBookingSummary[];
  busyId: string | null;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onComplete: (id: string) => void;
};

export function OwnerHomestayBookingTable({
  bookings,
  busyId,
  onConfirm,
  onReject,
  onMarkPaid,
  onComplete,
}: OwnerHomestayBookingTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = bookings.filter((b) => {
    if (statusFilter === "all") return true;
    return b.bookingStatus === statusFilter;
  });

  return (
    <DashboardTableSection>
      <DashboardTableFilters>
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((status) => (
          <button
            key={status}
            type="button"
            className={dashboardFilterBtnClass(statusFilter === status)}
            onClick={() => setStatusFilter(status)}
          >
            {status === "all" ? "All" : status}
          </button>
        ))}
      </DashboardTableFilters>

      {filtered.length === 0 ? (
        <DashboardTableEmpty>No bookings match this filter.</DashboardTableEmpty>
      ) : (
        <DashboardTableScroll>
          <DashboardTable minWidth="xl">
            <DashboardTableHead>
              <DashboardTableHeadRow>
                <DashboardTableHeadCell>Property</DashboardTableHeadCell>
                <DashboardTableHeadCell>Guest</DashboardTableHeadCell>
                <DashboardTableHeadCell>Dates</DashboardTableHeadCell>
                <DashboardTableHeadCell>Amount</DashboardTableHeadCell>
                <DashboardTableHeadCell>Status</DashboardTableHeadCell>
                <DashboardTableHeadCell>Actions</DashboardTableHeadCell>
              </DashboardTableHeadRow>
            </DashboardTableHead>
            <DashboardTableBody>
              {filtered.map((booking) => {
                const busy = busyId === booking.id;
                return (
                  <DashboardTableRow key={booking.id}>
                    <DashboardTableCell variant="heading">
                      <div className="font-medium">{booking.homestayTitle}</div>
                      {booking.roomName ? (
                        <div className="luxury-panel-body text-xs">{booking.roomName}</div>
                      ) : null}
                    </DashboardTableCell>
                    <DashboardTableCell>
                      {booking.guestName ?? "Guest"} · {booking.guestCount} guest
                      {booking.guestCount !== 1 ? "s" : ""}
                    </DashboardTableCell>
                    <DashboardTableCell>
                      {formatDateLong(booking.checkIn)} → {formatDateLong(booking.checkOut)}
                      <div className="text-xs opacity-75">{booking.nights} night(s)</div>
                    </DashboardTableCell>
                    <DashboardTableCell variant="heading">
                      {formatMoney(booking.totalAmount, booking.currencySymbol)}
                    </DashboardTableCell>
                    <DashboardTableCell>
                      <BookingStatusChip
                        bookingStatus={booking.bookingStatus}
                        paymentStatus={booking.paymentStatus}
                        pendingPaymentLabel="Pay in cash"
                        surface="light"
                      />
                      {booking.bookingStatus === "confirmed" && booking.paymentStatus !== "paid" ? (
                        <div className="luxury-panel-body mt-1 text-xs">Pay in cash at check-in</div>
                      ) : null}
                    </DashboardTableCell>
                    <DashboardTableCell>
                      <div className="flex flex-wrap gap-2">
                        {booking.bookingStatus === "pending" ? (
                          <>
                            <button
                              type="button"
                              disabled={busy}
                              className="luxury-btn-sm luxury-btn-primary"
                              onClick={() => onConfirm(booking.id)}
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              className="luxury-btn-sm luxury-btn-panel-outline"
                              onClick={() => onReject(booking.id)}
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                        {booking.bookingStatus === "confirmed" && booking.paymentStatus !== "paid" ? (
                          <button
                            type="button"
                            disabled={busy}
                            className="luxury-btn-sm luxury-btn-panel-outline"
                            onClick={() => onMarkPaid(booking.id)}
                          >
                            Mark cash received
                          </button>
                        ) : null}
                        {booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid" ? (
                          <button
                            type="button"
                            disabled={busy}
                            className="luxury-btn-sm luxury-btn-primary"
                            onClick={() => onComplete(booking.id)}
                          >
                            Complete
                          </button>
                        ) : null}
                      </div>
                    </DashboardTableCell>
                  </DashboardTableRow>
                );
              })}
            </DashboardTableBody>
          </DashboardTable>
        </DashboardTableScroll>
      )}
    </DashboardTableSection>
  );
}
