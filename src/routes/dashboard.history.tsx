import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import { GuestBookingsList } from "@/components/guest/GuestBookingsList";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { GuestEmptyState } from "@/components/guest/GuestEmptyState";
import { fetchMyBookings, type BookingSummary } from "@/lib/api/bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useGuestAccess } from "@/lib/use-guest-access";

type HistorySearch = {
  booked?: string;
};

export const Route = createFileRoute("/dashboard/history")({
  validateSearch: (s: Record<string, unknown>): HistorySearch => ({
    booked: typeof s.booked === "string" ? s.booked : undefined,
  }),
  head: () => ({
    meta: [{ title: "Booking history — The Royal Passage" }],
  }),
  component: GuestHistoryPage,
});

function GuestHistoryPage() {
  const { booked } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { accessToken, ready, loading } = useGuestAccess();
  const [activeBookings, setActiveBookings] = useState<BookingSummary[]>([]);
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
      const [upcoming, past, cancelled] = await Promise.all([
        fetchMyBookings(accessToken, "upcoming"),
        fetchMyBookings(accessToken, "past"),
        fetchMyBookings(accessToken, "cancelled"),
      ]);
      setActiveBookings(upcoming);
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

  useEffect(() => {
    if (!booked) return;
    setBookingNotice("Your booking request was submitted. Your host will confirm shortly.");
    setConfirmedBookingId(booked);
    void navigate({ search: (prev) => ({ ...prev, booked: undefined }), replace: true });
  }, [booked, navigate]);

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
      subtitle="Active requests, completed journeys, and cancelled bookings in one place."
    >
      {bookingNotice ? (
        <p className="mb-6 rounded-sm border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-foreground">
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
      ) : activeBookings.length === 0 && bookings.length === 0 ? (
        <GuestEmptyState
          icon={<History className="h-8 w-8" />}
          title="No bookings yet"
          description="Your active requests and past journeys will appear here."
        />
      ) : (
        <div className="space-y-10">
          {activeBookings.length > 0 ? (
            <section>
              <h2 className="mb-4 font-display text-xl tracking-tight">Active bookings</h2>
              <GuestBookingsList
                bookings={activeBookings}
                accessToken={accessToken}
                allowCancel
                onUpdated={() => void loadBookings()}
              />
            </section>
          ) : null}
          {bookings.length > 0 ? (
            <section>
              <h2 className="mb-4 font-display text-xl tracking-tight">Past & cancelled</h2>
              <GuestBookingsList bookings={bookings} accessToken={accessToken} />
            </section>
          ) : null}
        </div>
      )}
    </GuestDashboardShell>
  );
}
