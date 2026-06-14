import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { AdminBookingsTable } from "@/components/admin/AdminBookingsTable";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { fetchAdminBookings, type AdminBookingRow } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { parseBookingListSearch } from "@/lib/dashboard-booking-filters";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";

export const Route = createFileRoute("/admin/bookings/")({
  validateSearch: parseBookingListSearch,
  head: () => ({
    meta: [
      { title: "Admin bookings — The Royal Passage" },
      { name: "description", content: "All guest reservations across the marketplace." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const navigate = useNavigate();
  const { status, payment, dateView } = Route.useSearch();
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

  const loadBookings = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const rows = await fetchAdminBookings(accessToken);
      setBookings(rows);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load bookings."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    void loadBookings();
  }, [accessToken, loadBookings]);

  if (loading || !user || role !== "admin" || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Bookings"
      subtitle="Every guest reservation across all hosts — filter by status or payment to review who booked."
      showRoleDescription={false}
    >
      {pageLoading ? (
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body py-8 text-sm">Loading bookings…</p>
        </LuxuryCheckoutPanel>
      ) : pageError ? (
        <LuxuryCheckoutPanel>
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        </LuxuryCheckoutPanel>
      ) : (
        <LuxuryCheckoutPanel>
          <AdminBookingsTable
            bookings={bookings}
            initialStatus={status ?? "all"}
            initialPayment={payment ?? "all"}
            initialDateView={dateView ?? "week"}
          />
        </LuxuryCheckoutPanel>
      )}

      <Link
        to="/admin"
        className="luxury-btn-sm dashboard-chrome-btn mt-8 inline-flex items-center no-underline"
      >
        ← Back to overview
      </Link>
    </DashboardShell>
  );
}
