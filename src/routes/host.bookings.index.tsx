import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import type { BookingDecisionPayload } from "@/components/booking/BookingDecisionDialog";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { HostBookingTable } from "@/components/host/HostBookingTable";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import type { BookingSummary } from "@/lib/api/bookings";
import {
  completeHostBooking,
  confirmHostBooking,
  fetchHostBookings,
  markHostBookingPaid,
  pauseHostBooking,
  rejectHostBooking,
  resumeHostBooking,
} from "@/lib/api/host";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { parseBookingListSearch } from "@/lib/dashboard-booking-filters";
import { useHostAccess } from "@/lib/use-host-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/host/bookings/")({
  validateSearch: parseBookingListSearch,
  head: () => ({
    meta: [
      { title: "Host bookings — The Royal Passage" },
      { name: "description", content: "Manage guest booking requests and COD payments." },
    ],
  }),
  component: HostBookingsPage,
});

function HostBookingsPage() {
  const { status, payment, dateView } = Route.useSearch();
  const { accessToken, ready, loading } = useHostAccess();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const rows = await fetchHostBookings(accessToken);
      setBookings(rows);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load bookings."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  const runAction = async (
    bookingId: string,
    action: (token: string, id: string) => Promise<BookingSummary>,
  ) => {
    if (!accessToken) return;
    setBusyId(bookingId);
    setPageError(null);
    try {
      const updated = await action(accessToken, bookingId);
      setBookings((rows) => rows.map((row) => (row.id === bookingId ? updated : row)));
    } catch (err) {
      setPageError(toErrorMessage(err, "Action failed."));
      throw err;
    } finally {
      setBusyId(null);
    }
  };

  const runDecision = async (
    bookingId: string,
    decision: BookingDecisionPayload,
    action: typeof confirmHostBooking,
  ) => {
    if (!accessToken) return;
    setBusyId(bookingId);
    setPageError(null);
    try {
      const updated = await action(accessToken, bookingId, decision);
      setBookings((rows) => rows.map((row) => (row.id === bookingId ? updated : row)));
    } catch (err) {
      setPageError(toErrorMessage(err, "Action failed."));
      throw err;
    } finally {
      setBusyId(null);
    }
  };

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <HostDashboardShell
      title="Bookings"
      subtitle="Accept or reject requests, pause when needed, mark pay-at-venue payments, and complete sessions."
      showRoleDescription={false}
    >
      {pageLoading ? (
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body py-8 text-sm">Loading bookings…</p>
        </LuxuryCheckoutPanel>
      ) : (
        <LuxuryCheckoutPanel>
          {pageError ? (
            <p className="mb-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {pageError}
            </p>
          ) : null}
          <HostBookingTable
            bookings={bookings}
            busyId={busyId}
            initialStatus={status ?? "all"}
            initialPayment={payment ?? "all"}
            initialDateView={dateView ?? "week"}
            onConfirm={(id, decision) => runDecision(id, decision, confirmHostBooking)}
            onReject={(id, decision) => runDecision(id, decision, rejectHostBooking)}
            onMarkPaid={(id) => void runAction(id, markHostBookingPaid)}
            onComplete={(id) => void runAction(id, completeHostBooking)}
            onPause={(id) => void runAction(id, pauseHostBooking)}
            onResume={(id) => void runAction(id, resumeHostBooking)}
          />
        </LuxuryCheckoutPanel>
      )}
    </HostDashboardShell>
  );
}
