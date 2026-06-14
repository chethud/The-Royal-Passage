import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BookingStatusChip } from "@/components/booking/BookingStatusChip";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { PayAtVenueBadge } from "@/components/booking/PayAtVenueBadge";
import { HostBookingActions } from "@/components/host/HostBookingActions";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { formatDateLong, formatDateWeekdayShort } from "@/lib/date-format";
import type { BookingSummary } from "@/lib/api/bookings";
import {
  completeHostBooking,
  confirmHostBooking,
  fetchHostBooking,
  markHostBookingPaid,
  pauseHostBooking,
  rejectHostBooking,
  resumeHostBooking,
} from "@/lib/api/host";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
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
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const row = await fetchHostBooking(accessToken, bookingId);
      setBooking(row);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load booking."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken, bookingId]);

  useEffect(() => {
    if (!ready) return;
    void loadBooking();
  }, [loadBooking, ready]);

  const runAction = async (
    action: (token: string, id: string) => Promise<BookingSummary>,
  ) => {
    if (!accessToken) return;
    setBusy(true);
    setPageError(null);
    try {
      const updated = await action(accessToken, bookingId);
      setBooking(updated);
    } catch (err) {
      setPageError(toErrorMessage(err, "Action failed."));
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
        <LuxuryCheckoutPanel>
          <p className="text-destructive">{pageError ?? "Booking not found."}</p>
          <Link
            to="/host/bookings"
            className="luxury-btn-sm luxury-btn-panel-outline mt-4 inline-flex items-center no-underline"
          >
            Back to bookings
          </Link>
        </LuxuryCheckoutPanel>
      </HostDashboardShell>
    );
  }

  return (
    <HostDashboardShell
      title="Booking detail"
      subtitle="Review guest information and manage this reservation."
    >
      <LuxuryCheckoutPanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="eyebrow luxury-panel-label">Reference</div>
            <h2 className="luxury-panel-heading mt-2 font-display text-2xl uppercase leading-tight tracking-[0.05em] sm:text-3xl">
              {booking.experience.title}
            </h2>
            <p className="luxury-panel-body mt-2 text-sm">
              Ref: {booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <BookingStatusChip
            bookingStatus={booking.bookingStatus}
            paymentStatus={booking.paymentStatus}
            isPaused={booking.isPaused}
            surface="light"
          />
        </div>

        <dl className="mt-8 grid gap-5 border-t text-sm luxury-panel-divider pt-8 sm:grid-cols-2">
          <div>
            <dt className="eyebrow luxury-panel-label">Guest</dt>
            <dd className="luxury-panel-body mt-1">{booking.guestName ?? "Guest"}</dd>
            <dd className="luxury-panel-body text-xs">{booking.guestEmail}</dd>
            {booking.guestPhone ? (
              <dd className="luxury-panel-body text-xs">{booking.guestPhone}</dd>
            ) : null}
          </div>
          <div>
            <dt className="eyebrow luxury-panel-label">When</dt>
            <dd className="luxury-panel-heading mt-1 font-display text-lg">
              {formatDateWeekdayShort(booking.slot.date)}, {booking.slot.start}
            </dd>
            <dd className="luxury-panel-body text-xs">{formatDateLong(booking.slot.date)}</dd>
          </div>
          <div>
            <dt className="eyebrow luxury-panel-label">Where</dt>
            <dd className="luxury-panel-body mt-1">
              {booking.experience.address || booking.experience.city}
            </dd>
          </div>
          <div>
            <dt className="eyebrow luxury-panel-label">Guests</dt>
            <dd className="luxury-panel-body mt-1">{booking.participantCount}</dd>
          </div>
          <div>
            <dt className="eyebrow luxury-panel-label">Total</dt>
            <dd className="luxury-panel-heading mt-1 font-display text-2xl">
              {formatMoney(booking.totalAmount, booking.currencySymbol)}
            </dd>
          </div>
          <div>
            <dt className="eyebrow luxury-panel-label">Payment</dt>
            <dd className="luxury-panel-body mt-1 capitalize">
              Pay at venue
              {booking.paymentStatus === "paid" ? " · Paid" : " · Pending"}
            </dd>
          </div>
        </dl>

        {booking.notes ? (
          <div className="mt-6 border-t luxury-panel-divider pt-5">
            <div className="eyebrow luxury-panel-label">Guest notes</div>
            <p className="luxury-panel-body mt-2 text-sm">{booking.notes}</p>
          </div>
        ) : null}

        <div className="mt-6 border-t luxury-panel-divider pt-6">
          <PayAtVenueBadge surface="light" />
        </div>
      </LuxuryCheckoutPanel>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <HostBookingActions
          booking={booking}
          busy={busy}
          layout="stack"
          surface="light"
          onConfirm={() => void runAction(confirmHostBooking)}
          onReject={() => void runAction(rejectHostBooking)}
          onMarkPaid={() => void runAction(markHostBookingPaid)}
          onComplete={() => void runAction(completeHostBooking)}
          onPause={() => void runAction(pauseHostBooking)}
          onResume={() => void runAction(resumeHostBooking)}
        />
        <Link
          to="/host/bookings"
          className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
        >
          Back to bookings
        </Link>
      </div>
    </HostDashboardShell>
  );
}
