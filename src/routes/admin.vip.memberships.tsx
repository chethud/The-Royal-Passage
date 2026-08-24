import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { VipMembershipApplicationsQueue } from "@/components/vip-owner/VipMembershipApplicationsQueue";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/vip/memberships")({
  head: () => ({
    meta: [
      { title: "VIP membership applications — Admin — The Royal Passage" },
      {
        name: "description",
        content: "Review guest VIP membership applications awaiting approval.",
      },
      ...NOINDEX_META,
    ],
  }),
  component: AdminVipMembershipsPage,
});

function AdminVipMembershipsPage() {
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
      title="Membership applications"
      subtitle="Guest VIP membership requests. Approve or reject — same queue VIP hosts see."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link to="/admin/vip" className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline">
          ← Overview
        </Link>
      </div>
      <LuxuryCheckoutPanel>
        <VipMembershipApplicationsQueue accessToken={accessToken} />
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}
