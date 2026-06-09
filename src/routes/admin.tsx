import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminActivityFeed } from "@/components/admin/AdminActivityFeed";
import { AdminBookingsTable } from "@/components/admin/AdminBookingsTable";
import { AdminExperienceQueue } from "@/components/admin/AdminExperienceQueue";
import { AdminReviewsPanel } from "@/components/admin/AdminReviewsPanel";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { CreateHostForm } from "@/components/admin/CreateHostForm";
import { ManagedUsersPanel } from "@/components/admin/ManagedUsersPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import {
  fetchAdminActivity,
  fetchAdminBookings,
  fetchAdminStats,
  type AdminBookingRow,
  type AdminStats,
  type AuditLogEntry,
} from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — The Royal Passage" },
      { name: "description", content: "Platform analytics, moderation, and user management." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [activity, setActivity] = useState<AuditLogEntry[]>([]);
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
      const [statsRow, bookingRows, activityRows] = await Promise.all([
        fetchAdminStats(accessToken),
        fetchAdminBookings(accessToken),
        fetchAdminActivity(accessToken),
      ]);
      setStats(statsRow);
      setBookings(bookingRows);
      setActivity(activityRows);
    } catch (err) {
      setAnalyticsError(toErrorMessage(err, "Failed to load analytics."));
    } finally {
      setAnalyticsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    void loadAnalytics();
  }, [accessToken, loadAnalytics, refreshKey]);

  if (loading || !user || role !== "admin" || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Platform control"
      subtitle="Analytics, moderation, and host onboarding for The Royal Passage marketplace."
    >
      <div className="space-y-8">
        {analyticsLoading ? (
          <p className="text-sm text-muted-foreground">Loading platform analytics…</p>
        ) : analyticsError ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {analyticsError}
          </p>
        ) : stats ? (
          <AdminStatsGrid stats={stats} />
        ) : null}

        <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
          <h2 className="font-display text-2xl">Recent bookings</h2>
          <p className="mt-1 text-sm text-muted-foreground">Latest guest reservations across all hosts.</p>
          <div className="mt-6">
            <AdminBookingsTable
              bookings={bookings}
              commissionPercent={stats?.commissionPercent ?? 10}
            />
          </div>
        </section>

        <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
          <h2 className="font-display text-2xl">Activity feed</h2>
          <p className="mt-1 text-sm text-muted-foreground">Recent platform actions and audit events.</p>
          <div className="mt-6">
            <AdminActivityFeed entries={activity} />
          </div>
        </section>

        <AdminReviewsPanel accessToken={accessToken} />

        <CreateHostForm
          accessToken={accessToken}
          onCreated={() => setRefreshKey((value) => value + 1)}
        />
        <AdminExperienceQueue accessToken={accessToken} refreshKey={refreshKey} />
        <ManagedUsersPanel accessToken={accessToken} refreshKey={refreshKey} />
      </div>
    </DashboardShell>
  );
}
