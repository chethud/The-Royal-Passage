import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminPartnerTravelAgentApplicationsQueue } from "@/components/admin/AdminPartnerTravelAgentApplicationsQueue";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/travel-agent/requests")({
  head: () => ({
    meta: [
      { title: "Travel agent applications — The Royal Passage" },
      {
        name: "description",
        content: "Pending travel agent partner applications awaiting approval and discount setup.",
      },
      ...NOINDEX_META,
    ],
  }),
  component: AdminTravelAgentRequestsPage,
});

function AdminTravelAgentRequestsPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  if (loading || !user || role !== "admin" || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Travel agent applications"
      subtitle="Review company GST details and set the discount rate before approving."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/travel-agent"
          className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
        >
          ← Overview
        </Link>
        <button
          type="button"
          className="luxury-btn-sm dashboard-chrome-btn"
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          Refresh
        </button>
      </div>

      <LuxuryCheckoutPanel>
        <h2 className="mb-4 font-display text-xl luxury-panel-heading">Partner applications</h2>
        <AdminPartnerTravelAgentApplicationsQueue accessToken={accessToken} refreshKey={refreshKey} />
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}
