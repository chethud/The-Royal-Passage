import { createFileRoute, Link } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { useVipOwnerAccess } from "@/lib/use-vip-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/vip/listings/new")({
  head: () => ({
    meta: [{ title: "Add VIP listing — The Royal Passage" }],
  }),
  component: VipOwnerNewListingPage,
});

function VipOwnerNewListingPage() {
  const { ready, loading } = useVipOwnerAccess();

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <VipOwnerDashboardShell
      title="Add listing"
      subtitle="Describe your VIP property, upload gallery photos, and set nightly rates."
      showRoleDescription={false}
    >
      <LuxuryCheckoutPanel>
        <p className="luxury-panel-body text-sm">
          The VIP listing form connects to the API after <code>supabase/vip-module.sql</code> is
          applied. For now, contact Royal Passage admin to publish preview listings.
        </p>
        <Link
          to="/vip/listings"
          className="luxury-btn-sm luxury-btn-panel-outline mt-6 inline-flex no-underline"
        >
          Back to listings
        </Link>
      </LuxuryCheckoutPanel>
    </VipOwnerDashboardShell>
  );
}
