import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import { PayAtVenueBadge } from "@/components/booking/PayAtVenueBadge";
import { HostBookingActions } from "@/components/host/HostBookingActions";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { formatDateLong, formatDateWeekdayShort } from "@/lib/date-format";
import {
  getHostBookingDetail,
  hostCompleteBooking,
  hostConfirmBooking,
  hostMarkBookingPaid,
  hostRejectBooking,
  type BookingSummary,
} from "@/lib/host-fns";
import { formatMoney } from "@/lib/money";
import { useHostAccess } from "@/lib/use-host-access";

export const Route = createFileRoute("/host/bookings/$bookingId")({
  head: () => ({
    meta: [{ title: "Host booking detail — The Royal Passage" }],
  }),
  component: HostBookingDetailPage,
});

function HostBookingDetailPage() {
  const { bookingId } = Route.useParams();
  const { accessToken, ready, loading } = useHostAccess();
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadBooking = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const row = await getHostBookingDetail({ data: { accessToken, bookingId } });
      setBooking(row);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to load booking.");
    } finally {
      setPageLoading(false);
    }
  }, [accessToken, bookingId]);

  useEffect(() => {
    if (!ready) return;
    void loadBooking();
  }, [loadBooking, ready]);

  const runAction = async (
    action: (input: {
      data: { accessToken: string; bookingId: string };
    }) => Promise<BookingSummary>,
  ) => {
    if (!accessToken) return;
    setBusy(true);
    setPageError(null);
    try {
      const updated = await action({ data: { accessToken, bookingId } });
      setBooking(updated);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !ready || pageLoading) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  if (pageError || !booking) {
    return (
      <HostDashboardShell title="Booking" subtitle="Booking details and host actions.">
        <p className="text-destructive">{pageError ?? "Booking not found."}</p>
        <Link to="/host/bookings" className="mt-4 inline-block text-ember hover:underline">
          Back to bookings
        </Link>
      </HostDashboardShell>
    );
  }

  return (
    <HostDashboardShell
      title="Booking detail"
      subtitle="Review guest information and manage this reservation."
    >
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="eyebrow mb-2 text-muted-foreground">Reference</div>
            <h2 className="font-display text-3xl">{booking.experience.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ref: {booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <BookingStatusChip
            bookingStatus={booking.bookingStatus}
            paymentStatus={booking.paymentStatus}
          />
        </div>

        <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8">
          <dl className="grid gap-5 sm:grid-cols-2 text-sm">
            <div>
              <dt className="eyebrow text-muted-foreground">Guest</dt>
              <dd className="mt-1">{booking.guestName ?? "Guest"}</dd>
              <dd className="text-xs text-muted-foreground">{booking.guestEmail}</dd>
              {booking.guestPhone ? (
                <dd className="text-xs text-muted-foreground">{booking.guestPhone}</dd>
              ) : null}
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">When</dt>
              <dd className="mt-1 font-display text-lg">
                {formatDateWeekdayShort(booking.slot.date)}, {booking.slot.start}
              </dd>
              <dd className="text-xs text-muted-foreground">{formatDateLong(booking.slot.date)}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Where</dt>
              <dd className="mt-1">{booking.experience.address || booking.experience.city}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Guests</dt>
              <dd className="mt-1">{booking.participantCount}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Total</dt>
              <dd className="mt-1 font-display text-2xl">
                {formatMoney(booking.totalAmount, booking.currencySymbol)}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Payment</dt>
              <dd className="mt-1 capitalize">
                Pay at venue
                {booking.paymentStatus === "paid" ? " · Paid" : " · Pending"}
              </dd>
            </div>
          </dl>

          {booking.notes ? (
            <div className="mt-6 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-5">
              <div className="eyebrow text-muted-foreground">Guest notes</div>
              <p className="mt-2 text-sm">{booking.notes}</p>
            </div>
          ) : null}

          <div className="mt-6">
            <PayAtVenueBadge />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <HostBookingActions
            booking={booking}
            busy={busy}
            layout="stack"
            onConfirm={() => void runAction(hostConfirmBooking)}
            onReject={() => void runAction(hostRejectBooking)}
            onMarkPaid={() => void runAction(hostMarkBookingPaid)}
            onComplete={() => void runAction(hostCompleteBooking)}
          />
          <Link
            to="/host/bookings"
            className="rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-2 text-sm hover:border-ember/50"
          >
            Back to bookings
          </Link>
        </div>
      </div>
    </HostDashboardShell>
  );
}
