import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminVipQueue } from "@/components/admin/AdminVipQueue";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/vip/requests")({
  head: () => ({
    meta: [
      { title: "Host requests — VIP — The Royal Passage" },
      { name: "description", content: "Pending VIP package submissions awaiting approval." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminVipRequestsPage,
});

function AdminVipRequestsPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
      subtitle="VIP packages waiting for admin approval."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link to="/admin/vip" className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline">
          ← Overview
        </Link>
      </div>
      <LuxuryCheckoutPanel>
        <AdminVipQueue accessToken={accessToken} />
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}
