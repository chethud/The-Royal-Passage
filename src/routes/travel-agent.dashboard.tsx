import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { TravelAgentBookingsTable } from "@/components/travel-agent/TravelAgentBookingsTable";
import { TravelAgentDashboardShell } from "@/components/travel-agent/TravelAgentDashboardShell";
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
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [recentBookings, setRecentBookings] = useState<TravelAgentBookingSummary[]>([]);
  const [pageWarning, setPageWarning] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!accessToken) return;
    setPageWarning(null);
    try {
      const profile = await fetchTravelAgentProfile({ data: { accessToken } });
      setCompanyName(profile.companyName);
      setDiscountPercent(profile.discountPercent);
    } catch (err) {
      setPageWarning(toErrorMessage(err, "Failed to load agent profile."));
    }
  }, [accessToken]);

  const loadBookings = useCallback(async () => {
    if (!accessToken || !isApiConfigured()) return;
    try {
      const rows = await fetchTravelAgentBookings(accessToken);
      setRecentBookings(rows.slice(0, 5));
    } catch {
      setRecentBookings([]);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadProfile();
    void loadBookings();
  }, [loadBookings, loadProfile, ready]);

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <TravelAgentDashboardShell
      title="Overview"
      subtitle="Book experiences and homestays for your clients with your negotiated discount."
      showRoleDescription={false}
      variant="overview"
    >
      <div className="host-overview-stack">
        {pageWarning ? (
          <div className="host-overview-panel host-overview-warning">
            <p>{pageWarning}</p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <LuxuryCheckoutPanel>
            <p className="eyebrow luxury-panel-label">Agency</p>
            <p className="font-display text-2xl luxury-panel-heading">{companyName ?? "—"}</p>
            {discountPercent != null ? (
              <p className="mt-2 text-sm luxury-panel-body">Your discount: {discountPercent}%</p>
            ) : null}
          </LuxuryCheckoutPanel>
          <LuxuryCheckoutPanel>
            <p className="eyebrow luxury-panel-label">Quick actions</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/travel-agent/catalog" className="luxury-btn-sm inline-flex no-underline">
                Book for a client →
              </Link>
              <Link to="/travel-agent/bookings" className="luxury-btn-sm dashboard-chrome-btn inline-flex no-underline">
                View my bookings →
              </Link>
            </div>
          </LuxuryCheckoutPanel>
        </div>

        <LuxuryCheckoutPanel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl luxury-panel-heading">Recent client bookings</h2>
            <Link
              to="/travel-agent/bookings"
              className="luxury-btn-sm dashboard-chrome-btn inline-flex no-underline"
            >
              View all →
            </Link>
          </div>
          <TravelAgentBookingsTable bookings={recentBookings} initialStatus="all" />
        </LuxuryCheckoutPanel>
      </div>
    </TravelAgentDashboardShell>
  );
}
