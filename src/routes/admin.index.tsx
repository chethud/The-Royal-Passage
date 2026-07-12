import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { fetchAdminStats, type AdminStats } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { resolveAccessToken } from "@/lib/auth-session";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — The Royal Passage" },
      { name: "description", content: "Platform analytics and quick links." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminOverviewPage,
});

const EMPTY_STATS: AdminStats = {
  totalGuests: 0,
  totalHosts: 0,
  publishedExperiences: 0,
  totalBookings: 0,
  revenueCollectedMinor: 0,
  pendingExperienceReviews: 0,
  currencySymbol: "₹",
  confirmedBookings: 0,
  pendingBookings: 0,
  completedBookings: 0,
  cancelledBookings: 0,
  grossBookingValueMinor: 0,
  platformRevenueMinor: 0,
  hostPayoutDueMinor: 0,
  codPendingCollectionMinor: 0,
  commissionPercent: 10,
};

function AdminOverviewPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }
    if (role && role !== "admin") {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      // Force-refresh so we never send a JWT whose Supabase session row was revoked.
      const token = await resolveAccessToken({ forceRefresh: true });
      const statsRow = await fetchAdminStats(token);
      setStats(statsRow);
      setSessionReady(true);
    } catch (err) {
      setAnalyticsError(toErrorMessage(err, "Failed to load analytics."));
      setStats(EMPTY_STATS);
      setSessionReady(true);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || loading || role !== "admin") return;
    void loadAnalytics();
  }, [user, loading, role, loadAnalytics]);

  if (loading || !user || role !== "admin" || !sessionReady) {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Platform control"
      subtitle="Experience bookings, host approvals, and platform analytics."
      showRoleDescription={false}
    >
      <div className="space-y-8">
        <LuxuryCheckoutPanel>
          {analyticsLoading ? (
            <p className="luxury-panel-body py-8 text-sm">Loading platform analytics…</p>
          ) : (
            <>
              {analyticsError ? (
                <div className="mb-5 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <p>{analyticsError}</p>
                  <button
                    type="button"
                    className="luxury-btn-sm luxury-btn-panel-outline mt-3"
                    onClick={() => void loadAnalytics()}
                  >
                    Retry
                  </button>
                </div>
              ) : null}
              {stats ? <AdminStatsGrid stats={stats} /> : null}
            </>
          )}
        </LuxuryCheckoutPanel>

        {stats ? (
          <LuxuryCheckoutPanel>
            <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Quick links</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickLink
                to="/admin/experiences"
                label="Review experiences"
                detail={
                  stats.pendingExperienceReviews
                    ? `${stats.pendingExperienceReviews} awaiting approval`
                    : "No pending submissions"
                }
              />
              <QuickLink to="/admin/bookings" label="All bookings" detail="Guest reservations & payouts" />
              <QuickLink to="/admin/profile/users" label="Users" detail="Create logins & assign access roles" />
              <QuickLink to="/admin/activity" label="Activity log" detail="Recent platform events" />
            </div>
          </LuxuryCheckoutPanel>
        ) : null}
      </div>
    </DashboardShell>
  );
}

function QuickLink({ to, label, detail }: { to: string; label: string; detail: string }) {
  return (
    <Link
      to={to}
      className="block rounded-md border border-[rgb(74_0_0/0.14)] bg-[rgb(255_255_255/0.35)] p-4 transition-colors hover:border-[rgb(74_0_0/0.28)]"
    >
      <div className="luxury-panel-heading font-display text-lg">{label}</div>
      <p className="luxury-panel-body mt-1 text-xs">{detail}</p>
    </Link>
  );
}
