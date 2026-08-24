import { createFileRoute } from "@tanstack/react-router";
import { Info, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { HostExperienceTable } from "@/components/experience/HostExperienceTable";
import { CreateExperienceCta } from "@/components/host/CreateExperienceCta";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import {
  CornerFiligree,
  OrnamentalDivider,
  PalaceSilhouette,
} from "@/components/site/RoyalHeritageDecor";
import { fetchHostExperiences, type HostExperienceSummary } from "@/lib/api/host-experiences";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHostAccess } from "@/lib/use-host-access";

export const Route = createFileRoute("/host/experiences/")({
  head: () => ({
    meta: [{ title: "My experiences — The Royal Passage" }],
  }),
  component: HostExperiencesPage,
});

function PanelCorners() {
  return (
    <>
      <CornerFiligree className="host-catalog-ledger__corner host-catalog-ledger__corner--tl" />
      <CornerFiligree className="host-catalog-ledger__corner host-catalog-ledger__corner--tr" />
      <CornerFiligree className="host-catalog-ledger__corner host-catalog-ledger__corner--bl" />
      <CornerFiligree className="host-catalog-ledger__corner host-catalog-ledger__corner--br" />
    </>
  );
}

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
        subtitle="Create listings, edit details, manage slots, and submit for admin review."
        showRoleDescription={false}
        variant="experiences"
      >
        <section className="host-catalog-ledger">
          <PanelCorners />
          <p className="host-catalog-state">Loading your experiences…</p>
        </section>
      </HostDashboardShell>
    );
  }

  return (
    <HostDashboardShell
      title="My experiences"
      subtitle="Create listings, edit details, manage slots, and submit for admin review."
      showRoleDescription={false}
      variant="experiences"
    >
      <section className="host-catalog-ledger">
        <PanelCorners />
        <PalaceSilhouette className="host-catalog-ledger__palace" aria-hidden />

        <div className="host-catalog-toolbar">
          <p className="host-catalog-info">
            <Info className="host-catalog-info__icon" aria-hidden />
            <span>
              Draft listings, edit published experiences, add slots, and submit for Royal Passage
              review.
            </span>
          </p>
          <CreateExperienceCta variant="inline" tone="royal" />
        </div>

        {pageLoading ? (
          <p className="host-catalog-state">Loading experiences…</p>
        ) : pageError ? (
          <p className="host-catalog-error">{pageError}</p>
        ) : experiences.length === 0 ? (
          <div className="host-catalog-empty">
            <span className="host-catalog-empty__medallion" aria-hidden>
              <Plus className="host-catalog-empty__icon" />
            </span>
            <p className="host-catalog-empty__text">No experiences yet.</p>
            <CreateExperienceCta variant="inline" tone="royal" />
          </div>
        ) : (
          <>
            <HostExperienceTable experiences={experiences} />
            <OrnamentalDivider className="host-catalog-ledger__footer" />
          </>
        )}
      </section>
    </HostDashboardShell>
  );
}
