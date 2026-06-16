import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { OwnerHomestayForm } from "@/components/homestay-owner/OwnerHomestayForm";
import { fetchCities } from "@/lib/api/cities";
import { createOwnerHomestay } from "@/lib/api/owner-homestays";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import type { CitySummary } from "@/lib/cities";
import { useHomestayOwnerAccess } from "@/lib/use-homestay-owner-access";

export const Route = createFileRoute("/homestay/properties/new")({
  head: () => ({
    meta: [{ title: "New property — The Royal Passage" }],
  }),
  component: OwnerNewHomestayPage,
});

function OwnerNewHomestayPage() {
  const navigate = useNavigate();
  const { accessToken, ready, loading } = useHomestayOwnerAccess();
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCities = useCallback(async () => {
    try {
      setCities(await fetchCities());
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load cities."));
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    void loadCities();
  }, [loadCities, ready]);

  const handleSubmit = async (payload: Parameters<React.ComponentProps<typeof OwnerHomestayForm>["onSubmit"]>[0]) => {
    if (!accessToken) return;
    setSaving(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const created = await createOwnerHomestay(accessToken, payload);
      void navigate({
        to: "/homestay/properties/$homestayId",
        params: { homestayId: created.id },
      });
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to create property."));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !ready || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <HomestayOwnerDashboardShell
      title="New property"
      subtitle="Add basics and pricing, then add rooms and calendar rules on the next screen."
      showRoleDescription={false}
    >
      <LuxuryCheckoutPanel>
        {pageError ? (
          <p className="mb-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        ) : null}
        <OwnerHomestayForm cities={cities} saving={saving} onSubmit={handleSubmit} />
      </LuxuryCheckoutPanel>
    </HomestayOwnerDashboardShell>
  );
}
