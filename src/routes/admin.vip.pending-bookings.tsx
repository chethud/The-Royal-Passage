import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/vip/pending-bookings")({
  head: () => ({
    meta: [
      { title: "User pending bookings — VIP — The Royal Passage" },
      { name: "description", content: "VIP package bookings awaiting owner accept." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminVipPendingBookingsPage,
});

function AdminVipPendingBookingsPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();

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

  if (loading || !user || role !== "admin") {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role="admin"
      title="User pending bookings"
      subtitle="VIP package bookings still waiting for owner accept."
      showRoleDescription={false}
    >
      <div className="mb-5">
        <Link to="/admin/vip" className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline">
          ← Overview
        </Link>
      </div>
      <LuxuryCheckoutPanel>
        <p className="luxury-panel-body py-8 text-sm">
          VIP package bookings coming soon. Guest booking accept for VIP packages is not live yet.
        </p>
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}
