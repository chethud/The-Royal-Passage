import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { CreateExperienceCta } from "@/components/host/CreateExperienceCta";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { HostStatsGrid } from "@/components/host/HostStatsGrid";
import { HostTodayBookings } from "@/components/host/HostTodayBookings";
import type { BookingSummary } from "@/lib/api/bookings";
import {
  fetchHostBookings,
  fetchHostDashboard,
  type HostDashboardStats,
} from "@/lib/api/host";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHostAccess } from "@/lib/use-host-access";

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
  const [stats, setStats] = useState<HostDashboardStats | null>(null);
  const [todayBookings, setTodayBookings] = useState<BookingSummary[]>([]);
  const [pendingBookings, setPendingBookings] = useState<BookingSummary[]>([]);
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
      const [dashboard, today, pending] = await Promise.all([
        fetchHostDashboard(accessToken),
        fetchHostBookings(accessToken, "today"),
        fetchHostBookings(accessToken, "pending"),
      ]);
      setStats(dashboard);
      setTodayBookings(today);
      setPendingBookings(pending);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load host dashboard."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  if (loading || !ready) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <HostDashboardShell
      title="Overview"
      subtitle="Today's sessions, pending confirmations, and your week ahead."
      showRoleDescription={false}
    >
      {pageLoading ? (
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body py-8 text-sm">Loading overview…</p>
        </LuxuryCheckoutPanel>
      ) : pageError ? (
        <LuxuryCheckoutPanel>
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        </LuxuryCheckoutPanel>
      ) : (
        <div className="space-y-8">
          {stats ? (
            <LuxuryCheckoutPanel>
              <HostStatsGrid stats={stats} />
            </LuxuryCheckoutPanel>
          ) : null}

          {stats && stats.publishedExperiences === 0 ? <CreateExperienceCta /> : null}

          <LuxuryCheckoutPanel>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="luxury-panel-heading font-display text-2xl">Today&apos;s sessions</h2>
                <p className="luxury-panel-body mt-1 text-sm">
                  Confirmed and pending bookings happening today.
                </p>
              </div>
              <Link
                to="/host/bookings"
                search={{ status: "today" }}
                className="luxury-btn-sm luxury-btn-panel-outline inline-flex items-center no-underline"
              >
                View all bookings
              </Link>
            </div>
            <div className="mt-6">
              <HostTodayBookings bookings={todayBookings} />
            </div>
          </LuxuryCheckoutPanel>

          <LuxuryCheckoutPanel>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="luxury-panel-heading font-display text-2xl">Pending confirmations</h2>
                <p className="luxury-panel-body mt-1 text-sm">
                  Guest requests waiting for your response.
                </p>
              </div>
              <Link
                to="/host/bookings"
                search={{ status: "pending" }}
                className="luxury-btn-sm luxury-btn-panel-outline inline-flex items-center no-underline"
              >
                Manage bookings
              </Link>
            </div>
            <div className="mt-6">
              {pendingBookings.length === 0 ? (
                <p className="luxury-panel-body text-sm">No pending requests right now.</p>
              ) : (
                <HostTodayBookings bookings={pendingBookings.slice(0, 5)} />
              )}
            </div>
          </LuxuryCheckoutPanel>
        </div>
      )}
    </HostDashboardShell>
  );
}
