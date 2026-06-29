import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { OwnerHomestayStatsGrid } from "@/components/homestay-owner/OwnerHomestayStatsGrid";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { OwnerHomestayBookingTable } from "@/components/homestay-owner/OwnerHomestayBookingTable";
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

  const runAction = async (
    bookingId: string,
    action: (token: string, id: string) => Promise<HomestayBookingSummary>,
  ) => {
    if (!accessToken) return;
    setBusyId(bookingId);
    setPageWarning(null);
    try {
      await action(accessToken, bookingId);
      await loadPage();
    } catch (err) {
      setPageWarning(toErrorMessage(err, "Action failed."));
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
    >
      {pageLoading ? (
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body py-8 text-sm">Loading overview…</p>
        </LuxuryCheckoutPanel>
      ) : (
        <div className="space-y-8">
          {pageWarning ? (
            <LuxuryCheckoutPanel>
              <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {pageWarning}
              </p>
            </LuxuryCheckoutPanel>
          ) : null}

          <LuxuryCheckoutPanel>
            <OwnerHomestayStatsGrid stats={stats} />
          </LuxuryCheckoutPanel>

          {stats.publishedHomestays === 0 ? (
            <LuxuryCheckoutPanel>
              <p className="luxury-panel-body text-sm">Add your first property to start accepting stay requests.</p>
              <Link
                to="/homestay/properties/new"
                className="luxury-btn-sm luxury-btn-primary mt-4 inline-flex no-underline"
              >
                Add property
              </Link>
            </LuxuryCheckoutPanel>
          ) : null}

          <LuxuryCheckoutPanel>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="luxury-panel-heading font-display text-2xl">Today&apos;s check-ins</h2>
                <p className="luxury-panel-body mt-1 text-sm">Confirmed and pending arrivals today.</p>
              </div>
              <Link
                to="/homestay/bookings"
                search={{ status: "today" }}
                className="luxury-btn-sm luxury-btn-panel-outline inline-flex no-underline"
              >
                View all bookings
              </Link>
            </div>
            <div className="mt-6">
              {todayBookings.length === 0 ? (
                <p className="luxury-panel-body text-sm">No check-ins scheduled for today.</p>
              ) : (
                <OwnerHomestayBookingTable
                  bookings={todayBookings}
                  busyId={null}
                  onConfirm={() => undefined}
                  onReject={() => undefined}
                  onMarkPaid={() => undefined}
                  onComplete={() => undefined}
                />
              )}
            </div>
          </LuxuryCheckoutPanel>

          <LuxuryCheckoutPanel>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="luxury-panel-heading font-display text-2xl">Pending confirmations</h2>
                <p className="luxury-panel-body mt-1 text-sm">Guest stay requests waiting for your response.</p>
              </div>
              <Link
                to="/homestay/bookings"
                search={{ status: "pending" }}
                className="luxury-btn-sm luxury-btn-panel-outline inline-flex no-underline"
              >
                Manage bookings
              </Link>
            </div>
            <div className="mt-6">
              {pendingBookings.length === 0 ? (
                <p className="luxury-panel-body text-sm">No pending requests right now.</p>
              ) : (
                <OwnerHomestayBookingTable
                  bookings={pendingBookings.slice(0, 5)}
                  busyId={busyId}
                  onConfirm={(id) => void runAction(id, confirmOwnerHomestayBooking)}
                  onReject={(id) => void runAction(id, rejectOwnerHomestayBooking)}
                  onMarkPaid={() => undefined}
                  onComplete={() => undefined}
                />
              )}
            </div>
          </LuxuryCheckoutPanel>
        </div>
      )}
    </HomestayOwnerDashboardShell>
  );
}
