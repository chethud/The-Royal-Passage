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

export const Route = createFileRoute("/admin/vip-packages/")({
  head: () => ({
    meta: [
      { title: "Approve VIP packages — The Royal Passage" },
      { name: "description", content: "Review pending VIP package submissions." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminVipPackagesPage,
});

function AdminVipPackagesPage() {
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
      title="Approve VIP packages"
      subtitle="Pending curated package submissions from VIP owners."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
        <Link to="/vips" className="dashboard-chrome-link">
          View live catalog →
        </Link>
      </div>
      <LuxuryCheckoutPanel>
        <AdminVipQueue accessToken={accessToken} />
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}
