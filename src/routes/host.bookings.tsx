import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HostBookingTable } from "@/components/host/HostBookingTable";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import {
  hostCompleteBooking,
  hostConfirmBooking,
  hostMarkBookingPaid,
  hostRejectBooking,
  listHostBookings,
  type BookingSummary,
} from "@/lib/host-fns";
import { useHostAccess } from "@/lib/use-host-access";

export const Route = createFileRoute("/host/bookings")({
  head: () => ({
    meta: [
      { title: "Host bookings — The Royal Passage" },
      { name: "description", content: "Manage guest booking requests and COD payments." },
    ],
  }),
  component: HostBookingsPage,
});

function HostBookingsPage() {
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
      const rows = await listHostBookings({ data: { accessToken } });
      setBookings(rows);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to load bookings.");
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
    action: (input: {
      data: { accessToken: string; bookingId: string };
    }) => Promise<BookingSummary>,
  ) => {
    if (!accessToken) return;
    setBusyId(bookingId);
    setPageError(null);
    try {
      const updated = await action({ data: { accessToken, bookingId } });
      setBookings((rows) => rows.map((row) => (row.id === bookingId ? updated : row)));
      await loadPage();
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading || !ready) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <HostDashboardShell
      title="Bookings"
      subtitle="Accept or reject requests, mark pay-at-venue payments, and complete sessions."
    >
      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading bookings…</p>
      ) : pageError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : (
        <HostBookingTable
          bookings={bookings}
          busyId={busyId}
          onConfirm={(id) => void runAction(id, hostConfirmBooking)}
          onReject={(id) => void runAction(id, hostRejectBooking)}
          onMarkPaid={(id) => void runAction(id, hostMarkBookingPaid)}
          onComplete={(id) => void runAction(id, hostCompleteBooking)}
        />
      )}
    </HostDashboardShell>
  );
}
