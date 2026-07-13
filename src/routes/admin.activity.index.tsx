import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminActivityFeed } from "@/components/admin/AdminActivityFeed";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { fetchAdminActivity, type AuditLogEntry } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/activity/")({
  head: () => ({
    meta: [
      { title: "Admin activity — The Royal Passage" },
      { name: "description", content: "Recent platform actions and audit events." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminActivityPage,
});

function AdminActivityPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activity, setActivity] = useState<AuditLogEntry[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

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

  const loadActivity = useCallback(async (opts?: { silent?: boolean }) => {
    if (!accessToken) return;
    if (!opts?.silent) setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const rows = await fetchAdminActivity(accessToken);
      setActivity(rows);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load activity."));
    } finally {
      if (!opts?.silent) setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    void loadActivity();
    const id = window.setInterval(() => void loadActivity({ silent: true }), 30_000);
    return () => window.clearInterval(id);
  }, [accessToken, loadActivity]);

  if (loading || !user || role !== "admin" || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Live activity"
      subtitle="New bookings, reviews, host signups, approvals, and cancellations — refreshing every 30 seconds."
      showRoleDescription={false}
    >
      <Link
        to="/admin"
        className="luxury-btn-sm dashboard-chrome-btn mb-5 inline-flex items-center no-underline"
      >
        ← Overview
      </Link>

      <LuxuryCheckoutPanel>
        {pageLoading ? (
          <p className="luxury-panel-body py-8 text-sm">Loading activity…</p>
        ) : pageError ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        ) : (
          <AdminActivityFeed entries={activity} />
        )}
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}
