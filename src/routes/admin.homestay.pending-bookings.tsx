import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminHomestayPendingBookingsTable } from "@/components/admin/AdminPendingBookingsTables";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import {
  fetchAdminHomestayBookings,
  type AdminHomestayBookingRow,
} from "@/lib/api/admin-homestays";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { dashboardPathForRole } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";
import { isPendingBookingOverdue } from "@/hooks/use-admin-module-alerts";

export const Route = createFileRoute("/admin/homestay/pending-bookings")({
  head: () => ({
    meta: [
      { title: "User pending bookings — Homestays — The Royal Passage" },
      { name: "description", content: "Guest stay bookings still waiting for owner accept." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminHomestayPendingBookingsPage,
});

function AdminHomestayPendingBookingsPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<AdminHomestayBookingRow[]>([]);
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
      const rows = await fetchAdminHomestayBookings(accessToken, "pending");
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
      subtitle="Stay bookings still waiting for the owner to accept. Overdue means pending longer than 1 hour."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/homestay"
          className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
        >
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
          <AdminHomestayPendingBookingsTable bookings={bookings} />
        </LuxuryCheckoutPanel>
      )}
    </DashboardShell>
  );
}
