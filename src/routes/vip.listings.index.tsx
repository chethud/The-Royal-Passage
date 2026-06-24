import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { OwnerVipPackageTable } from "@/components/vip-owner/OwnerVipPackageTable";
import { fetchOwnerVipPackages, type OwnerVipPackageSummary } from "@/lib/api/owner-vip-packages";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useVipOwnerAccess } from "@/lib/use-vip-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/vip/listings/")({
  head: () => ({
    meta: [{ title: "My VIP packages — The Royal Passage" }],
  }),
  component: VipOwnerPackagesPage,
});

function VipOwnerPackagesPage() {
  const { accessToken, ready, loading } = useVipOwnerAccess();
  const [packages, setPackages] = useState<OwnerVipPackageSummary[]>([]);
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
      setPackages(await fetchOwnerVipPackages(accessToken));
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load packages."));
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
    <VipOwnerDashboardShell
      title="My packages"
      subtitle="Create curated VIP packages and set concierge notes for Royal Passage guests."
      showRoleDescription={false}
    >
      <LuxuryCheckoutPanel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="luxury-panel-body text-sm">
            Draft packages, define inclusions and pricing, and submit for admin review.
          </p>
          <Link to="/vip/listings/new" className="luxury-btn-sm luxury-btn-primary inline-flex no-underline">
            Add package
          </Link>
        </div>
        <div className="mt-6">
          {pageLoading ? (
            <p className="luxury-panel-body py-8 text-sm">Loading packages…</p>
          ) : pageError ? (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {pageError}
            </p>
          ) : packages.length === 0 ? (
            <div className="py-4 text-center">
              <p className="luxury-panel-body text-sm">No packages yet.</p>
              <Link
                to="/vip/listings/new"
                className="luxury-btn-sm luxury-btn-primary mt-4 inline-flex no-underline"
              >
                Add your first package
              </Link>
            </div>
          ) : (
            <OwnerVipPackageTable packages={packages} />
          )}
        </div>
      </LuxuryCheckoutPanel>
    </VipOwnerDashboardShell>
  );
}
