import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import { HostExperienceForm } from "@/components/experience/HostExperienceForm";
import { SlotManager } from "@/components/experience/SlotManager";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import type { CitySummary } from "@/lib/cities";
import { fetchCities } from "@/lib/api/cities";
import {
  createHostSlot,
  deleteHostExperience,
  deleteHostSlot,
  fetchHostCategories,
  fetchHostExperience,
  updateHostExperience,
  updateHostSlot,
  type CategoryOption,
  type HostExperienceDetail,
} from "@/lib/api/host-experiences";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { hostOperatingCities } from "@/lib/host-form-data";
import { useHostAccess } from "@/lib/use-host-access";

export const Route = createFileRoute("/host/experiences/$experienceId")({
  head: () => ({
    meta: [{ title: "Manage experience — The Royal Passage" }],
  }),
  component: HostExperienceDetailPage,
});

function HostExperienceDetailPage() {
  const { experienceId } = Route.useParams();
  const { accessToken, ready, loading } = useHostAccess();
  const [experience, setExperience] = useState<HostExperienceDetail | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slotBusy, setSlotBusy] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const [detail, cats, cityRows] = await Promise.all([
        fetchHostExperience(accessToken, experienceId),
        fetchHostCategories(accessToken),
        fetchCities(),
      ]);
      setExperience(detail);
      setCategories(cats);
      setCities(hostOperatingCities(cityRows));
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load experience."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken, experienceId]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  const handleSave = async (
    payload: Parameters<React.ComponentProps<typeof HostExperienceForm>["onSubmit"]>[0],
  ) => {
    if (!accessToken) return;
    setSaving(true);
    setPageError(null);
    setSaveSuccess(null);
    try {
      const updated = await updateHostExperience(accessToken, experienceId, payload);
      setExperience(updated);
      setSaveSuccess("Experience updated successfully.");
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to save experience."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !experience) return;
    if (!window.confirm("Archive or delete this experience?")) return;
    setSaving(true);
    try {
      await deleteHostExperience(accessToken, experienceId);
      window.location.href = "/host/experiences";
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to delete experience."));
      setSaving(false);
    }
  };

  const refreshExperience = (updated: HostExperienceDetail) => {
    setExperience(updated);
  };

  const handleAddManySlots = async (
    payloads: {
      slotDate: string;
      startTime: string;
      endTime: string;
      capacity: number;
    }[],
  ) => {
    if (!accessToken || !experience || payloads.length === 0) return;
    const existing = new Set(
      experience.slots.map((slot) => `${slot.date}|${slot.start}|${slot.end}`),
    );
    const toCreate = payloads.filter(
      (slot) => !existing.has(`${slot.slotDate}|${slot.startTime}|${slot.endTime}`),
    );
    if (toCreate.length === 0) {
      setPageError("Those weekly sessions are already on the calendar.");
      return;
    }
    setSlotBusy(true);
    setPageError(null);
    try {
      let updated = experience;
      for (const payload of toCreate) {
        updated = await createHostSlot(accessToken, experienceId, payload);
      }
      refreshExperience(updated);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to add weekly schedule."));
    } finally {
      setSlotBusy(false);
    }
  };

  const handleToggleBlock = async (slotId: string, isBlocked: boolean) => {
    if (!accessToken) return;
    setSlotBusy(true);
    try {
      const updated = await updateHostSlot(accessToken, experienceId, slotId, { isBlocked });
      refreshExperience(updated);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to update slot."));
    } finally {
      setSlotBusy(false);
    }
  };

  const handleUpdateSlot = async (
    slotId: string,
    payload: { startTime?: string; endTime?: string; capacity?: number },
  ) => {
    if (!accessToken) return;
    setSlotBusy(true);
    setPageError(null);
    try {
      const updated = await updateHostSlot(accessToken, experienceId, slotId, payload);
      refreshExperience(updated);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to update slot."));
    } finally {
      setSlotBusy(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!accessToken) return;
    setSlotBusy(true);
    try {
      const updated = await deleteHostSlot(accessToken, experienceId, slotId);
      refreshExperience(updated);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to delete slot."));
    } finally {
      setSlotBusy(false);
    }
  };

  if (loading || !ready || !accessToken || pageLoading) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  if (!experience) {
    return (
      <HostDashboardShell title="Experience" subtitle="">
        <p className="text-destructive">{pageError ?? "Experience not found."}</p>
        <Link to="/host/experiences" className="mt-4 inline-block text-ember hover:underline">
          Back to experiences
        </Link>
      </HostDashboardShell>
    );
  }

  const status = experience.status;

  return (
    <HostDashboardShell
      title={experience.title}
      subtitle="Edit listing details, photos, inclusions, and manage bookable slots."
    >
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <ExperienceStatusBadge status={experience.status} />
        <div className="flex gap-3">
          <Link
            to="/host/experiences"
            className="rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-4 py-2 text-sm hover:border-ember/50"
          >
            Back
          </Link>
          {experience.status === "published" ? (
            <Link
              to="/experiences/$slug"
              params={{ slug: experience.slug }}
              className="rounded-sm border border-ember/40 px-4 py-2 text-sm text-ember hover:bg-ember/10"
            >
              View live page
            </Link>
          ) : null}
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleDelete()}
            className="rounded-sm border border-destructive/40 px-4 py-2 text-sm text-destructive disabled:opacity-50"
          >
            Delete / archive
          </button>
        </div>
      </div>

      {pageError ? (
        <p className="mb-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : null}

      {saveSuccess ? (
        <p className="mb-6 rounded-sm border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {saveSuccess}
        </p>
      ) : null}

      {status === "pending_review" ? (
        <p className="mb-6 text-sm text-muted-foreground">
          This listing is awaiting admin review. You can still update details and slots below.
        </p>
      ) : null}

      {status === "rejected" ? (
        <p className="mb-6 rounded-sm border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          This listing was rejected. Update the details below and check “Submit for admin review” when
          saving to resubmit.
        </p>
      ) : null}

      {status === "published" ? (
        <p className="mb-6 text-sm text-muted-foreground">
          This experience is live. Changes you save here update the public listing immediately.
        </p>
      ) : null}

      <HostExperienceForm
        key={experience.updatedAt}
        categories={categories}
        cities={cities}
        initial={experience}
        saving={saving}
        onSubmit={(payload) => void handleSave(payload)}
      />

      <section className="mt-12">
        <h2 className="font-display text-2xl">Session timings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit, or block bookable sessions. Duration above applies to the overall experience;
          each slot has its own start and end time.
        </p>
        <div className="mt-6">
          <SlotManager
            slots={experience.slots}
            busy={slotBusy}
            onAddMany={(payloads) => void handleAddManySlots(payloads)}
            onUpdate={(slotId, payload) => void handleUpdateSlot(slotId, payload)}
            onToggleBlock={(slotId, isBlocked) => void handleToggleBlock(slotId, isBlocked)}
            onDelete={(slotId) => void handleDeleteSlot(slotId)}
          />
        </div>
      </section>
    </HostDashboardShell>
  );
}
