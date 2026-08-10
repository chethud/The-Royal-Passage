import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { MysoreTrailBuilder } from "@/components/mysore-trail/MysoreTrailBuilder";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";
import { DEFAULT_MYSORE_TRAIL, type MysoreTrailItinerary } from "@/data/mysore-trail";
import { useAuthUser } from "@/lib/auth-user";
import { getMysoreTrail } from "@/lib/mysore-trail-fns";
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
        content: "Publish the curated Mysuru itinerary shown on the public Mysore Trail page.",
      },
      ...NOINDEX_META,
    ],
  }),
  loader: async () => {
    const trail = await getMysoreTrail().catch(() => structuredClone(DEFAULT_MYSORE_TRAIL));
    return { trail };
  },
  component: AdminMysoreTrailPage,
});

function AdminMysoreTrailPage() {
  const navigate = useNavigate();
  const { user, role, roles, loading, accessToken } = useAuthUser();
  const { trail: loaded } = Route.useLoaderData();
  const [trail, setTrail] = useState<MysoreTrailItinerary>(loaded);
  const canEdit = canEditMysoreTrail(role, roles);
  const shellRole = hasAdminAccess(roles, role) ? "admin" : "editor";

  useEffect(() => {
    setTrail(loaded);
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
      subtitle="Edit and publish the public Mysuru itinerary. Admins and editors can publish."
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

      <MysoreTrailBuilder
        initial={trail}
        mode="publish"
        accessToken={accessToken}
        onPublished={setTrail}
      />
    </DashboardShell>
  );
}
