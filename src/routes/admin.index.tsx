import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminReviewsHub } from "@/components/admin/AdminReviewsHub";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { fetchAdminStats, type AdminStats } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { resolveAccessToken } from "@/lib/auth-session";
import { dashboardPathForRole, hasRole } from "@/lib/roles";
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
  conversionRatePercent: 0,
  cancelRatePercent: 0,
  bookingsLast30Days: 0,
  bookingsPrev30Days: 0,
  bookingGrowthPercent: 0,
  gmvLast30DaysMinor: 0,
  gmvPrev30DaysMinor: 0,
  gmvGrowthPercent: 0,
};

function AdminOverviewPage() {
  const navigate = useNavigate();
  const { user, role, roles, loading, accessToken: authToken } = useAuthUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const isAdmin = hasRole(roles, "admin", role);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }
    if (role && !isAdmin) {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [isAdmin, loading, navigate, role, user]);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const token = authToken || (await resolveAccessToken());
      const statsRow = await fetchAdminStats(token);
      setStats(statsRow);
    } catch (err) {
      setAnalyticsError(toErrorMessage(err, "Failed to load analytics."));
      setStats(EMPTY_STATS);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (!user || loading || !isAdmin) return;
    void loadAnalytics();
  }, [user, loading, isAdmin, loadAnalytics]);

  if (loading || !user || !isAdmin) {
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

        <AdminReviewsHub scope="experience" />

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
              <QuickLink to="/admin/activity" label="Activity logs" detail="Bookings, reviews, approvals" />
              <QuickLink to="/admin/trust" label="Fraud center" detail="Duplicates, spam, suspicious bookings" />
              <QuickLink to="/admin/homepage-edit" label="Homepage CMS" detail="Edit hero, showcase, journeys" />
              <QuickLink to="/admin/profile/users" label="Users" detail="Create logins & assign access roles" />
              <QuickLink to="/admin/reviews" label="All reviews" detail="Experience + homestay feedback" />
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
      className="dashboard-panel-card block p-4 no-underline"
    >
      <div className="luxury-panel-heading font-display text-lg">{label}</div>
      <p className="luxury-panel-body mt-1 text-xs">{detail}</p>
    </Link>
  );
}
