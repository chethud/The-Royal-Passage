import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AccountProfileSection } from "@/components/account/AccountProfileSection";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { isGuestAccount, isUserRole, type UserRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/account/profile")({
  head: () => ({
    meta: [{ title: "Profile — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: AccountProfilePage,
});

function ProfileLoadingShell() {
  return (
    <GuestDashboardShell title="Profile" showPageHeader={false}>
      <p className="text-sm text-muted-foreground">Loading profile…</p>
    </GuestDashboardShell>
  );
}

function AccountProfilePage() {
  const navigate = useNavigate();
  const { user, role, roles, loading, hasCachedSession } = useAuthUser();

  useEffect(() => {
    if (loading) return;
    if (!user && !hasCachedSession) {
      void navigate({ to: "/sign-in", search: { redirect: "/account/profile" } });
      return;
    }
    if (user && role === "admin") {
      void navigate({ to: "/admin/profile" });
    }
  }, [hasCachedSession, loading, navigate, role, user]);

  if (loading || (!user && hasCachedSession)) {
    return <ProfileLoadingShell />;
  }

  if (!user) {
    return <ProfileLoadingShell />;
  }

  const resolvedRole: UserRole = isUserRole(role) ? role : "guest";
  const content = <AccountProfileSection />;

  if (resolvedRole === "admin") {
    return <ProfileLoadingShell />;
  }

  if (resolvedRole === "host") {
    return (
      <HostDashboardShell
        title="Account"
        subtitle="Your contact details for host communications and payouts."
      >
        {content}
      </HostDashboardShell>
    );
  }

  if (resolvedRole === "homestay_owner") {
    return (
      <HomestayOwnerDashboardShell
        title="Account"
        subtitle="Your contact details for property communications and payouts."
      >
        {content}
      </HomestayOwnerDashboardShell>
    );
  }

  if (resolvedRole === "vip_owner") {
    return (
      <VipOwnerDashboardShell
        title="Account"
        subtitle="Your contact details for VIP package management."
      >
        {content}
      </VipOwnerDashboardShell>
    );
  }

  if (resolvedRole === "editor") {
    return (
      <DashboardShell
        role={resolvedRole}
        title="Account"
        subtitle="Your editor account details."
        showRoleDescription={false}
      >
        {content}
      </DashboardShell>
    );
  }

  if (!isGuestAccount(resolvedRole, roles)) {
    return (
      <DashboardShell
        role={resolvedRole}
        title="Account"
        subtitle="Your account details."
        showRoleDescription={false}
      >
        {content}
      </DashboardShell>
    );
  }

  return (
    <GuestDashboardShell title="Profile" wide showPageHeader={false}>
      <div className="royal-passport-profile-page">{content}</div>
    </GuestDashboardShell>
  );
}
