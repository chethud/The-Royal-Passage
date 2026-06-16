import { useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
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

function filterBtn(active: boolean) {
  return active ? "luxury-btn-sm luxury-btn-primary" : "luxury-btn-sm luxury-btn-panel-outline";
}

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
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((status) => (
          <button
            key={status}
            type="button"
            className={filterBtn(statusFilter === status)}
            onClick={() => setStatusFilter(status)}
          >
            {status === "all" ? "All" : status}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="luxury-panel-body text-sm">No bookings match this filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-[0.14em] luxury-panel-divider luxury-panel-label">
                <th className="px-3 py-2 font-medium">Property</th>
                <th className="px-3 py-2 font-medium">Guest</th>
                <th className="px-3 py-2 font-medium">Dates</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => {
                const busy = busyId === booking.id;
                return (
                  <tr key={booking.id} className="border-b luxury-panel-divider">
                    <td className="px-3 py-3">
                      <div className="luxury-panel-heading font-medium">{booking.homestayTitle}</div>
                      {booking.roomName ? (
                        <div className="luxury-panel-body text-xs">{booking.roomName}</div>
                      ) : null}
                    </td>
                    <td className="luxury-panel-body px-3 py-3">
                      {booking.guestName ?? "Guest"} · {booking.guestCount} guest
                      {booking.guestCount !== 1 ? "s" : ""}
                    </td>
                    <td className="luxury-panel-body px-3 py-3">
                      {formatDateLong(booking.checkIn)} → {formatDateLong(booking.checkOut)}
                      <div className="text-xs opacity-75">{booking.nights} night(s)</div>
                    </td>
                    <td className="luxury-panel-body px-3 py-3">
                      {formatMoney(booking.totalAmount, booking.currencySymbol)}
                    </td>
                    <td className="px-3 py-3">
                      <BookingStatusChip
                        bookingStatus={booking.bookingStatus}
                        paymentStatus={booking.paymentStatus}
                        pendingPaymentLabel="Pay in cash"
                        surface="light"
                      />
                      {booking.bookingStatus === "confirmed" && booking.paymentStatus !== "paid" ? (
                        <div className="luxury-panel-body mt-1 text-xs">Pay in cash at check-in</div>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
