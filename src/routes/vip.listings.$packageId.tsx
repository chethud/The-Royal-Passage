import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { OwnerVipPackageForm } from "@/components/vip-owner/OwnerVipPackageForm";
import { loadCitiesWithFallback } from "@/lib/city-fns";
import {
  fetchOwnerVipPackage,
  updateOwnerVipPackage,
  type OwnerVipPackageDetail,
} from "@/lib/api/owner-vip-packages";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import type { CitySummary } from "@/lib/cities";
import { useVipOwnerAccess } from "@/lib/use-vip-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/vip/listings/$packageId")({
  head: () => ({
    meta: [{ title: "Manage VIP package — The Royal Passage" }],
  }),
  component: VipOwnerPackageDetailPage,
});

function VipOwnerPackageDetailPage() {
  const { packageId } = Route.useParams();
  const { accessToken, ready, loading } = useVipOwnerAccess();
  const [pkg, setPkg] = useState<OwnerVipPackageDetail | null>(null);
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const [detail, cityRows] = await Promise.all([
        fetchOwnerVipPackage(accessToken, packageId),
        loadCitiesWithFallback(),
      ]);
      setPkg(detail);
      setCities(cityRows);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load package."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken, packageId]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  const readOnly = pkg?.status === "published" || pkg?.status === "pending_review";

  const handleSave = async (
    payload: Parameters<React.ComponentProps<typeof OwnerVipPackageForm>["onSubmit"]>[0],
  ) => {
    if (!accessToken) return;
    setSaving(true);
    setPageError(null);
    try {
      const updated = await updateOwnerVipPackage(accessToken, packageId, payload);
      setPkg(updated);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to save package."));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <VipOwnerDashboardShell
      title={pkg?.title ?? "Manage package"}
      subtitle="Update inclusions, pricing, and photos. Submit for review when ready."
      showRoleDescription={false}
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link to="/vip/listings" className="luxury-btn-sm luxury-btn-panel-outline no-underline">
          Back to packages
        </Link>
        {pkg ? <ExperienceStatusBadge status={pkg.status} surface="light" /> : null}
      </div>

      <LuxuryCheckoutPanel>
        {pageLoading ? (
          <p className="luxury-panel-body py-8 text-sm">Loading package…</p>
        ) : pageError && !pkg ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        ) : pkg ? (
          <>
            {pageError ? (
              <p className="mb-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {pageError}
              </p>
            ) : null}
            {readOnly ? (
              <p className="mb-4 rounded-sm border border-ember/25 bg-ember/8 px-4 py-3 text-sm text-ink/90">
                {pkg.status === "published"
                  ? "This package is published. Contact Royal Passage admin to make changes."
                  : "This package is awaiting admin review."}
              </p>
            ) : null}
            <OwnerVipPackageForm
              cities={cities}
              initial={pkg}
              disabled={readOnly}
              saving={saving}
              onSubmit={handleSave}
            />
          </>
        ) : null}
      </LuxuryCheckoutPanel>
    </VipOwnerDashboardShell>
  );
}
