import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
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
      showRoleDescription={false}
    >
      {bookingNotice ? (
        <LuxuryCheckoutPanel className="mb-8">
          <p className="luxury-panel-body text-sm">
            {bookingNotice}
            {confirmedBookingId ? (
              <>
                {" "}
                <Link
                  to="/bookings/$bookingId"
                  params={{ bookingId: confirmedBookingId }}
                  className="luxury-panel-link font-medium underline-offset-4 hover:underline"
                >
                  View booking details
                </Link>
              </>
            ) : null}
          </p>
        </LuxuryCheckoutPanel>
      ) : null}

      {pageLoading ? (
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body py-8 text-sm">Loading history…</p>
        </LuxuryCheckoutPanel>
      ) : pageError ? (
        <LuxuryCheckoutPanel>
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        </LuxuryCheckoutPanel>
      ) : activeBookings.length === 0 && bookings.length === 0 ? (
        <LuxuryCheckoutPanel>
          <GuestEmptyState
            icon={<History className="h-8 w-8" strokeWidth={1.5} />}
            title="No bookings yet"
            description="Your active requests and past journeys will appear here."
            surface="light"
          />
        </LuxuryCheckoutPanel>
      ) : (
        <div className="space-y-8">
          {activeBookings.length > 0 ? (
            <LuxuryCheckoutPanel>
              <div className="mb-6 flex items-baseline justify-between gap-4 border-b luxury-panel-divider pb-5">
                <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Active bookings</h2>
                <span className="luxury-panel-body text-[0.65rem] uppercase tracking-[0.14em]">
                  {activeBookings.length} active
                </span>
              </div>
              <GuestBookingsList
                bookings={activeBookings}
                accessToken={accessToken}
                allowCancel
                onUpdated={() => void loadBookings()}
                surface="light"
              />
            </LuxuryCheckoutPanel>
          ) : null}

          {bookings.length > 0 ? (
            <LuxuryCheckoutPanel>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 border-b luxury-panel-divider pb-5">
                <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Past & cancelled</h2>
                <span className="luxury-panel-body text-[0.65rem] uppercase tracking-[0.14em]">
                  {completedCount} completed · {cancelledCount} cancelled
                </span>
              </div>
              <GuestBookingsList bookings={bookings} accessToken={accessToken} surface="light" />
            </LuxuryCheckoutPanel>
          ) : null}
        </div>
      )}
    </GuestDashboardShell>
  );
}
