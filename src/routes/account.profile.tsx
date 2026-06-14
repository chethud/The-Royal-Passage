import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
    <GuestDashboardShell title="Profile" subtitle="Your account details.">
      <p className="text-sm text-muted-foreground">Loading profile…</p>
    </GuestDashboardShell>
  );
}

function AccountProfilePage() {
  const navigate = useNavigate();
  const { user, role, loading, accessToken } = useAuthUser();
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (!clientReady || loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: "/account/profile" } });
    }
  }, [clientReady, loading, navigate, user]);

  if (!clientReady || loading) {
    return <ProfileLoadingShell />;
  }

  if (!user) {
    return <ProfileLoadingShell />;
  }

  const resolvedRole: UserRole = isUserRole(role) ? role : "guest";
  const ready = Boolean(accessToken);

  const subtitle =
    resolvedRole === "host"
      ? "Your contact details for host communications and payouts."
      : resolvedRole === "admin"
        ? "Your admin account details."
        : resolvedRole === "editor"
          ? "Your editor account details."
          : "Your contact details for bookings and host communication.";

  const content = !ready ? (
    <p className="text-sm text-muted-foreground">Loading profile…</p>
  ) : (
    <AccountProfileSection accessToken={accessToken!} ready={ready} />
  );

  if (resolvedRole === "host") {
    return (
      <HostDashboardShell title="Profile" subtitle={subtitle}>
        {content}
      </HostDashboardShell>
    );
  }

  if (resolvedRole === "admin" || resolvedRole === "editor") {
    return (
      <DashboardShell role={resolvedRole} title="Profile" subtitle={subtitle}>
        {content}
      </DashboardShell>
    );
  }

  return (
    <GuestDashboardShell title="Profile" subtitle={subtitle}>
      {content}
    </GuestDashboardShell>
  );
}
