import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HostExperienceTable } from "@/components/experience/HostExperienceTable";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { fetchHostExperiences, type HostExperienceSummary } from "@/lib/api/host-experiences";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHostAccess } from "@/lib/use-host-access";

export const Route = createFileRoute("/host/experiences")({
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
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <HostDashboardShell
      title="My experiences"
      subtitle="Create listings, manage slots, and submit for admin review."
    >
      <div className="mb-6 flex justify-end">
        <Link
          to="/host/experiences/new"
          className="rounded-sm bg-ember px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)]"
        >
          New experience
        </Link>
      </div>

      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading experiences…</p>
      ) : pageError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : experiences.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No experiences yet. Create your first listing to start accepting bookings.
        </p>
      ) : (
        <HostExperienceTable experiences={experiences} />
      )}
    </HostDashboardShell>
  );
}
