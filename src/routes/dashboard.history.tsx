import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { History } from "lucide-react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardPanelSkeleton } from "@/components/ui/DashboardPanelSkeleton";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";
import { GuestBookingsList } from "@/components/guest/GuestBookingsList";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { GuestEmptyState } from "@/components/guest/GuestEmptyState";
import { GuestHomestayBookingsList } from "@/components/guest/GuestHomestayBookingsList";
import type { BookingSummary } from "@/lib/api/bookings";
import { fetchMyBookings } from "@/lib/api/bookings";
import type { HomestayBookingSummary } from "@/lib/api/owner-homestay-bookings";
import { fetchGuestHomestayBookings } from "@/lib/api/guest-homestay-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { loadGuestBookingHistory } from "@/lib/guest-booking-history";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { useGuestAccess } from "@/lib/use-guest-access";

type HistorySearch = {
  booked?: string;
};

async function loadHistory(accessToken: string | null) {
  if (isSupabaseBrowserConfigured()) {
    try {
      return await loadGuestBookingHistory();
    } catch (supabaseError) {
      if (!isApiConfigured() || !accessToken) {
        throw supabaseError;
      }
    }
  }

  if (!isApiConfigured() || !accessToken) {
    throw new Error("Booking history is not configured for this deployment.");
  }

  const [upcoming, past, cancelled, homestayUpcoming, homestayPast, homestayCancelled] =
    await Promise.all([
      fetchMyBookings(accessToken, "upcoming"),
      fetchMyBookings(accessToken, "past"),
      fetchMyBookings(accessToken, "cancelled"),
      fetchGuestHomestayBookings(accessToken, "upcoming"),
      fetchGuestHomestayBookings(accessToken, "past"),
      fetchGuestHomestayBookings(accessToken, "cancelled"),
    ]);

  return {
    activeBookings: upcoming,
    activeHomestayBookings: homestayUpcoming,
    bookings: [...past, ...cancelled].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
    homestayBookings: [...homestayPast, ...homestayCancelled].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  };
}

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
  const [activeHomestayBookings, setActiveHomestayBookings] = useState<HomestayBookingSummary[]>([]);
  const [homestayBookings, setHomestayBookings] = useState<HomestayBookingSummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const [, startTransition] = useTransition();

  const loadBookings = useCallback(async () => {
    const soft = hasLoadedRef.current;
    if (soft) setRefreshing(true);
    else setInitialLoading(true);
    setPageError(null);
    try {
      const result = await loadHistory(accessToken);
      hasLoadedRef.current = true;
      startTransition(() => {
        setActiveBookings(result.activeBookings);
        setActiveHomestayBookings(result.activeHomestayBookings);
        setBookings(result.bookings);
        setHomestayBookings(result.homestayBookings);
      });
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load booking history."));
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadBookings();
  }, [loadBookings, ready]);

  useEffect(() => {
    if (!booked) return;
    setBookingNotice(
      booked === "homestay"
        ? "Your stay request was submitted. Pay in cash at check-in once the host confirms."
        : "Your booking request was submitted. Your host will confirm shortly.",
    );
    setConfirmedBookingId(booked);
    void navigate({ search: (prev) => ({ ...prev, booked: undefined }), replace: true });
  }, [booked, navigate]);

  const handleBookingCancelled = (bookingId: string) => {
    setActiveBookings((rows) => {
      const cancelled = rows.find((row) => row.id === bookingId);
      if (cancelled) {
        setBookings((past) =>
          [{ ...cancelled, bookingStatus: "cancelled" as const }, ...past].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      }
      return rows.filter((row) => row.id !== bookingId);
    });
    void loadBookings();
  };

  const completedCount = useMemo(
    () => bookings.filter((b) => b.bookingStatus === "completed").length,
    [bookings],
  );
  const cancelledCount = useMemo(
    () => bookings.filter((b) => b.bookingStatus === "cancelled").length,
    [bookings],
  );

  const hasAny =
    activeBookings.length > 0 ||
    bookings.length > 0 ||
    activeHomestayBookings.length > 0 ||
    homestayBookings.length > 0;

  if (loading || !ready || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <GuestDashboardShell
      title="History"
      subtitle="Active requests, completed journeys, and cancelled bookings in one place."
      showRoleDescription={false}
    >
      {bookingNotice ? (
        <LuxuryCheckoutPanel className="mb-5 sm:mb-8">
          <p className="luxury-panel-body text-sm">
            {bookingNotice}
            {confirmedBookingId ? (
              <>
                {" "}
                <Link
                  to="/stays/$bookingId"
                  params={{ bookingId: confirmedBookingId }}
                  className="luxury-panel-link font-medium underline-offset-4 hover:underline"
                >
                  View stay details
                </Link>
              </>
            ) : null}
          </p>
        </LuxuryCheckoutPanel>
      ) : null}

      {initialLoading && !hasAny ? (
        <LuxuryCheckoutPanel>
          <DashboardPanelSkeleton rows={4} />
        </LuxuryCheckoutPanel>
      ) : pageError && !hasAny ? (
        <LuxuryCheckoutPanel>
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        </LuxuryCheckoutPanel>
      ) : !hasAny ? (
        <LuxuryCheckoutPanel>
          <GuestEmptyState
            icon={<History className="h-8 w-8" strokeWidth={1.5} />}
            title="No bookings yet"
            description="Your active requests and past journeys will appear here."
            surface="light"
          />
        </LuxuryCheckoutPanel>
      ) : (
        <div
          className={`space-y-4 transition-opacity duration-200 sm:space-y-8 ${refreshing ? "pointer-events-none opacity-55" : "opacity-100"}`}
          aria-busy={refreshing}
        >
          {pageError ? (
            <LuxuryCheckoutPanel>
              <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {pageError}
              </p>
            </LuxuryCheckoutPanel>
          ) : null}
          {refreshing ? (
            <p className="text-sm text-muted-foreground">Updating history…</p>
          ) : null}

          {activeHomestayBookings.length > 0 ? (
            <LuxuryCheckoutPanel>
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b luxury-panel-divider pb-2.5 sm:mb-6 sm:gap-4 sm:pb-5">
                <h2 className="luxury-panel-heading font-display text-base tracking-wide sm:text-xl">
                  Active stays
                </h2>
                <span className="luxury-panel-body text-[0.65rem] uppercase tracking-[0.14em]">
                  {activeHomestayBookings.length} active
                </span>
              </div>
              <GuestHomestayBookingsList bookings={activeHomestayBookings} surface="light" />
            </LuxuryCheckoutPanel>
          ) : null}

          {activeBookings.length > 0 ? (
            <LuxuryCheckoutPanel>
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b luxury-panel-divider pb-2.5 sm:mb-6 sm:gap-4 sm:pb-5">
                <h2 className="luxury-panel-heading font-display text-base tracking-wide sm:text-xl">
                  Active bookings
                </h2>
                <span className="luxury-panel-body text-[0.65rem] uppercase tracking-[0.14em]">
                  {activeBookings.length} active
                </span>
              </div>
              <GuestBookingsList
                bookings={activeBookings}
                accessToken={accessToken}
                allowCancel
                onUpdated={handleBookingCancelled}
                surface="light"
              />
            </LuxuryCheckoutPanel>
          ) : null}

          {homestayBookings.length > 0 ? (
            <LuxuryCheckoutPanel>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3 border-b luxury-panel-divider pb-2.5 sm:mb-6 sm:gap-4 sm:pb-5">
                <h2 className="luxury-panel-heading font-display text-base tracking-wide sm:text-xl">
                  Past & cancelled stays
                </h2>
              </div>
              <GuestHomestayBookingsList bookings={homestayBookings} surface="light" />
            </LuxuryCheckoutPanel>
          ) : null}

          {bookings.length > 0 ? (
            <LuxuryCheckoutPanel>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3 border-b luxury-panel-divider pb-2.5 sm:mb-6 sm:gap-4 sm:pb-5">
                <h2 className="luxury-panel-heading font-display text-base tracking-wide sm:text-xl">
                  Past & cancelled
                </h2>
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
