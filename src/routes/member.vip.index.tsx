import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Crown } from "lucide-react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { isApprovedVipMember } from "@/lib/api/vip-membership";
import { dashboardPathForRole, isGuestAccount } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/member/vip/")({
  head: () => ({
    meta: [{ title: "VIP lounge — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: MemberVipHubPage,
});

function MemberVipHubPage() {
  const navigate = useNavigate();
  const { user, role, loading, vipMembershipStatus } = useAuthUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }
    if (!isGuestAccount(role)) {
      void navigate({ to: dashboardPathForRole(role) });
      return;
    }
    if (!isApprovedVipMember(vipMembershipStatus)) {
      void navigate({ to: "/experiences" });
    }
  }, [loading, navigate, role, user, vipMembershipStatus]);

  if (loading || !user || !isGuestAccount(role) || !isApprovedVipMember(vipMembershipStatus)) {
    return <PageLoadingGate />;
  }

  return (
    <GuestDashboardShell
      title="Royal VIP lounge"
      subtitle="Your approved membership unlocks curated packages and bespoke concierge itineraries in Mysuru."
      showRoleDescription={false}
    >
      <LuxuryCheckoutPanel>
        <div className="flex items-start gap-3">
          <Crown className="mt-0.5 h-5 w-5 shrink-0 text-ember" aria-hidden />
          <div>
            <h2 className="luxury-panel-heading font-display text-xl">Welcome, VIP member</h2>
            <p className="luxury-panel-body mt-2 text-sm">
              Browse published packages or request a fully customized itinerary tailored to your
              dates and preferences.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/member/vip/packages"
                className="luxury-btn-sm luxury-btn-primary inline-flex no-underline"
              >
                View packages
              </Link>
              <Link
                to="/member/vip/custom-request"
                className="luxury-btn-sm luxury-btn-panel-outline inline-flex no-underline"
              >
                Request custom package
              </Link>
            </div>
          </div>
        </div>
      </LuxuryCheckoutPanel>
    </GuestDashboardShell>
  );
}
