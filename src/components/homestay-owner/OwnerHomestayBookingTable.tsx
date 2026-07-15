import { useState } from "react";
import {
  BookingDecisionDialog,
  type BookingDecisionPayload,
} from "@/components/booking/BookingDecisionDialog";
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
  onConfirm: (id: string, decision: BookingDecisionPayload) => Promise<void>;
  onReject: (id: string, decision: BookingDecisionPayload) => Promise<void>;
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
  const [decision, setDecision] = useState<{
    booking: HomestayBookingSummary;
    mode: "accept" | "reject";
  } | null>(null);

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
                <DashboardTableHeadCell>Reason</DashboardTableHeadCell>
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
                      {booking.rejectionReason ? (
                        <span className="text-xs leading-snug">{booking.rejectionReason}</span>
                      ) : (
                        <span className="text-xs opacity-50">—</span>
                      )}
                    </DashboardTableCell>
                    <DashboardTableCell>
                      <div className="flex flex-wrap gap-2">
                        {booking.bookingStatus === "pending" ? (
                          <>
                            <button
                              type="button"
                              disabled={busy}
                              className="luxury-btn-sm luxury-btn-primary"
                              onClick={() => setDecision({ booking, mode: "accept" })}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              className="luxury-btn-sm luxury-btn-panel-outline"
                              onClick={() => setDecision({ booking, mode: "reject" })}
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

      <BookingDecisionDialog
        open={Boolean(decision)}
        mode={decision?.mode ?? "accept"}
        title={decision?.mode === "reject" ? "Reject stay request" : "Accept stay request"}
        description={
          decision
            ? decision.mode === "reject"
              ? `Decline ${decision.booking.guestName ?? "the guest"}'s request for ${decision.booking.homestayTitle}. Enter your contact details and a reason.`
              : `Accept ${decision.booking.guestName ?? "the guest"}'s request for ${decision.booking.homestayTitle}. Enter your contact details to confirm.`
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
