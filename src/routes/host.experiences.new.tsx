import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HostExperienceForm } from "@/components/experience/HostExperienceForm";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { listCities, type CitySummary } from "@/lib/city-fns";
import {
  createHostExperienceFn,
  getHostCategories,
  type CategoryOption,
} from "@/lib/host-experience-fns";
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
      const [rows, cityRows] = await Promise.all([
        getHostCategories({ data: { accessToken } }),
        listCities(),
      ]);
      setCategories(rows);
      setCities(cityRows);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to load categories.");
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
      const created = await createHostExperienceFn({
        data: { accessToken, ...payload },
      });
      void navigate({
        to: "/host/experiences/$experienceId",
        params: { experienceId: created.id },
      });
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to create experience.");
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
      {categories.length > 0 && cities.length > 0 ? (
        <HostExperienceForm
          categories={categories}
          cities={cities}
          saving={saving}
          onSubmit={(payload) => void handleSubmit(payload)}
        />
      ) : null}
    </HostDashboardShell>
  );
}
