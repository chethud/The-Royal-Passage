import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { HomepageEditPageShell } from "@/components/editor/HomepageEditView";
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

export const Route = createFileRoute("/admin/homepage-edit")({
  head: () => ({
    meta: [{ title: "Edit homepage — The Royal Passage" }, ...NOINDEX_META],
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
  component: AdminHomepageEditPage,
});

function AdminHomepageEditPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { user, role, roles, loading, accessToken } = useAuthUser();
  const { homepage, experiences } = Route.useLoaderData();
  const canEdit = hasEditorAccess(roles, role);
  const editorRole = hasAdminAccess(roles, role) ? "admin" : "editor";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: "/admin/homepage-edit" } });
      return;
    }
    if (!canEdit) {
      void navigate({ to: dashboardPathForRoles(roles, role) });
    }
  }, [canEdit, loading, navigate, role, roles, user]);

  const refreshHomepage = useCallback(() => {
    void router.invalidate().catch(() => {
      // Local editor state is already updated.
    });
  }, [router]);

  if (loading || !user || !canEdit || !accessToken) {
    return (
      <DashboardShell
        role={editorRole}
        title="Edit homepage"
        subtitle="Loading…"
        showRoleDescription={false}
      >
        <p className="text-sm text-muted-foreground">Loading editor…</p>
      </DashboardShell>
    );
  }

  return (
    <HomepageEditPageShell
      homepage={homepage}
      onRefresh={refreshHomepage}
      editorRole={editorRole}
      experiences={experiences}
    />
  );
}
