import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { GuestBookingsList } from "@/components/guest/GuestBookingsList";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { GuestEmptyState } from "@/components/guest/GuestEmptyState";
import { listMyBookings, type BookingSummary } from "@/lib/booking-fns";
import { useGuestAccess } from "@/lib/use-guest-access";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Upcoming bookings — The Royal Passage" },
      { name: "description", content: "View your upcoming experiences in Mysuru." },
    ],
  }),
  component: GuestUpcomingPage,
});

function GuestUpcomingPage() {
  const { accessToken, ready, loading } = useGuestAccess();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const rows = await listMyBookings({ data: { accessToken, status: "upcoming" } });
      setBookings(rows);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to load bookings.");
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
      title="Upcoming"
      subtitle="Confirmed and pending journeys ahead. Pay at the venue when you arrive."
    >
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Your host will confirm each request before the session.
          </p>
          <Link
            to="/experiences"
            className="hidden sm:inline-flex rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:border-ember/50"
          >
            Browse
          </Link>
        </div>

        {pageLoading ? (
          <p className="text-sm text-muted-foreground">Loading bookings…</p>
        ) : pageError ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        ) : bookings.length === 0 ? (
          <GuestEmptyState
            icon={<Compass className="h-8 w-8" />}
            title="No upcoming journeys"
            description="Explore pottery workshops, farm walks, and palace stories across Mysuru."
          />
        ) : (
          <GuestBookingsList
            bookings={bookings}
            accessToken={accessToken}
            allowCancel
            onUpdated={() => void loadBookings()}
          />
        )}
      </div>
    </GuestDashboardShell>
  );
}
