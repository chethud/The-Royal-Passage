import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HostOverviewActionPanel } from "@/components/host/HostOverviewActionPanel";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { OwnerHomestayBookingTable } from "@/components/homestay-owner/OwnerHomestayBookingTable";
import { OwnerHomestayStatsGrid } from "@/components/homestay-owner/OwnerHomestayStatsGrid";
import {
  confirmOwnerHomestayBooking,
  EMPTY_OWNER_DASHBOARD_STATS,
  fetchOwnerDashboard,
  fetchOwnerHomestayBookings,
  rejectOwnerHomestayBooking,
  type OwnerDashboardStats,
  type HomestayBookingSummary,
} from "@/lib/api/owner-homestay-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHomestayOwnerAccess } from "@/lib/use-homestay-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/homestay/dashboard")({
  head: () => ({
    meta: [{ title: "Homestay owner overview — The Royal Passage" }],
  }),
  component: HomestayOwnerOverviewPage,
});

function HomestayOwnerOverviewPage() {
  const { accessToken, ready, loading } = useHomestayOwnerAccess();
  const [stats, setStats] = useState<OwnerDashboardStats>(EMPTY_OWNER_DASHBOARD_STATS);
  const [pendingBookings, setPendingBookings] = useState<HomestayBookingSummary[]>([]);
  const [todayBookings, setTodayBookings] = useState<HomestayBookingSummary[]>([]);
  const [pageWarning, setPageWarning] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const runDecision = async (
    bookingId: string,
    decision: import("@/components/booking/BookingDecisionDialog").BookingDecisionPayload,
    action: typeof confirmOwnerHomestayBooking,
  ) => {
    if (!accessToken) return;
    setBusyId(bookingId);
    setPageWarning(null);
    try {
      const updated = await action(accessToken, bookingId, decision);
      setPendingBookings((rows) =>
        rows
          .map((row) => (row.id === bookingId ? updated : row))
          .filter((row) => row.bookingStatus === "pending"),
      );
      setTodayBookings((rows) => rows.map((row) => (row.id === bookingId ? updated : row)));
    } catch (err) {
      setPageWarning(toErrorMessage(err, "Action failed."));
      throw err;
    } finally {
      setBusyId(null);
    }
  };

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageWarning(null);
    if (!isApiConfigured()) {
      setPageWarning("VITE_API_BASE_URL is not configured for this deployment.");
      setPageLoading(false);
      return;
    }

    const warnings: string[] = [];

    try {
      setStats(await fetchOwnerDashboard(accessToken));
    } catch (err) {
      warnings.push(toErrorMessage(err, "Failed to load dashboard stats."));
      setStats(EMPTY_OWNER_DASHBOARD_STATS);
    }

    try {
      setPendingBookings(await fetchOwnerHomestayBookings(accessToken, "pending"));
    } catch (err) {
      warnings.push(toErrorMessage(err, "Failed to load pending bookings."));
      setPendingBookings([]);
    }

    try {
      setTodayBookings(await fetchOwnerHomestayBookings(accessToken, "today"));
    } catch (err) {
      warnings.push(toErrorMessage(err, "Failed to load today's check-ins."));
      setTodayBookings([]);
    }

    setPageWarning(warnings[0] ?? null);
    setPageLoading(false);
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <HomestayOwnerDashboardShell
      title="Overview"
      subtitle="Pending stay requests, today's check-ins, and your published properties."
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

          <OwnerHomestayStatsGrid stats={stats} />

          {stats.publishedHomestays === 0 ? (
            <div className="host-overview-panel host-overview-action">
              <div className="host-overview-action__layout">
                <div className="host-overview-action__copy">
                  <h2 className="host-overview-action__title">Add your first property</h2>
                  <p className="host-overview-action__subtitle">
                    Publish a homestay listing to start accepting stay requests.
                  </p>
                </div>
                <div className="host-overview-action__cta-wrap">
                  <Link to="/homestay/properties/new" className="host-overview-action__cta">
                    Add property →
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          <HostOverviewActionPanel
            title="Today's check-ins"
            subtitle="Confirmed and pending arrivals happening today."
            emptyMessage="No check-ins scheduled for today."
            ctaLabel="View all bookings →"
            ctaTo="/homestay/bookings"
            ctaSearch={{ status: "today" }}
            icon="calendar"
            isEmpty={todayBookings.length === 0}
          >
            <OwnerHomestayBookingTable
              bookings={todayBookings}
              busyId={null}
              onConfirm={async () => undefined}
              onReject={async () => undefined}
              onMarkPaid={() => undefined}
              onComplete={() => undefined}
            />
          </HostOverviewActionPanel>

          <HostOverviewActionPanel
            title="Pending confirmations"
            subtitle="Guest stay requests waiting for your response."
            emptyMessage="No pending requests right now."
            ctaLabel="Manage bookings →"
            ctaTo="/homestay/bookings"
            ctaSearch={{ status: "pending" }}
            icon="hourglass"
            isEmpty={pendingBookings.length === 0}
          >
            <OwnerHomestayBookingTable
              bookings={pendingBookings.slice(0, 5)}
              busyId={busyId}
              onConfirm={(id, decision) => runDecision(id, decision, confirmOwnerHomestayBooking)}
              onReject={(id, decision) => runDecision(id, decision, rejectOwnerHomestayBooking)}
              onMarkPaid={() => undefined}
              onComplete={() => undefined}
            />
          </HostOverviewActionPanel>
        </div>
      )}
    </HomestayOwnerDashboardShell>
  );
}
