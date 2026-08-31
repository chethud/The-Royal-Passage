import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { TravelAgentBookingsTable } from "@/components/travel-agent/TravelAgentBookingsTable";
import { useAuthUser } from "@/lib/auth-user";
import {
  fetchAdminTravelAgentBookings,
  type AdminTravelAgentBookingSummary,
} from "@/lib/api/travel-agent-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/travel-agent/bookings")({
  head: () => ({
    meta: [
      { title: "Travel agent bookings — The Royal Passage" },
      { name: "description", content: "Bookings placed by travel agents on behalf of clients." },
      ...NOINDEX_META,
    ],
  }),
  component: AdminTravelAgentBookingsPage,
});

function AdminTravelAgentBookingsPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<AdminTravelAgentBookingSummary[]>([]);
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

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      setBookings(await fetchAdminTravelAgentBookings(accessToken, { limit: 200 }));
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load agent bookings."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    void loadPage();
  }, [accessToken, loadPage]);

  if (loading || !user || role !== "admin" || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Agent bookings"
      subtitle="All experience and homestay reservations placed by approved travel agents."
      showRoleDescription={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/travel-agent"
          className="luxury-btn-sm dashboard-chrome-btn inline-flex items-center no-underline"
        >
          ← Overview
        </Link>
        <button type="button" className="luxury-btn-sm dashboard-chrome-btn" onClick={() => void loadPage()}>
          Refresh
        </button>
      </div>

      {pageLoading ? (
        <LuxuryCheckoutPanel>
          <p className="text-sm luxury-panel-body">Loading agent bookings…</p>
        </LuxuryCheckoutPanel>
      ) : (
        <>
          {pageError ? (
            <LuxuryCheckoutPanel>
              <p className="text-sm text-red-700">{pageError}</p>
            </LuxuryCheckoutPanel>
          ) : null}
          <LuxuryCheckoutPanel>
            <TravelAgentBookingsTable bookings={bookings} showAgentColumn initialStatus="all" />
          </LuxuryCheckoutPanel>
        </>
      )}
    </DashboardShell>
  );
}
