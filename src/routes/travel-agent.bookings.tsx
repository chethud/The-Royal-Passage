import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { TravelAgentBookingsTable } from "@/components/travel-agent/TravelAgentBookingsTable";
import { TravelAgentDashboardShell } from "@/components/travel-agent/TravelAgentDashboardShell";
import {
  fetchTravelAgentBookings,
  type TravelAgentBookingSummary,
} from "@/lib/api/travel-agent-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { parseBookingListSearch } from "@/lib/dashboard-booking-filters";
import { useTravelAgentAccess } from "@/lib/use-travel-agent-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/travel-agent/bookings")({
  validateSearch: parseBookingListSearch,
  head: () => ({
    meta: [{ title: "My bookings — Travel agent — The Royal Passage" }],
  }),
  component: TravelAgentBookingsPage,
});

function TravelAgentBookingsPage() {
  const { status } = Route.useSearch();
  const { accessToken, ready, loading } = useTravelAgentAccess();
  const [bookings, setBookings] = useState<TravelAgentBookingSummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      setBookings(await fetchTravelAgentBookings(accessToken));
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

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <TravelAgentDashboardShell
      title="My bookings"
      subtitle="Experience and homestay reservations you placed for clients."
      showRoleDescription={false}
      variant="bookings"
    >
      <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
        <Link to="/travel-agent/catalog" className="host-overview-action__cta inline-flex no-underline">
          Book for client →
        </Link>
        <button type="button" className="host-bookings-export" onClick={() => void loadPage()}>
          Refresh
        </button>
      </div>

      {pageLoading ? (
        <div className="host-overview-panel host-overview-loading">
          <p className="host-overview-loading__text">Loading bookings…</p>
        </div>
      ) : (
        <>
          {pageError ? (
            <div className="host-overview-panel host-overview-warning mb-4">
              <p>{pageError}</p>
            </div>
          ) : null}
          <TravelAgentBookingsTable bookings={bookings} initialStatus={status ?? "all"} />
        </>
      )}
    </TravelAgentDashboardShell>
  );
}
