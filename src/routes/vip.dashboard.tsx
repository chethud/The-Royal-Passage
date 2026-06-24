import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { useVipOwnerAccess } from "@/lib/use-vip-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/vip/dashboard")({
  head: () => ({
    meta: [{ title: "VIP owner overview — The Royal Passage" }],
  }),
  component: VipOwnerOverviewPage,
});

function VipOwnerOverviewPage() {
  const { ready, loading } = useVipOwnerAccess();

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <VipOwnerDashboardShell
      title="Overview"
      subtitle="Manage VIP listings, concierge requests, and guest reservations."
      showRoleDescription={false}
    >
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { label: "Published listings", value: "0" },
          { label: "Pending bookings", value: "0" },
          { label: "Today's arrivals", value: "0" },
        ].map((stat) => (
          <LuxuryCheckoutPanel key={stat.label}>
            <p className="eyebrow luxury-panel-label">{stat.label}</p>
            <p className="mt-2 font-display text-4xl text-[#8B6914]">{stat.value}</p>
          </LuxuryCheckoutPanel>
        ))}
      </div>

      <LuxuryCheckoutPanel className="mt-8">
        <div className="flex items-start gap-3">
          <Crown className="mt-0.5 h-5 w-5 shrink-0 text-ember" aria-hidden />
          <div>
            <h2 className="luxury-panel-heading font-display text-xl">Set up your VIP dashboard</h2>
            <p className="luxury-panel-body mt-2 text-sm">
              Run <code className="text-ember">supabase/vip-module.sql</code> in Supabase, then ask
              your Royal Passage admin to provision a VIP owner account. Live listings and bookings
              will appear here once connected.
            </p>
            <Link
              to="/vip/listings/new"
              className="luxury-btn-sm luxury-btn-primary mt-5 inline-flex no-underline"
            >
              Add your first listing
            </Link>
          </div>
        </div>
      </LuxuryCheckoutPanel>
    </VipOwnerDashboardShell>
  );
}
