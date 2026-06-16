import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminExperienceQueue } from "@/components/admin/AdminExperienceQueue";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/experiences/")({
  head: () => ({
    meta: [
      { title: "Approve experiences — The Royal Passage" },
      { name: "description", content: "Review pending host-submitted experiences." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminExperiencesPage,
});

function AdminExperiencesPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Approve experiences"
      subtitle="Pending submissions only. Click Review full details to open the complete submission on its own page."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin"
            className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
          >
            ← Overview
          </Link>
          <Link
            to="/admin/hosts"
            className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
          >
            Host accounts
          </Link>
        </div>
        <Link
          to="/experiences"
          className="dashboard-chrome-link"
        >
          View live catalog →
        </Link>
      </div>
      <LuxuryCheckoutPanel>
        <AdminExperienceQueue accessToken={accessToken} refreshKey={refreshKey} />
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}
