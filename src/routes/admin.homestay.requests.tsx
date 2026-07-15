import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminHomestayQueue } from "@/components/admin/AdminHomestayQueue";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/homestay/requests")({
  head: () => ({
    meta: [
      { title: "Host requests — Homestays — The Royal Passage" },
      { name: "description", content: "Pending homestay submissions awaiting approval." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminHomestayRequestsPage,
});

function AdminHomestayRequestsPage() {
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
      subtitle="Homestay listings waiting for admin approval."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/homestay"
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
        <AdminHomestayQueue accessToken={accessToken} refreshKey={refreshKey} />
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}
