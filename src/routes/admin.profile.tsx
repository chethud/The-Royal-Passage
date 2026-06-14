import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminProfileNav } from "@/components/admin/AdminProfileNav";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [{ title: "Admin profile — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: AdminProfileLayout,
});

function AdminProfileLayout() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: "/admin/profile" } });
      return;
    }
    if (role && role !== "admin") {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  if (loading || !user || role !== "admin") {
    return (
      <DashboardShell role="admin" title="Profile" subtitle="Loading…" showRoleDescription={false}>
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="admin"
      title="Profile"
      subtitle="Your account and homepage photo management."
      showRoleDescription={false}
    >
      <AdminProfileNav />
      <div className="mt-8">
        <Outlet />
      </div>
    </DashboardShell>
  );
}
