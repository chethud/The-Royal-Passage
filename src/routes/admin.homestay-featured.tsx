import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminHomestayFeaturedEditor } from "@/components/admin/AdminHomestayFeaturedEditor";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { fetchFeaturedHomestaySlugs } from "@/lib/homestay-featured-fns";
import { getHomestaysForUi } from "@/lib/homestay-fns";
import {
  dashboardPathForRoles,
  hasAdminAccess,
  hasEditorAccess,
} from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/homestay-featured")({
  head: () => ({
    meta: [
      { title: "Featured homestays — The Royal Passage" },
      { name: "description", content: "Choose the top three homestays for the homestays homepage." },
      ...NOINDEX_META,
    ],
  }),
  loader: async () => {
    const [catalog, featuredSlugs] = await Promise.all([
      getHomestaysForUi(),
      fetchFeaturedHomestaySlugs(),
    ]);
    const homestays = catalog.homestays ?? [];
    return {
      homestays,
      featuredSlugs,
    };
  },
  component: AdminHomestayFeaturedPage,
});

function AdminHomestayFeaturedPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { user, role, roles, loading } = useAuthUser();
  const { homestays, featuredSlugs } = Route.useLoaderData();
  const [savedSlugs, setSavedSlugs] = useState(featuredSlugs);
  const canEdit = hasEditorAccess(roles, role);
  const shellRole = hasAdminAccess(roles, role) ? "admin" : "editor";

  useEffect(() => {
    setSavedSlugs(featuredSlugs);
  }, [featuredSlugs]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: "/admin/homestay-featured" } });
      return;
    }
    if (!canEdit) {
      void navigate({ to: dashboardPathForRoles(roles, role) });
    }
  }, [canEdit, loading, navigate, role, roles, user]);

  const refresh = useCallback(() => {
    void router.invalidate();
  }, [router]);

  if (loading || !user || !canEdit) {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role={shellRole}
      title="Featured homestays"
      subtitle="Pick the three homestays shown on the public homestays page."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/homepage-photos" className="dashboard-chrome-link">
          ← Homepage photos
        </Link>
        <Link to="/homestays" className="dashboard-chrome-link">
          View live homestays page →
        </Link>
      </div>

      <AdminHomestayFeaturedEditor
        homestays={homestays}
        initialSlugs={savedSlugs}
        onSaved={(slugs) => {
          setSavedSlugs(slugs);
          refresh();
        }}
      />
    </DashboardShell>
  );
}
