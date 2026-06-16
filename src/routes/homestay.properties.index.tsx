import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { OwnerHomestayTable } from "@/components/homestay-owner/OwnerHomestayTable";
import { fetchOwnerHomestays, type OwnerHomestaySummary } from "@/lib/api/owner-homestays";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHomestayOwnerAccess } from "@/lib/use-homestay-owner-access";

export const Route = createFileRoute("/homestay/properties/")({
  head: () => ({
    meta: [{ title: "My properties — The Royal Passage" }],
  }),
  component: OwnerHomestaysPage,
});

function OwnerHomestaysPage() {
  const { accessToken, ready, loading } = useHomestayOwnerAccess();
  const [homestays, setHomestays] = useState<OwnerHomestaySummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      setHomestays(await fetchOwnerHomestays(accessToken));
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load properties."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  if (loading || !ready) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <HomestayOwnerDashboardShell
      title="My properties"
      subtitle="Create listings, manage rooms, block dates, and submit for admin review."
      showRoleDescription={false}
    >
      <LuxuryCheckoutPanel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="luxury-panel-body text-sm">Draft properties, add rooms, and submit for Royal Passage review.</p>
          <Link to="/homestay/properties/new" className="luxury-btn-sm luxury-btn-primary inline-flex no-underline">
            Add property
          </Link>
        </div>
        <div className="mt-6">
          {pageLoading ? (
            <p className="luxury-panel-body py-8 text-sm">Loading properties…</p>
          ) : pageError ? (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {pageError}
            </p>
          ) : homestays.length === 0 ? (
            <div className="py-4 text-center">
              <p className="luxury-panel-body text-sm">No properties yet.</p>
              <Link
                to="/homestay/properties/new"
                className="luxury-btn-sm luxury-btn-primary mt-4 inline-flex no-underline"
              >
                Add your first property
              </Link>
            </div>
          ) : (
            <OwnerHomestayTable homestays={homestays} />
          )}
        </div>
      </LuxuryCheckoutPanel>
    </HomestayOwnerDashboardShell>
  );
}
