import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { EscalationDetailsForm } from "@/components/account/EscalationDetailsForm";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { hasRole, isUserRole, type UserRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/account/escalation")({
  head: () => ({
    meta: [{ title: "Escalation details — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: AccountEscalationPage,
});

function LoadingShell() {
  return (
    <GuestDashboardShell title="Escalation details" showPageHeader={false}>
      <p className="text-sm text-muted-foreground">Loading escalation details…</p>
    </GuestDashboardShell>
  );
}

function AccountEscalationPage() {
  const navigate = useNavigate();
  const { user, role, roles, loading, hasCachedSession } = useAuthUser();
  const search = useSearch({ strict: false }) as { scope?: "host" | "homestay_owner" | "vip_owner" };

  useEffect(() => {
    if (loading) return;
    if (!user && !hasCachedSession) {
      void navigate({ to: "/sign-in", search: { redirect: "/account/escalation" } });
      return;
    }
    if (role === "admin") {
      void navigate({ to: "/admin/profile/escalation" });
      return;
    }
    if (role && !hasRole(roles, "host", role) && !hasRole(roles, "homestay_owner", role) && !hasRole(roles, "vip_owner", role)) {
      void navigate({ to: "/account/profile" });
    }
  }, [hasCachedSession, loading, navigate, role, roles, user]);

  if (loading || (!user && hasCachedSession)) return <LoadingShell />;
  if (!user) return <LoadingShell />;

  const resolvedRole: UserRole = isUserRole(role) ? role : "guest";
  const scope =
    search.scope ??
    (resolvedRole === "host" || resolvedRole === "homestay_owner" || resolvedRole === "vip_owner"
      ? resolvedRole
      : "host");

  if (scope === "host" && hasRole(roles, "host", resolvedRole)) {
    return (
      <HostDashboardShell
        title="Escalation details"
        subtitle="Manage host escalation contacts for urgent platform communication."
      >
        <EscalationDetailsForm roleScope="host" />
      </HostDashboardShell>
    );
  }

  if (scope === "homestay_owner" && hasRole(roles, "homestay_owner", resolvedRole)) {
    return (
      <HomestayOwnerDashboardShell
        title="Escalation details"
        subtitle="Manage homestay escalation contacts for property operations and urgent guest issues."
      >
        <EscalationDetailsForm roleScope="homestay_owner" />
      </HomestayOwnerDashboardShell>
    );
  }

  if (scope === "vip_owner" && hasRole(roles, "vip_owner", resolvedRole)) {
    return (
      <VipOwnerDashboardShell
        title="Escalation details"
        subtitle="Manage VIP escalation contacts for concierge and member support."
      >
        <EscalationDetailsForm roleScope="vip_owner" />
      </VipOwnerDashboardShell>
    );
  }

  return (
    <DashboardShell role={resolvedRole} title="Escalation details" subtitle="Unavailable." showRoleDescription={false}>
      <p className="text-sm text-muted-foreground">Escalation details are available for provider accounts only.</p>
    </DashboardShell>
  );
}
