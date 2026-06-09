import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { GuestBookingsList } from "@/components/guest/GuestBookingsList";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { GuestEmptyState } from "@/components/guest/GuestEmptyState";
import { fetchMyBookings, type BookingSummary } from "@/lib/api/bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useGuestAccess } from "@/lib/use-guest-access";

type DashboardSearch = {
  booked?: string;
};

export const Route = createFileRoute("/dashboard/")({
  validateSearch: (s: Record<string, unknown>): DashboardSearch => ({
    booked: typeof s.booked === "string" ? s.booked : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Upcoming bookings — The Royal Passage" },
      { name: "description", content: "View your upcoming experiences in Mysuru." },
    ],
  }),
  component: GuestUpcomingPage,
});

function GuestUpcomingPage() {
  const { booked } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { accessToken, ready, loading } = useGuestAccess();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const rows = await fetchMyBookings(accessToken, "upcoming");
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

  useEffect(() => {
    if (!booked) return;
    setBookingNotice("Your booking request was submitted. Your host will confirm shortly.");
    setConfirmedBookingId(booked);
    void navigate({ search: (prev) => ({ ...prev, booked: undefined }), replace: true });
  }, [booked, navigate]);

  if (loading || !ready || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <GuestDashboardShell
      title="Upcoming"
      subtitle="Confirmed and pending journeys ahead. Pay at the venue when you arrive."
    >
      <div className="space-y-6">
        {bookingNotice ? (
          <p className="rounded-sm border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-foreground">
            {bookingNotice}
            {confirmedBookingId ? (
              <>
                {" "}
                <Link
                  to="/bookings/$bookingId"
                  params={{ bookingId: confirmedBookingId }}
                  className="text-ember underline-offset-4 hover:underline"
                >
                  View booking details
                </Link>
              </>
            ) : null}
          </p>
        ) : null}

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
