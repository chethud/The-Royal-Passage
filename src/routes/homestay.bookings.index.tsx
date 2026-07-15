import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { OwnerHomestayBookingTable } from "@/components/homestay-owner/OwnerHomestayBookingTable";
import {
  completeOwnerHomestayBooking,
  confirmOwnerHomestayBooking,
  fetchOwnerHomestayBookings,
  markOwnerHomestayBookingPaid,
  rejectOwnerHomestayBooking,
  type HomestayBookingSummary,
} from "@/lib/api/owner-homestay-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHomestayOwnerAccess } from "@/lib/use-homestay-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/homestay/bookings/")({
  head: () => ({
    meta: [{ title: "Homestay bookings — The Royal Passage" }],
  }),
  component: OwnerHomestayBookingsPage,
});

function OwnerHomestayBookingsPage() {
  const { accessToken, ready, loading } = useHomestayOwnerAccess();
  const [bookings, setBookings] = useState<HomestayBookingSummary[]>([]);
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
      setBookings(await fetchOwnerHomestayBookings(accessToken));
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
    action: (token: string, id: string) => Promise<HomestayBookingSummary>,
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
    decision: import("@/components/booking/BookingDecisionDialog").BookingDecisionPayload,
    action: typeof confirmOwnerHomestayBooking,
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
    <HomestayOwnerDashboardShell
      title="Bookings"
      subtitle="Accept or reject stay requests, mark pay-at-property payments, and complete stays."
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
          <OwnerHomestayBookingTable
            bookings={bookings}
            busyId={busyId}
            onConfirm={(id, decision) => runDecision(id, decision, confirmOwnerHomestayBooking)}
            onReject={(id, decision) => runDecision(id, decision, rejectOwnerHomestayBooking)}
            onMarkPaid={(id) => void runAction(id, markOwnerHomestayBookingPaid)}
            onComplete={(id) => void runAction(id, completeOwnerHomestayBooking)}
          />
        </LuxuryCheckoutPanel>
      )}
    </HomestayOwnerDashboardShell>
  );
}
