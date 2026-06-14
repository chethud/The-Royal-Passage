import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreateHostForm } from "@/components/admin/CreateHostForm";
import { ManagedUsersPanel } from "@/components/admin/ManagedUsersPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin/hosts/")({
  head: () => ({
    meta: [
      { title: "Host accounts — The Royal Passage" },
      { name: "description", content: "Create host login credentials and manage platform users." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminHostsPage,
});

function AdminHostsPage() {
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
      title="Host accounts"
      subtitle="Create login credentials for new hosts and view all platform users."
      showRoleDescription={false}
    >
      <Link
        to="/admin"
        className="luxury-btn-sm luxury-btn-panel-outline mb-5 inline-flex items-center no-underline"
      >
        ← Overview
      </Link>

      <div className="space-y-8">
        <CreateHostForm
          accessToken={accessToken}
          onCreated={() => setRefreshKey((value) => value + 1)}
        />
        <ManagedUsersPanel accessToken={accessToken} refreshKey={refreshKey} />
      </div>
    </DashboardShell>
  );
}
