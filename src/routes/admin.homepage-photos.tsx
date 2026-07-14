import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminHomepagePhotoEditor } from "@/components/admin/AdminHomepagePhotoEditor";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { getHomepageContent } from "@/lib/homepage-content-fns";
import { normalizeHomepageContent } from "@/lib/homepage-content";
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
    const [homepage, catalog] = await Promise.all([
      getHomepageContent().catch(() => normalizeHomepageContent({})),
      getCatalogForUi().catch(() => getCatalogFallback()),
    ]);
    return {
      homepage: normalizeHomepageContent(homepage ?? {}),
      experiences: (catalog.experiences ?? []).map(toShowcaseExperienceOption),
    };
  },
  component: HomepagePhotosPage,
});

function HomepagePhotosPage() {
  const navigate = useNavigate();
  const { user, role, roles, loading, accessToken } = useAuthUser();
  const { homepage, experiences } = Route.useLoaderData();
  const canEdit = hasEditorAccess(roles, role);
  const shellRole = hasAdminAccess(roles, role) ? "admin" : "editor";

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
      subtitle="Update hero, heading, showcase, journal, and homestay hero imagery for the public site."
      showRoleDescription={false}
    >
      {hasAdminAccess(roles, role) ? (
        <div className="mb-5 flex flex-wrap gap-3">
          <Link to="/admin/homestay-featured" className="dashboard-chrome-link">
            Featured homestays →
          </Link>
        </div>
      ) : null}
      <div className="pt-2">
        <AdminHomepagePhotoEditor initialContent={homepage} experiences={experiences} />
      </div>
    </DashboardShell>
  );
}
