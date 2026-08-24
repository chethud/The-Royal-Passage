import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { OwnerHomestayTable } from "@/components/homestay-owner/OwnerHomestayTable";
import {
  CornerFiligree,
  OrnamentalDivider,
  PalaceSilhouette,
} from "@/components/site/RoyalHeritageDecor";
import { fetchOwnerHomestays, type OwnerHomestaySummary } from "@/lib/api/owner-homestays";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHomestayOwnerAccess } from "@/lib/use-homestay-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/homestay/properties/")({
  head: () => ({
    meta: [{ title: "My properties — The Royal Passage" }],
  }),
  component: OwnerHomestaysPage,
});

function PanelCorners() {
  return (
    <>
      <CornerFiligree className="host-catalog-ledger__corner host-catalog-ledger__corner--tl" />
      <CornerFiligree className="host-catalog-ledger__corner host-catalog-ledger__corner--tr" />
      <CornerFiligree className="host-catalog-ledger__corner host-catalog-ledger__corner--bl" />
      <CornerFiligree className="host-catalog-ledger__corner host-catalog-ledger__corner--br" />
    </>
  );
}

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
    return <PageLoadingGate />;
  }

  return (
    <HomestayOwnerDashboardShell
      title="My properties"
      subtitle="Create listings, block dates, and submit for admin review."
      showRoleDescription={false}
      variant="experiences"
    >
      <section className="host-catalog-ledger">
        <PanelCorners />
        <PalaceSilhouette className="host-catalog-ledger__palace" aria-hidden />

        <div className="host-catalog-toolbar">
          <p className="host-catalog-info">
            <Info className="host-catalog-info__icon" aria-hidden />
            <span>Draft properties, finish details, and submit for Royal Passage review.</span>
          </p>
          <Link to="/homestay/properties/new" className="host-catalog-cta">
            <Plus className="host-catalog-cta__icon" aria-hidden />
            Add property
          </Link>
        </div>

        {pageLoading ? (
          <p className="host-catalog-state">Loading properties…</p>
        ) : pageError ? (
          <p className="host-catalog-error">{pageError}</p>
        ) : homestays.length === 0 ? (
          <div className="host-catalog-empty">
            <span className="host-catalog-empty__medallion" aria-hidden>
              <Plus className="host-catalog-empty__icon" />
            </span>
            <p className="host-catalog-empty__text">No properties yet.</p>
            <Link to="/homestay/properties/new" className="host-catalog-cta">
              <Plus className="host-catalog-cta__icon" aria-hidden />
              Add your first property
            </Link>
          </div>
        ) : (
          <>
            <OwnerHomestayTable homestays={homestays} />
            <OrnamentalDivider className="host-catalog-ledger__footer" />
          </>
        )}
      </section>
    </HomestayOwnerDashboardShell>
  );
}
