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

export const Route = createFileRoute("/admin/reviews/homestays/")({
  validateSearch: z.object({
    from: z.enum(["hub"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Homestay reviews — Admin — The Royal Passage" },
      { name: "description", content: "Moderate homestay guest reviews." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminHomestayReviewsPage,
});

function AdminHomestayReviewsPage() {
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
      title="Homestay reviews"
      subtitle="Moderate top guest feedback for homestays."
      showRoleDescription={false}
    >
      <AdminReviewsListPanel
        accessToken={accessToken}
        kind="homestay"
        backTo={from === "hub" ? "/admin/reviews" : "/admin/homestay"}
        backLabel={from === "hub" ? "← Reviews" : "← Homestay admin"}
      />
    </DashboardShell>
  );
}
