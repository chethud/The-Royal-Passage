import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HostExperienceForm } from "@/components/experience/HostExperienceForm";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { FALLBACK_CITIES, type CitySummary } from "@/lib/cities";
import { fetchCities } from "@/lib/api/cities";
import {
  createHostExperience,
  fetchHostCategories,
  type CategoryOption,
} from "@/lib/api/host-experiences";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHostAccess } from "@/lib/use-host-access";

export const Route = createFileRoute("/host/experiences/new")({
  head: () => ({
    meta: [{ title: "New experience — The Royal Passage" }],
  }),
  component: HostNewExperiencePage,
});

function HostNewExperiencePage() {
  const navigate = useNavigate();
  const { accessToken, ready, loading } = useHostAccess();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const [rows, cityRows] = await Promise.all([
        fetchHostCategories(accessToken),
        fetchCities().catch(() => FALLBACK_CITIES),
      ]);
      setCategories(rows);
      setCities(cityRows.length > 0 ? cityRows : FALLBACK_CITIES);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load categories."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadCategories();
  }, [loadCategories, ready]);

  const handleSubmit = async (payload: Parameters<
    React.ComponentProps<typeof HostExperienceForm>["onSubmit"]
  >[0]) => {
    if (!accessToken) return;
    setSaving(true);
    setPageError(null);
    try {
      const created = await createHostExperience(accessToken, payload);
      void navigate({
        to: "/host/experiences/$experienceId",
        params: { experienceId: created.id },
      });
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to create experience."));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !ready || !accessToken) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <HostDashboardShell
      title="New experience"
      subtitle="Draft your listing, add slots on the next screen, then submit for review."
    >
      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading form…</p>
      ) : pageError ? (
        <p className="mb-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : null}
      {categories.length > 0 ? (
        <HostExperienceForm
          categories={categories}
          cities={cities.length > 0 ? cities : FALLBACK_CITIES}
          saving={saving}
          onSubmit={(payload) => void handleSubmit(payload)}
        />
      ) : !pageLoading && !pageError ? (
        <p className="text-sm text-muted-foreground">
          Could not load experience categories. Refresh the page or contact support.
        </p>
      ) : null}
    </HostDashboardShell>
  );
}
