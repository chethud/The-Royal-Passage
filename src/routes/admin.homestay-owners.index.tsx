import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreateHomestayOwnerForm } from "@/components/admin/CreateHomestayOwnerForm";
import { ManagedUsersPanel } from "@/components/admin/ManagedUsersPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin/homestay-owners/")({
  head: () => ({
    meta: [
      { title: "Homestay owners — The Royal Passage" },
      { name: "description", content: "Create homestay owner credentials and manage platform users." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminHomestayOwnersPage,
});

function AdminHomestayOwnersPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  useEffect(() => {
    if (!user) return;
    void getSupabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        setAccessToken(data.session?.access_token ?? null);
      });
  }, [user]);

  if (loading || !user || role !== "admin" || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Homestay owners"
      subtitle="Create login credentials for property owners who list homestays on the platform."
      showRoleDescription={false}
    >
      <Link
        to="/admin/homestay"
        className="luxury-btn-sm dashboard-chrome-btn mb-5 inline-flex items-center no-underline"
      >
        ← Overview
      </Link>

      <div className="space-y-8">
        <CreateHomestayOwnerForm
          accessToken={accessToken}
          onCreated={() => setRefreshKey((value) => value + 1)}
        />
        <ManagedUsersPanel accessToken={accessToken} refreshKey={refreshKey} />
      </div>
    </DashboardShell>
  );
}
