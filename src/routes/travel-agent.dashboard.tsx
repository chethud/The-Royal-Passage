import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HostOverviewActionPanel } from "@/components/host/HostOverviewActionPanel";
import { TravelAgentBookingsTable } from "@/components/travel-agent/TravelAgentBookingsTable";
import { TravelAgentDashboardShell } from "@/components/travel-agent/TravelAgentDashboardShell";
import { TravelAgentRecentBookings } from "@/components/travel-agent/TravelAgentRecentBookings";
import { TravelAgentStatsGrid } from "@/components/travel-agent/TravelAgentStatsGrid";
import { fetchTravelAgentProfile } from "@/lib/partner-travel-agent-fns";
import {
  fetchTravelAgentBookings,
  type TravelAgentBookingSummary,
} from "@/lib/api/travel-agent-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useTravelAgentAccess } from "@/lib/use-travel-agent-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/travel-agent/dashboard")({
  head: () => ({
    meta: [{ title: "Travel agent overview — The Royal Passage" }],
  }),
  component: TravelAgentOverviewPage,
});

function TravelAgentOverviewPage() {
  const { accessToken, ready, loading } = useTravelAgentAccess();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [bookings, setBookings] = useState<TravelAgentBookingSummary[]>([]);
  const [pageWarning, setPageWarning] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageWarning(null);

    try {
      const profile = await fetchTravelAgentProfile({ data: { accessToken } });
      setCompanyName(profile.companyName);
    } catch (err) {
      setPageWarning(toErrorMessage(err, "Failed to load agent profile."));
    }

    if (isApiConfigured()) {
      try {
        setBookings(await fetchTravelAgentBookings(accessToken));
      } catch {
        setBookings([]);
      }
    }

    setPageLoading(false);
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  const recentBookings = bookings.slice(0, 5);

  return (
    <TravelAgentDashboardShell
      title="Overview"
      subtitle="Book experiences and homestays for your clients."
      heroDetail={companyName}
      showRoleDescription={false}
      variant="overview"
    >
      {pageLoading ? (
        <div className="host-overview-panel host-overview-loading">
          <p className="host-overview-loading__text">Loading overview…</p>
        </div>
      ) : (
        <div className="host-overview-stack">
          {pageWarning ? (
            <div className="host-overview-panel host-overview-warning">
              <p>{pageWarning}</p>
            </div>
          ) : null}

          <TravelAgentStatsGrid bookings={bookings} />

          <HostOverviewActionPanel
            title="Book for a client"
            subtitle="Browse experiences and homestays, add customer details, and confirm on their behalf."
            emptyMessage=""
            ctaLabel="Open catalog →"
            ctaTo="/travel-agent/catalog"
            icon="compass"
            isEmpty={false}
          >
            <p className="host-overview-action__subtitle !mt-0">
              Choose from the full Royal Passage catalog with optional markup and client email options.
            </p>
          </HostOverviewActionPanel>

          <HostOverviewActionPanel
            title="Recent client bookings"
            subtitle="Your latest experience and homestay reservations."
            emptyMessage="No client bookings yet."
            ctaLabel="View all bookings →"
            ctaTo="/travel-agent/bookings"
            ctaSearch={{ status: "all" }}
            icon="calendar"
            isEmpty={recentBookings.length === 0}
          >
            <TravelAgentRecentBookings bookings={recentBookings} />
          </HostOverviewActionPanel>
        </div>
      )}
    </TravelAgentDashboardShell>
  );
}
