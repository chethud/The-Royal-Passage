import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AccountProfileSection } from "@/components/account/AccountProfileSection";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { isUserRole, type UserRole } from "@/lib/roles";
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
  const { user, role, loading, hasCachedSession } = useAuthUser();

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

  const subtitle =
    resolvedRole === "host"
      ? "Your contact details for host communications and payouts."
      : resolvedRole === "editor"
        ? "Your editor account details."
        : undefined;

  const content = <AccountProfileSection />;

  if (resolvedRole === "admin") {
    return <ProfileLoadingShell />;
  }

  if (resolvedRole === "host") {
    return (
      <HostDashboardShell title="Profile" subtitle={subtitle}>
        {content}
      </HostDashboardShell>
    );
  }

  if (resolvedRole === "editor") {
    return (
      <DashboardShell role={resolvedRole} title="Profile" subtitle={subtitle}>
        {content}
      </DashboardShell>
    );
  }

  return (
    <GuestDashboardShell title="Profile" wide showPageHeader={false}>
      {content}
    </GuestDashboardShell>
  );
}
