import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminHomestayFeaturedEditor } from "@/components/admin/AdminHomestayFeaturedEditor";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import {
  fetchFeaturedHomestaySlugs,
  resolveFeaturedHomestays,
} from "@/lib/homestay-featured-fns";
import { getHomestaysForUi } from "@/lib/homestay-fns";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/homestay-featured")({
  head: () => ({
    meta: [
      { title: "Featured homestays — Admin" },
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
      featured: resolveFeaturedHomestays(homestays, featuredSlugs),
    };
  },
  component: AdminHomestayFeaturedPage,
});

function AdminHomestayFeaturedPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { user, role, loading } = useAuthUser();
  const { homestays, featuredSlugs } = Route.useLoaderData();
  const [savedSlugs, setSavedSlugs] = useState(featuredSlugs);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: "/admin/homestay-featured" } });
      return;
    }
    if (role && role !== "admin") {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  const refresh = useCallback(() => {
    void router.invalidate();
  }, [router]);

  if (loading || !user || role !== "admin") {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Featured homestays"
      subtitle="Pick the three homestays shown on the public homestays page."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/homestay" className="dashboard-chrome-link">
          ← Homestay control
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
