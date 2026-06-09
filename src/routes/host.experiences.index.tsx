import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HostExperienceTable } from "@/components/experience/HostExperienceTable";
import { CreateExperienceCta } from "@/components/host/CreateExperienceCta";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { fetchHostExperiences, type HostExperienceSummary } from "@/lib/api/host-experiences";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHostAccess } from "@/lib/use-host-access";

export const Route = createFileRoute("/host/experiences/")({
  head: () => ({
    meta: [{ title: "My experiences — The Royal Passage" }],
  }),
  component: HostExperiencesPage,
});

function HostExperiencesPage() {
  const { accessToken, ready, loading } = useHostAccess();
  const [experiences, setExperiences] = useState<HostExperienceSummary[]>([]);
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
      const rows = await fetchHostExperiences(accessToken);
      setExperiences(rows);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load experiences."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  if (loading || !ready) {
    return (
      <HostDashboardShell
        title="My experiences"
        subtitle="Create listings, manage slots, and submit for admin review."
      >
        <p className="text-sm text-muted-foreground">Loading your experiences…</p>
      </HostDashboardShell>
    );
  }

  return (
    <HostDashboardShell
      title="My experiences"
      subtitle="Create listings, manage slots, and submit for admin review."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Draft listings, add slots, and submit for Royal Passage review.
        </p>
        <CreateExperienceCta variant="inline" />
      </div>

      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading experiences…</p>
      ) : pageError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : experiences.length === 0 ? (
        <CreateExperienceCta />
      ) : (
        <HostExperienceTable experiences={experiences} />
      )}
    </HostDashboardShell>
  );
}
