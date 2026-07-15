import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminExperienceQueue } from "@/components/admin/AdminExperienceQueue";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/experiences/requests")({
  head: () => ({
    meta: [
      { title: "Host requests — Experiences — The Royal Passage" },
      { name: "description", content: "Pending host experience submissions awaiting approval." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminExperienceRequestsPage,
});

function AdminExperienceRequestsPage() {
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
      title="Host requests"
      subtitle="Experience listings waiting for admin approval."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin" className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline">
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
        <AdminExperienceQueue accessToken={accessToken} refreshKey={refreshKey} />
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}
