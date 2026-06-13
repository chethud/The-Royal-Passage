import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
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
    >
      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading overview…</p>
      ) : pageError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : (
        <div className="space-y-10">
          {stats ? <HostStatsGrid stats={stats} /> : null}

          {stats && stats.publishedExperiences === 0 ? (
            <CreateExperienceCta />
          ) : null}

          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">Today&apos;s sessions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confirmed and pending bookings happening today.
                </p>
              </div>
              <Link
                to="/host/bookings"
                search={{ status: "today" }}
                className="text-sm text-ember hover:underline"
              >
                View all bookings
              </Link>
            </div>
            <div className="mt-6">
              <HostTodayBookings bookings={todayBookings} />
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">Pending confirmations</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Guest requests waiting for your response.
                </p>
              </div>
              <Link
                to="/host/bookings"
                search={{ status: "pending" }}
                className="text-sm text-ember hover:underline"
              >
                Manage bookings
              </Link>
            </div>
            <div className="mt-6">
              {pendingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending requests right now.</p>
              ) : (
                <HostTodayBookings bookings={pendingBookings.slice(0, 5)} />
              )}
            </div>
          </section>
        </div>
      )}
    </HostDashboardShell>
  );
}
