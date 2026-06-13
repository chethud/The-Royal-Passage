import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { fetchAdminStats, type AdminStats } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — The Royal Passage" },
      { name: "description", content: "Platform analytics and quick links." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

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

  useEffect(() => {
    if (!user) return;
    void getSupabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        setAccessToken(data.session?.access_token ?? null);
      });
  }, [user]);

  const loadAnalytics = useCallback(async () => {
    if (!accessToken) return;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const statsRow = await fetchAdminStats(accessToken);
      setStats(statsRow);
    } catch (err) {
      setAnalyticsError(toErrorMessage(err, "Failed to load analytics."));
    } finally {
      setAnalyticsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    void loadAnalytics();
  }, [accessToken, loadAnalytics]);

  if (loading || !user || role !== "admin" || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Platform control"
      subtitle="Key metrics at a glance. Open each section from the header menu for full details."
    >
      {analyticsLoading ? (
        <p className="text-sm text-muted-foreground">Loading platform analytics…</p>
      ) : analyticsError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {analyticsError}
        </p>
      ) : stats ? (
        <AdminStatsGrid stats={stats} />
      ) : null}

      {stats ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <QuickLink to="/admin/hosts" label="Host accounts" detail="Create login credentials" />
          <QuickLink to="/admin/activity" label="Activity log" detail="Recent platform events" />
        </div>
      ) : null}
    </DashboardShell>
  );
}

function QuickLink({ to, label, detail }: { to: string; label: string; detail: string }) {
  return (
    <Link
      to={to}
      className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-4 transition-colors hover:border-ember/40"
    >
      <div className="font-display text-lg text-ember">{label}</div>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </Link>
  );
}
