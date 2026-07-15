import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { AdminReviewsListPanel } from "@/components/admin/AdminReviewsListPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/reviews/experiences/")({
  validateSearch: z.object({
    from: z.enum(["hub"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Experience reviews — Admin — The Royal Passage" },
      { name: "description", content: "Moderate experience guest reviews." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminExperienceReviewsPage,
});

function AdminExperienceReviewsPage() {
  const navigate = useNavigate();
  const { from } = Route.useSearch();
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
      title="Experience reviews"
      subtitle="Moderate top guest feedback for experiences."
      showRoleDescription={false}
    >
      <AdminReviewsListPanel
        accessToken={accessToken}
        kind="experience"
        backTo={from === "hub" ? "/admin/reviews" : "/admin"}
        backLabel={from === "hub" ? "← Reviews" : "← Experiences admin"}
      />
    </DashboardShell>
  );
}
