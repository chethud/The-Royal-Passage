import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import { HostBookingActions } from "@/components/host/HostBookingActions";
import type { BookingSummary } from "@/lib/api/bookings";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

type HostBookingTableProps = {
  bookings: BookingSummary[];
  busyId: string | null;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onComplete: (id: string) => void;
};

export function HostBookingTable({
  bookings,
  busyId,
  onConfirm,
  onReject,
  onMarkPaid,
  onComplete,
}: HostBookingTableProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">(
    "all",
  );

  const filtered = bookings.filter((b) => filter === "all" || b.bookingStatus === filter);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
              filter === value
                ? "border-ember/70 bg-ember/10 text-ember"
                : "border-[oklch(0.88_0.08_86_/_0.35)] text-foreground/80"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bookings in this view.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-[oklch(0.88_0.08_86_/_0.2)] text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-3 py-2">Guest</th>
                <th className="px-3 py-2">Experience</th>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Guests</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-[oklch(0.88_0.08_86_/_0.1)] last:border-0"
                >
                  <td className="px-3 py-3">
                    <div>{booking.guestName ?? "Guest"}</div>
                    <div className="text-xs text-muted-foreground">{booking.guestEmail}</div>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      to="/host/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="hover:text-ember"
                    >
                      {booking.experience.title}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDateLong(booking.slot.date)}
                    <br />
                    <span className="text-xs">{booking.slot.start}</span>
                  </td>
                  <td className="px-3 py-3">{booking.participantCount}</td>
                  <td className="px-3 py-3 font-display text-lg">
                    {formatMoney(booking.totalAmount, booking.currencySymbol)}
                  </td>
                  <td className="px-3 py-3">
                    <BookingStatusChip
                      bookingStatus={booking.bookingStatus}
                      paymentStatus={booking.paymentStatus}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <HostBookingActions
                      booking={booking}
                      busy={busyId === booking.id}
                      onConfirm={onConfirm}
                      onReject={onReject}
                      onMarkPaid={onMarkPaid}
                      onComplete={onComplete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
