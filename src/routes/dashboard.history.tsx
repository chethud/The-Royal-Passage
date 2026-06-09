import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import { GuestBookingsList } from "@/components/guest/GuestBookingsList";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { GuestEmptyState } from "@/components/guest/GuestEmptyState";
import { fetchMyBookings, type BookingSummary } from "@/lib/api/bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useGuestAccess } from "@/lib/use-guest-access";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({
    meta: [{ title: "Booking history — The Royal Passage" }],
  }),
  component: GuestHistoryPage,
});

function GuestHistoryPage() {
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
      const [past, cancelled] = await Promise.all([
        fetchMyBookings(accessToken, "past"),
        fetchMyBookings(accessToken, "cancelled"),
      ]);
      const merged = [...past, ...cancelled].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setBookings(merged);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load booking history."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadBookings();
  }, [loadBookings, ready]);

  const completedCount = useMemo(
    () => bookings.filter((b) => b.bookingStatus === "completed").length,
    [bookings],
  );
  const cancelledCount = useMemo(
    () => bookings.filter((b) => b.bookingStatus === "cancelled").length,
    [bookings],
  );

  if (loading || !ready || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <GuestDashboardShell
      title="History"
      subtitle="Your completed journeys and cancelled bookings in one place."
    >
      {!pageLoading && bookings.length > 0 ? (
        <p className="mb-6 text-sm text-muted-foreground">
          {completedCount} completed · {cancelledCount} cancelled
        </p>
      ) : null}

      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading history…</p>
      ) : pageError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : bookings.length === 0 ? (
        <GuestEmptyState
          icon={<History className="h-8 w-8" />}
          title="No booking history yet"
          description="Completed and cancelled journeys will appear here."
        />
      ) : (
        <GuestBookingsList bookings={bookings} accessToken={accessToken} />
      )}
    </GuestDashboardShell>
  );
}
