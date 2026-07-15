import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminHomestayStatsGrid } from "@/components/admin/AdminHomestayStatsGrid";
import { AdminReviewsHub } from "@/components/admin/AdminReviewsHub";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import {
  fetchAdminHomestayStats,
  type AdminHomestayStats,
} from "@/lib/api/admin-homestays";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/homestay/")({
  head: () => ({
    meta: [
      { title: "Homestays admin — The Royal Passage" },
      { name: "description", content: "Homestay approvals, owners, and catalog management." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminHomestayOverviewPage,
});

function AdminHomestayOverviewPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminHomestayStats | null>(null);
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

  const loadSummary = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const statsRow = await fetchAdminHomestayStats(accessToken);
      setStats(statsRow);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load homestay summary."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    void loadSummary();
  }, [accessToken, loadSummary]);

  if (loading || !user || role !== "admin" || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Homestay control"
      subtitle="Manage property approvals, owner accounts, bookings, and the live homestay catalog."
      showRoleDescription={false}
    >
      <div className="space-y-8">
        <LuxuryCheckoutPanel>
          {pageLoading ? (
            <p className="luxury-panel-body py-8 text-sm">Loading homestay analytics…</p>
          ) : pageError ? (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {pageError}
            </p>
          ) : stats ? (
            <AdminHomestayStatsGrid stats={stats} />
          ) : null}
        </LuxuryCheckoutPanel>

        <AdminReviewsHub scope="homestay" />

        {stats ? (
          <LuxuryCheckoutPanel>
            <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Quick links</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <QuickLink
                to="/admin/homestays"
                label="Approve homestays"
                detail={
                  stats.pendingApprovals
                    ? `${stats.pendingApprovals} awaiting approval`
                    : "No pending submissions"
                }
              />
              <QuickLink
                to="/admin/homestay-owners"
                label="Homestay owners"
                detail="Create owner login credentials"
              />
              <QuickLink
                to="/admin/homestay-featured"
                label="Featured homestays"
                detail="Choose the top 3 on the homestays page"
              />
              <QuickLink to="/homestays/browse" label="Live catalog" detail="Public homestay listings" />
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
