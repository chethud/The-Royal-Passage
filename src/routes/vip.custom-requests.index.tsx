import { createFileRoute, Link } from "@tanstack/react-router";
import { VipCustomPackageRequestsQueue } from "@/components/vip-owner/VipCustomPackageRequestsQueue";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { useVipOwnerAccess } from "@/lib/use-vip-owner-access";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/vip/custom-requests/")({
  head: () => ({
    meta: [{ title: "Custom VIP package requests — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: VipCustomRequestsPage,
});

function VipCustomRequestsPage() {
  const { ready, loading, accessToken } = useVipOwnerAccess();

  if (loading || !ready || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <VipOwnerDashboardShell
      title="Custom package requests"
      subtitle="Bespoke itinerary requests from approved VIP members."
      showRoleDescription={false}
    >
      <Link
        to="/vip/dashboard"
        className="luxury-btn-sm dashboard-chrome-btn mb-5 inline-flex no-underline"
      >
        ← Overview
      </Link>
      <LuxuryCheckoutPanel>
        <VipCustomPackageRequestsQueue accessToken={accessToken} />
      </LuxuryCheckoutPanel>
    </VipOwnerDashboardShell>
  );
}
