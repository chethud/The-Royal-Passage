import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CreateExperienceWizard } from "@/components/experience/CreateExperienceWizard";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { createHostExperience, createHostSlot } from "@/lib/api/host-experiences";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import {
  getCachedHostFormReferenceData,
  loadHostFormReferenceData,
} from "@/lib/host-form-data";
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
  const initialData = getCachedHostFormReferenceData();
  const [categories, setCategories] = useState(initialData.categories);
  const [cities, setCities] = useState(initialData.cities);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refreshFormData = useCallback(async () => {
    if (!accessToken) return;
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const data = await loadHostFormReferenceData(accessToken);
      setCategories(data.categories);
      setCities(data.cities);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to refresh form data."));
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void refreshFormData();
  }, [ready, refreshFormData]);

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
    return (
      <HostDashboardShell
        title="New experience"
        subtitle="Step through basics, pricing, photos, bookable slots, and submit for Royal Passage review."
      >
        <p className="text-sm text-muted-foreground">Preparing your workspace…</p>
      </HostDashboardShell>
    );
  }

  return (
    <HostDashboardShell
      title="New experience"
      subtitle="Step through basics, pricing, photos, bookable slots, and submit for Royal Passage review."
    >
      {pageError ? (
        <p className="mb-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : null}
      <CreateExperienceWizard
        categories={categories}
        cities={cities}
        saving={saving}
        onSubmit={(payload) => void handleSubmit(payload)}
      />
    </HostDashboardShell>
  );
}
