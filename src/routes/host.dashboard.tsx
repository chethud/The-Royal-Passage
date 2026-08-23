import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CreateExperienceCta } from "@/components/host/CreateExperienceCta";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { HostOverviewActionPanel } from "@/components/host/HostOverviewActionPanel";
import { HostStatsGrid } from "@/components/host/HostStatsGrid";
import { HostTodayBookings } from "@/components/host/HostTodayBookings";
import type { BookingSummary } from "@/lib/api/bookings";
import {
  fetchHostBookings,
  fetchHostDashboard,
  EMPTY_HOST_DASHBOARD_STATS,
  type HostDashboardStats,
} from "@/lib/api/host";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHostAccess } from "@/lib/use-host-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/host/dashboard")({
  head: () => ({
    meta: [
      { title: "Host overview — The Royal Passage" },
      {
        name: "description",
        content: "Today's sessions, pending confirmations, and revenue at a glance.",
      },
    ],
  }),
  component: HostOverviewPage,
});

function HostOverviewPage() {
  const { accessToken, ready, loading } = useHostAccess();
  const [stats, setStats] = useState<HostDashboardStats>(EMPTY_HOST_DASHBOARD_STATS);
  const [todayBookings, setTodayBookings] = useState<BookingSummary[]>([]);
  const [pendingBookings, setPendingBookings] = useState<BookingSummary[]>([]);
  const [pageWarning, setPageWarning] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

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
      setStats(await fetchHostDashboard(accessToken));
    } catch (err) {
      warnings.push(toErrorMessage(err, "Failed to load dashboard stats."));
      setStats(EMPTY_HOST_DASHBOARD_STATS);
    }

    try {
      setTodayBookings(await fetchHostBookings(accessToken, "today"));
    } catch (err) {
      warnings.push(toErrorMessage(err, "Failed to load today's sessions."));
      setTodayBookings([]);
    }

    try {
      setPendingBookings(await fetchHostBookings(accessToken, "pending"));
    } catch (err) {
      warnings.push(toErrorMessage(err, "Failed to load pending bookings."));
      setPendingBookings([]);
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
    <HostDashboardShell
      title="Overview"
      subtitle="Today's sessions, pending confirmations, and your week ahead."
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

          <HostStatsGrid stats={stats} />

          {stats.publishedExperiences === 0 ? <CreateExperienceCta /> : null}

          <HostOverviewActionPanel
            title="Today's sessions"
            subtitle="Confirmed and pending bookings happening today."
            emptyMessage="No sessions scheduled for today."
            ctaLabel="View all bookings →"
            ctaTo="/host/bookings"
            ctaSearch={{ status: "today" }}
            icon="calendar"
            isEmpty={todayBookings.length === 0}
          >
            <HostTodayBookings bookings={todayBookings} />
          </HostOverviewActionPanel>

          <HostOverviewActionPanel
            title="Pending confirmations"
            subtitle="Guest requests waiting for your response."
            emptyMessage="No pending requests right now."
            ctaLabel="Manage bookings →"
            ctaTo="/host/bookings"
            ctaSearch={{ status: "pending" }}
            icon="hourglass"
            isEmpty={pendingBookings.length === 0}
          >
            <HostTodayBookings bookings={pendingBookings.slice(0, 5)} />
          </HostOverviewActionPanel>
        </div>
      )}
    </HostDashboardShell>
  );
}
