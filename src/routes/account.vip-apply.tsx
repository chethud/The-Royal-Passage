import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { VipMembershipApplyForm } from "@/components/vip/VipMembershipApplyForm";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole, isGuestAccount } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/account/vip-apply")({
  head: () => ({
    meta: [{ title: "Apply for VIP membership — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: AccountVipApplyPage,
});

function AccountVipApplyPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: "/account/vip-apply" } });
      return;
    }
    if (!isGuestAccount(role)) {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  if (loading || !user || !isGuestAccount(role)) {
    return <PageLoadingGate />;
  }

  return (
    <GuestDashboardShell
      title="VIP membership"
      subtitle="Apply for Royal VIP access to curated packages and bespoke Mysuru itineraries."
      showRoleDescription={false}
    >
      <VipMembershipApplyForm />
    </GuestDashboardShell>
  );
}
