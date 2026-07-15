import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { fetchAdminVipPackageApprovals } from "@/lib/api/admin-vip-packages";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/vip/")({
  head: () => ({
    meta: [
      { title: "VIP admin — The Royal Passage" },
      { name: "description", content: "VIP package approvals, owners, and catalog management." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminVipOverviewPage,
});

function AdminVipOverviewPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
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
      const rows = await fetchAdminVipPackageApprovals(accessToken);
      setPendingCount(rows.length);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load VIP summary."));
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
      title="VIP control"
      subtitle="Manage package approvals, concierge owner accounts, and the live VIP catalog."
      showRoleDescription={false}
    >
      <div className="space-y-8">
        <LuxuryCheckoutPanel>
          {pageLoading ? (
            <p className="luxury-panel-body py-8 text-sm">Loading VIP summary…</p>
          ) : pageError ? (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {pageError}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryCard
                label="Pending approvals"
                value={String(pendingCount)}
                hint="Packages awaiting review"
              />
              <SummaryCard label="Module" value="VIP" hint="Curated packages & custom enquiries" />
              <SummaryCard label="City" value="Mysuru" hint="VIP packages are Mysuru-only" />
            </div>
          )}
        </LuxuryCheckoutPanel>

        <LuxuryCheckoutPanel>
          <h2 className="luxury-panel-heading font-display text-xl tracking-wide">Quick links</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QuickLink
              to="/admin/vip-packages"
              label="Approve packages"
              detail={
                pendingCount ? `${pendingCount} awaiting approval` : "No pending submissions"
              }
            />
            <QuickLink
              to="/admin/vip-owners"
              label="VIP owners"
              detail="Create concierge owner credentials"
            />
            <QuickLink to="/vips" label="Live catalog" detail="Public VIP package listings" />
          </div>
        </LuxuryCheckoutPanel>
      </div>
    </DashboardShell>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="dashboard-panel-card p-4">
      <p className="luxury-panel-body text-xs uppercase tracking-[0.14em]">{label}</p>
      <p className="luxury-panel-heading mt-2 font-display text-2xl">{value}</p>
      <p className="luxury-panel-body mt-1 text-xs">{hint}</p>
    </div>
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
