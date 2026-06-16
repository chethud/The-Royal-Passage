import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminHomestayQueue } from "@/components/admin/AdminHomestayQueue";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin/homestays/")({
  head: () => ({
    meta: [
      { title: "Approve homestays — The Royal Passage" },
      { name: "description", content: "Review pending homestay owner submissions." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminHomestaysPage,
});

function AdminHomestaysPage() {
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
      title="Approve homestays"
      subtitle="Pending property submissions from homestay owners."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin" className="luxury-btn-sm dashboard-chrome-btn inline-flex no-underline">
            ← Overview
          </Link>
          <Link to="/admin/homestay-owners" className="luxury-btn-sm dashboard-chrome-btn inline-flex no-underline">
            Homestay owners
          </Link>
        </div>
        <Link to="/homestays" className="dashboard-chrome-link">
          View live catalog →
        </Link>
      </div>
      <LuxuryCheckoutPanel>
        <AdminHomestayQueue accessToken={accessToken} refreshKey={refreshKey} />
      </LuxuryCheckoutPanel>
    </DashboardShell>
  );
}
