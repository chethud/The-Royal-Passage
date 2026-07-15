import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminExperiencePendingBookingsTable } from "@/components/admin/AdminPendingBookingsTables";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { fetchAdminBookings, type AdminBookingRow } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";
import { isPendingBookingOverdue } from "@/hooks/use-admin-module-alerts";

export const Route = createFileRoute("/admin/experiences/pending-bookings")({
  head: () => ({
    meta: [
      { title: "User pending bookings — Experiences — The Royal Passage" },
      { name: "description", content: "Guest experience bookings still waiting for host accept." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminExperiencePendingBookingsPage,
});

function AdminExperiencePendingBookingsPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

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

  const load = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const rows = await fetchAdminBookings(accessToken, { status: "pending", limit: 200 });
      setBookings(rows);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load pending bookings."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    void load();
  }, [accessToken, load]);

  if (loading || !user || role !== "admin" || !accessToken) {
    return <PageLoadingGate />;
  }

  const overdue = bookings.filter((row) => isPendingBookingOverdue(row.createdAt)).length;

  return (
    <DashboardShell
      role="admin"
      title="User pending bookings"
      subtitle="Guest bookings still waiting for the host to accept. Overdue means pending longer than 1 hour."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin" className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline">
          ← Overview
        </Link>
        <p className="text-sm text-muted-foreground">
          {bookings.length} pending{overdue > 0 ? ` · ${overdue} overdue` : ""}
        </p>
      </div>
      {pageLoading ? (
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body py-8 text-sm">Loading pending bookings…</p>
        </LuxuryCheckoutPanel>
      ) : pageError ? (
        <LuxuryCheckoutPanel>
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        </LuxuryCheckoutPanel>
      ) : (
        <LuxuryCheckoutPanel>
          <AdminExperiencePendingBookingsTable bookings={bookings} />
        </LuxuryCheckoutPanel>
      )}
    </DashboardShell>
  );
}
