import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminHomepagePhotoEditor } from "@/components/admin/AdminHomepagePhotoEditor";
import { AdminHomestayFeaturedEditor } from "@/components/admin/AdminHomestayFeaturedEditor";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { getHomepageContent } from "@/lib/homepage-content-fns";
import { normalizeHomepageContent } from "@/lib/homepage-content";
import { fetchFeaturedHomestaySlugs } from "@/lib/homestay-featured-fns";
import { getHomestaysForUi } from "@/lib/homestay-fns";
import { getCatalogForUi, getCatalogFallback } from "@/lib/marketplace-fns";
import {
  dashboardPathForRoles,
  hasAdminAccess,
  hasEditorAccess,
} from "@/lib/roles";
import { toShowcaseExperienceOption } from "@/lib/showcase-from-experience";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin/homepage-photos")({
  head: () => ({
    meta: [{ title: "Homepage photos — The Royal Passage" }, ...NOINDEX_META],
  }),
  loader: async () => {
    const [homepage, catalog, homestayCatalog, featuredSlugs] = await Promise.all([
      getHomepageContent().catch(() => normalizeHomepageContent({})),
      getCatalogForUi().catch(() => getCatalogFallback()),
      getHomestaysForUi().catch(() => ({ homestays: [] })),
      fetchFeaturedHomestaySlugs().catch(() => [] as string[]),
    ]);
    return {
      homepage: normalizeHomepageContent(homepage ?? {}),
      experiences: (catalog.experiences ?? []).map(toShowcaseExperienceOption),
      homestays: homestayCatalog.homestays ?? [],
      featuredSlugs,
    };
  },
  component: HomepagePhotosPage,
});

function HomepagePhotosPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { user, role, roles, loading, accessToken } = useAuthUser();
  const { homepage, experiences, homestays, featuredSlugs } = Route.useLoaderData();
  const [savedFeaturedSlugs, setSavedFeaturedSlugs] = useState(featuredSlugs);
  const canEdit = hasEditorAccess(roles, role);
  const shellRole = hasAdminAccess(roles, role) ? "admin" : "editor";

  useEffect(() => {
    setSavedFeaturedSlugs(featuredSlugs);
  }, [featuredSlugs]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: "/admin/homepage-photos" } });
      return;
    }
    if (!canEdit) {
      void navigate({ to: dashboardPathForRoles(roles, role) });
    }
  }, [canEdit, loading, navigate, role, roles, user]);

  const refresh = useCallback(() => {
    void router.invalidate();
  }, [router]);

  if (loading || !user || !canEdit || !accessToken) {
    return (
      <DashboardShell
        role={shellRole}
        title="Homepage photos"
        subtitle="Loading…"
        showRoleDescription={false}
      >
        <p className="text-sm text-muted-foreground">Loading photo editor…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role={shellRole}
      title="Homepage photos"
      subtitle="Update hero, heading, showcase, journal, homestay hero imagery, and featured homestays for the public site."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap gap-3">
        <Link to="/homestays" className="dashboard-chrome-link">
          View live homestays page →
        </Link>
        <Link to="/admin/homestay-featured" className="dashboard-chrome-link">
          Featured page →
        </Link>
      </div>

      <div className="space-y-10 pt-2">
        <AdminHomepagePhotoEditor initialContent={homepage} experiences={experiences} />

        <section className="space-y-4 border-t border-[rgb(200_162_90/0.22)] pt-8">
          <div>
            <h2 className="font-display text-2xl tracking-wide text-ink">Featured homestays</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Pick the three stays shown in &ldquo;Rest Where Stories Live&rdquo; on the public
              homestays page.
            </p>
          </div>
          <AdminHomestayFeaturedEditor
            homestays={homestays}
            initialSlugs={savedFeaturedSlugs}
            onSaved={(slugs) => {
              setSavedFeaturedSlugs(slugs);
              refresh();
            }}
          />
        </section>
      </div>
    </DashboardShell>
  );
}
