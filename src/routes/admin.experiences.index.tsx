import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminExperienceQueue } from "@/components/admin/AdminExperienceQueue";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/experiences/")({
  head: () => ({
    meta: [
      { title: "Approve experiences — The Royal Passage" },
      { name: "description", content: "Review and publish host-submitted experiences." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminExperiencesPage,
});

function AdminExperiencesPage() {
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
      title="Approve experiences"
      subtitle="Open each submission to review photos, details, and slots — then publish or reject from the review page."
    >
      <div className="mb-6">
        <Link to="/admin" className="text-sm text-ember hover:underline">
          ← Back to admin overview
        </Link>
      </div>
      <AdminExperienceQueue accessToken={accessToken} refreshKey={refreshKey} />
    </DashboardShell>
  );
}
