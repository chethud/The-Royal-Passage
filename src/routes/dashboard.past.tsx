import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";
import { GuestBookingsList } from "@/components/guest/GuestBookingsList";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { GuestEmptyState } from "@/components/guest/GuestEmptyState";
import { fetchMyBookings, type BookingSummary } from "@/lib/api/bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useGuestAccess } from "@/lib/use-guest-access";

export const Route = createFileRoute("/dashboard/past")({
  head: () => ({
    meta: [{ title: "Past bookings — The Royal Passage" }],
  }),
  component: GuestPastPage,
});

function GuestPastPage() {
  const { accessToken, ready, loading } = useGuestAccess();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const rows = await fetchMyBookings(accessToken, "past");
      setBookings(rows);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load bookings."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadBookings();
  }, [loadBookings, ready]);

  if (loading || !ready || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <GuestDashboardShell
      title="Past journeys"
      subtitle="Completed experiences you have already enjoyed in Mysuru."
    >
      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading bookings…</p>
      ) : pageError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : bookings.length === 0 ? (
        <GuestEmptyState
          icon={<History className="h-8 w-8" />}
          title="No past journeys yet"
          description="Once you complete an experience, it will appear here."
        />
      ) : (
        <GuestBookingsList bookings={bookings} accessToken={accessToken} />
      )}
    </GuestDashboardShell>
  );
}
