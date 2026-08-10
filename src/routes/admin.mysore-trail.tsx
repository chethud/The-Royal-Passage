import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { MysoreTrailCatalogEditor } from "@/components/mysore-trail/MysoreTrailCatalogEditor";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";
import {
  defaultMysoreTrailCatalog,
  type MysoreTrailCatalog,
} from "@/data/mysore-trail-cms";
import { useAuthUser } from "@/lib/auth-user";
import { getMysoreTrailCatalog } from "@/lib/mysore-trail-fns";
import {
  canEditMysoreTrail,
  dashboardPathForRoles,
  hasAdminAccess,
} from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin/mysore-trail")({
  head: () => ({
    meta: [
      { title: "Edit Mysore Trail — The Royal Passage" },
      {
        name: "description",
        content:
          "Edit places, images, and hero destinations shown on the public Mysore Trail page.",
      },
      ...NOINDEX_META,
    ],
  }),
  loader: async () => {
    const catalog = await getMysoreTrailCatalog().catch(() => defaultMysoreTrailCatalog());
    return { catalog };
  },
  component: AdminMysoreTrailPage,
});

function AdminMysoreTrailPage() {
  const navigate = useNavigate();
  const { user, role, roles, loading, accessToken } = useAuthUser();
  const { catalog: loaded } = Route.useLoaderData();
  const [catalog, setCatalog] = useState<MysoreTrailCatalog>(loaded);
  const canEdit = canEditMysoreTrail(role, roles);
  const shellRole = hasAdminAccess(roles, role) ? "admin" : "editor";

  useEffect(() => {
    setCatalog(loaded);
  }, [loaded]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: "/admin/mysore-trail" } });
      return;
    }
    if (!canEdit) {
      void navigate({ to: dashboardPathForRoles(roles, role) });
    }
  }, [canEdit, loading, navigate, role, roles, user]);

  if (loading || !user || !canEdit || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role={shellRole}
      title="Mysore Trail"
      subtitle="Edit places, photo cards, and the opening hero — then publish to the live trail page."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/mysore-trail" search={{ place: undefined }} className="dashboard-chrome-link">
          ← View public page
        </Link>
        <Link to="/admin/homepage-edit" className="dashboard-chrome-link">
          Homepage editor
        </Link>
      </div>

      <MysoreTrailCatalogEditor
        initial={catalog}
        accessToken={accessToken}
        onPublished={setCatalog}
      />
    </DashboardShell>
  );
}
