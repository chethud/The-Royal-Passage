import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { OwnerHomestayStatsGrid } from "@/components/homestay-owner/OwnerHomestayStatsGrid";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { OwnerHomestayBookingTable } from "@/components/homestay-owner/OwnerHomestayBookingTable";
import {
  confirmOwnerHomestayBooking,
  fetchOwnerDashboard,
  fetchOwnerHomestayBookings,
  rejectOwnerHomestayBooking,
  type OwnerDashboardStats,
  type HomestayBookingSummary,
} from "@/lib/api/owner-homestay-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHomestayOwnerAccess } from "@/lib/use-homestay-owner-access";

export const Route = createFileRoute("/homestay/dashboard")({
  head: () => ({
    meta: [{ title: "Homestay owner overview — The Royal Passage" }],
  }),
  component: HomestayOwnerOverviewPage,
});

function HomestayOwnerOverviewPage() {
  const { accessToken, ready, loading } = useHomestayOwnerAccess();
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [pendingBookings, setPendingBookings] = useState<HomestayBookingSummary[]>([]);
  const [todayBookings, setTodayBookings] = useState<HomestayBookingSummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [busyId, setBusyId] = useState<string | null>(null);

  const runAction = async (
    bookingId: string,
    action: (token: string, id: string) => Promise<HomestayBookingSummary>,
  ) => {
    if (!accessToken) return;
    setBusyId(bookingId);
    setPageError(null);
    try {
      await action(accessToken, bookingId);
      await loadPage();
    } catch (err) {
      setPageError(toErrorMessage(err, "Action failed."));
    } finally {
      setBusyId(null);
    }
  };

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const [dashboard, pending, today] = await Promise.all([
        fetchOwnerDashboard(accessToken),
        fetchOwnerHomestayBookings(accessToken, "pending"),
        fetchOwnerHomestayBookings(accessToken, "today"),
      ]);
      setStats(dashboard);
      setPendingBookings(pending);
      setTodayBookings(today);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load owner dashboard."));
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
    <HomestayOwnerDashboardShell
      title="Overview"
      subtitle="Pending stay requests, today's check-ins, and your published properties."
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
              <OwnerHomestayStatsGrid stats={stats} />
            </LuxuryCheckoutPanel>
          ) : null}

          {stats && stats.publishedHomestays === 0 ? (
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
