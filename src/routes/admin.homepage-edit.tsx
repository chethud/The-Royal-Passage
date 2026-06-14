import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { HomepageEditPageShell } from "@/components/editor/HomepageEditView";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { getHomepageContent } from "@/lib/homepage-content-fns";
import { normalizeHomepageContent } from "@/lib/homepage-content";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin/homepage-edit")({
  head: () => ({
    meta: [{ title: "Edit homepage — Admin" }, ...NOINDEX_META],
  }),
  loader: async () => {
    const homepage = await getHomepageContent().catch(() => normalizeHomepageContent({}));
    return { homepage: normalizeHomepageContent(homepage ?? {}) };
  },
  component: AdminHomepageEditPage,
});

function AdminHomepageEditPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { user, role, loading, accessToken } = useAuthUser();
  const { homepage } = Route.useLoaderData();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: "/admin/homepage-edit" } });
      return;
    }
    if (role && role !== "admin") {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  const refreshHomepage = useCallback(() => {
    void router.invalidate().catch(() => {
      // Local editor state is already updated.
    });
  }, [router]);

  if (loading || !user || role !== "admin" || !accessToken) {
    return (
      <DashboardShell role="admin" title="Edit homepage" subtitle="Loading…" showRoleDescription={false}>
        <p className="text-sm text-muted-foreground">Loading editor…</p>
      </DashboardShell>
    );
  }

  return (
    <div className="pt-[var(--header-height)]">
      <HomepageEditPageShell homepage={homepage} onRefresh={refreshHomepage} editorRole="admin" />
    </div>
  );
}
