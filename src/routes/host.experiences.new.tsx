import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CreateExperienceWizard } from "@/components/experience/CreateExperienceWizard";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { FALLBACK_CITIES, type CitySummary } from "@/lib/cities";
import { fetchCities } from "@/lib/api/cities";
import {
  createHostExperience,
  createHostSlot,
  fetchHostCategories,
  type CategoryOption,
} from "@/lib/api/host-experiences";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { FALLBACK_CATEGORIES } from "@/lib/experience-categories";
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

  const loadFormData = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const [categoryRows, cityRows] = await Promise.all([
        fetchHostCategories(accessToken).catch(() => FALLBACK_CATEGORIES),
        fetchCities().catch(() => FALLBACK_CITIES),
      ]);
      setCategories(categoryRows.length > 0 ? categoryRows : FALLBACK_CATEGORIES);
      setCities(cityRows.length > 0 ? cityRows : FALLBACK_CITIES);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load form data."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadFormData();
  }, [loadFormData, ready]);

  const handleSubmit = async ({
    experience,
    slots,
  }: Parameters<React.ComponentProps<typeof CreateExperienceWizard>["onSubmit"]>[0]) => {
    if (!accessToken) return;
    setSaving(true);
    setPageError(null);
    try {
      const created = await createHostExperience(accessToken, experience);
      for (const slot of slots) {
        await createHostSlot(accessToken, created.id, slot);
      }
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
      subtitle="Step through basics, pricing, photos, bookable slots, and submit for Royal Passage review."
    >
      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading form…</p>
      ) : pageError ? (
        <p className="mb-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : null}
      {!pageLoading && categories.length > 0 ? (
        <CreateExperienceWizard
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
