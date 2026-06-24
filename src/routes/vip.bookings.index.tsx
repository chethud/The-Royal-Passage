import { createFileRoute } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { useVipOwnerAccess } from "@/lib/use-vip-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/vip/bookings/")({
  head: () => ({
    meta: [{ title: "VIP bookings — The Royal Passage" }],
  }),
  component: VipOwnerBookingsPage,
});

function VipOwnerBookingsPage() {
  const { ready, loading } = useVipOwnerAccess();

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <VipOwnerDashboardShell
      title="Bookings"
      subtitle="Confirm VIP reservations, mark payments, and track guest arrivals."
      showRoleDescription={false}
    >
      <LuxuryCheckoutPanel>
        <p className="luxury-panel-body text-sm">No VIP bookings yet.</p>
        <p className="luxury-panel-body mt-2 text-sm text-muted-foreground">
          Published listings and guest reservations will appear here after the VIP module is live.
        </p>
      </LuxuryCheckoutPanel>
    </VipOwnerDashboardShell>
  );
}
