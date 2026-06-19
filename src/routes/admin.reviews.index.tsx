import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminReviewsPanel } from "@/components/admin/AdminReviewsPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/reviews/")({
  head: () => ({
    meta: [
      { title: "Admin reviews — The Royal Passage" },
      { name: "description", content: "Moderate guest reviews across the marketplace." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Review moderation"
      subtitle="Verify or remove guest reviews across all experiences."
      showRoleDescription={false}
    >
      <Link
        to="/admin"
        className="luxury-btn-sm dashboard-chrome-btn mb-5 inline-flex items-center no-underline"
      >
        ← Overview
      </Link>
      <AdminReviewsPanel accessToken={accessToken} />
    </DashboardShell>
  );
}
