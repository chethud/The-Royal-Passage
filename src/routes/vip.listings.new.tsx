import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { VipOwnerDashboardShell } from "@/components/vip-owner/VipOwnerDashboardShell";
import { OwnerVipPackageForm } from "@/components/vip-owner/OwnerVipPackageForm";
import { fetchCities } from "@/lib/api/cities";
import { createOwnerVipPackage } from "@/lib/api/owner-vip-packages";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import type { CitySummary } from "@/lib/cities";
import { useVipOwnerAccess } from "@/lib/use-vip-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/vip/listings/new")({
  head: () => ({
    meta: [{ title: "Add VIP package — The Royal Passage" }],
  }),
  component: VipOwnerNewPackagePage,
});

function VipOwnerNewPackagePage() {
  const navigate = useNavigate();
  const { accessToken, ready, loading } = useVipOwnerAccess();
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCities = useCallback(async () => {
    setCitiesLoading(true);
    try {
      setCities(await fetchCities());
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load cities."));
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    void loadCities();
  }, [loadCities, ready]);

  const handleSubmit = async (
    payload: Parameters<React.ComponentProps<typeof OwnerVipPackageForm>["onSubmit"]>[0],
  ) => {
    if (!accessToken) return;
    setSaving(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const created = await createOwnerVipPackage(accessToken, payload);
      void navigate({
        to: "/vip/listings/$packageId",
        params: { packageId: created.id },
      });
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to create package."));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !ready || !accessToken) {
    return (
      <VipOwnerDashboardShell
        title="Add package"
        subtitle="Describe your VIP package, inclusions, duration, and starting price."
        showRoleDescription={false}
      >
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body text-sm">Loading form…</p>
        </LuxuryCheckoutPanel>
      </VipOwnerDashboardShell>
    );
  }

  return (
    <VipOwnerDashboardShell
      title="Add package"
      subtitle="Describe your VIP package, inclusions, duration, and starting price."
      showRoleDescription={false}
    >
      <LuxuryCheckoutPanel>
        {pageError ? (
          <p className="mb-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        ) : null}
        {citiesLoading ? (
          <p className="luxury-panel-body text-sm">Loading form…</p>
        ) : (
          <OwnerVipPackageForm cities={cities} saving={saving} onSubmit={handleSubmit} />
        )}
      </LuxuryCheckoutPanel>
    </VipOwnerDashboardShell>
  );
}
