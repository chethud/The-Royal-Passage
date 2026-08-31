import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { countPendingPartnerTravelAgentApplications } from "@/lib/partner-travel-agent-fns";
import { fetchAdminTravelAgentBookings } from "@/lib/api/travel-agent-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/travel-agent/")({
  head: () => ({
    meta: [
      { title: "Travel agent admin — The Royal Passage" },
      { name: "description", content: "Travel agent applications and agent bookings." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminTravelAgentOverviewPage,
});

function AdminTravelAgentOverviewPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
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
      const [count, agentBookings] = await Promise.all([
        countPendingPartnerTravelAgentApplications({ data: { accessToken } }),
        fetchAdminTravelAgentBookings(accessToken, { status: "pending", limit: 200 }),
      ]);
      setPendingApplications(count);
      setPendingBookings(agentBookings.length);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load travel agent summary."));
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
      title="Travel agent admin"
      subtitle="Review partner applications, set agent discount rates, and monitor agent bookings."
      showRoleDescription={false}
    >
      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading summary…</p>
      ) : (
        <>
          {pageError ? <p className="mb-4 text-sm text-red-700">{pageError}</p> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <LuxuryCheckoutPanel>
              <p className="eyebrow luxury-panel-label">Pending applications</p>
              <p className="font-display text-4xl luxury-panel-heading">{pendingApplications}</p>
              <Link to="/admin/travel-agent/requests" className="luxury-btn-sm mt-4 inline-flex no-underline">
                Review applications →
              </Link>
            </LuxuryCheckoutPanel>
            <LuxuryCheckoutPanel>
              <p className="eyebrow luxury-panel-label">Pending agent bookings</p>
              <p className="font-display text-4xl luxury-panel-heading">{pendingBookings}</p>
              <Link to="/admin/travel-agent/bookings" className="luxury-btn-sm mt-4 inline-flex no-underline">
                View agent bookings →
              </Link>
            </LuxuryCheckoutPanel>
            <LuxuryCheckoutPanel>
              <p className="eyebrow luxury-panel-label">Quick links</p>
              <div className="mt-3 flex flex-col gap-2">
                <Link to="/partner/travel-agent" className="luxury-btn-sm dashboard-chrome-btn inline-flex no-underline">
                  Public application page →
                </Link>
              </div>
            </LuxuryCheckoutPanel>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
