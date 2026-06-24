import { createFileRoute, Link } from "@tanstack/react-router";
import { VipMembershipApplicationsQueue } from "@/components/vip-owner/VipMembershipApplicationsQueue";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { useVipOwnerAccess } from "@/lib/use-vip-owner-access";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/vip/members/")({
  head: () => ({
    meta: [{ title: "VIP membership applications — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: VipMembersPage,
});

function VipMembersPage() {
  const { ready, loading, accessToken } = useVipOwnerAccess();

  if (loading || !ready || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <VipOwnerDashboardShell
      title="Membership applications"
      subtitle="Review guest VIP membership requests. All VIP host accounts share this queue."
      showRoleDescription={false}
    >
      <Link
        to="/vip/dashboard"
        className="luxury-btn-sm dashboard-chrome-btn mb-5 inline-flex no-underline"
      >
        ← Overview
      </Link>
      <LuxuryCheckoutPanel>
        <VipMembershipApplicationsQueue accessToken={accessToken} />
      </LuxuryCheckoutPanel>
    </VipOwnerDashboardShell>
  );
}
