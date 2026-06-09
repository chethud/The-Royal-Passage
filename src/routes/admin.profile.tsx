import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AccountProfileSection } from "@/components/account/AccountProfileSection";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [{ title: "Profile — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: AdminProfilePage,
});

function AdminProfilePage() {
  const navigate = useNavigate();
  const { user, role, loading, accessToken } = useAuthUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }
    if (role && role !== "admin") {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  const ready = !loading && Boolean(user) && role === "admin" && Boolean(accessToken);

  if (!ready || !accessToken) {
    return (
      <DashboardShell role="admin" title="Profile" subtitle="Your admin account details.">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="admin" title="Profile" subtitle="Your admin account details.">
      <AccountProfileSection accessToken={accessToken} ready={ready} />
    </DashboardShell>
  );
}
