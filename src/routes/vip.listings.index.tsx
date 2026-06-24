import { createFileRoute, Link } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { useVipOwnerAccess } from "@/lib/use-vip-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/vip/listings/")({
  head: () => ({
    meta: [{ title: "My VIP listings — The Royal Passage" }],
  }),
  component: VipOwnerListingsPage,
});

function VipOwnerListingsPage() {
  const { ready, loading } = useVipOwnerAccess();

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <VipOwnerDashboardShell
      title="My listings"
      subtitle="Create palace suites, villas, and private retreats for Royal Passage VIP guests."
      showRoleDescription={false}
    >
      <LuxuryCheckoutPanel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="luxury-panel-body text-sm">
            Draft listings, set concierge notes, and submit for admin review.
          </p>
          <Link to="/vip/listings/new" className="luxury-btn-sm luxury-btn-primary inline-flex no-underline">
            Add listing
          </Link>
        </div>
        <p className="luxury-panel-body mt-6 text-sm text-muted-foreground">
          No listings yet. Add your first VIP property to start accepting reservations.
        </p>
      </LuxuryCheckoutPanel>
    </VipOwnerDashboardShell>
  );
}
