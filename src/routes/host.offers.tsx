import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { OfferPrice } from "@/components/pricing/OfferPrice";
import {
  DashboardTable,
  DashboardTableBody,
  DashboardTableCell,
  DashboardTableHead,
  DashboardTableHeadCell,
  DashboardTableHeadRow,
  DashboardTableRow,
  DashboardTableScroll,
} from "@/components/ui/DashboardTable";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";
import { fetchHostExperiences, type HostExperienceSummary } from "@/lib/api/host-experiences";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHostAccess } from "@/lib/use-host-access";

export const Route = createFileRoute("/host/offers")({
  head: () => ({
    meta: [
      { title: "Offers — The Royal Passage" },
      {
        name: "description",
        content: "Set original (was) prices so guests see strike-through discounts on your experiences.",
      },
    ],
  }),
  component: HostOffersPage,
});

function HostOffersPage() {
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
      setExperiences(await fetchHostExperiences(accessToken));
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load offers."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <HostDashboardShell
      title="Offers"
      subtitle="Set an original (was) price higher than your selling price. Guests see the discount; they still pay the selling price."
      showRoleDescription={false}
    >
      <LuxuryCheckoutPanel>
        <p className="luxury-panel-body text-sm">
          Edit any experience to add or clear an offer. Leave the original price blank for no strike-through.
        </p>

        <div className="mt-6">
          {pageLoading ? (
            <p className="luxury-panel-body py-8 text-sm">Loading offers…</p>
          ) : pageError ? (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {pageError}
            </p>
          ) : experiences.length === 0 ? (
            <div className="py-4 text-center">
              <p className="luxury-panel-body text-sm">No experiences yet.</p>
              <Link
                to="/host/experiences/new"
                className="luxury-btn-sm luxury-btn-primary mt-4 inline-flex no-underline"
              >
                Add experience
              </Link>
            </div>
          ) : (
            <DashboardTableScroll>
              <DashboardTable minWidth="md">
                <DashboardTableHead>
                  <DashboardTableHeadRow>
                    <DashboardTableHeadCell>Experience</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Guest price</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Offer</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Status</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Edit</DashboardTableHeadCell>
                  </DashboardTableHeadRow>
                </DashboardTableHead>
                <DashboardTableBody>
                  {experiences.map((exp) => {
                    const hasOffer =
                      exp.compareAtPricePerPersonMinor != null &&
                      exp.compareAtPricePerPersonMinor > exp.pricePerPersonMinor;
                    return (
                      <DashboardTableRow key={exp.id}>
                        <DashboardTableCell variant="heading">
                          <div className="font-display text-lg">{exp.title}</div>
                          <div className="luxury-panel-body text-xs">{exp.city}</div>
                        </DashboardTableCell>
                        <DashboardTableCell>
                          <OfferPrice
                            price={exp.pricePerPersonMinor}
                            compareAt={exp.compareAtPricePerPersonMinor}
                            currencySymbol={exp.currencySymbol}
                            asMinor
                            tone="light"
                            showPercent={false}
                          />
                        </DashboardTableCell>
                        <DashboardTableCell>
                          {hasOffer ? (
                            <span className="text-sm font-medium text-[#8B1E1E]">Active</span>
                          ) : (
                            <span className="luxury-panel-body text-sm">None</span>
                          )}
                        </DashboardTableCell>
                        <DashboardTableCell>
                          <ExperienceStatusBadge status={exp.status} surface="light" />
                        </DashboardTableCell>
                        <DashboardTableCell>
                          <Link
                            to="/host/experiences/$experienceId"
                            params={{ experienceId: exp.id }}
                            search={{ section: "details" }}
                            className="luxury-btn-sm luxury-btn-primary inline-flex items-center no-underline"
                          >
                            {hasOffer ? "Edit offer" : "Set offer"}
                          </Link>
                        </DashboardTableCell>
                      </DashboardTableRow>
                    );
                  })}
                </DashboardTableBody>
              </DashboardTable>
            </DashboardTableScroll>
          )}
        </div>
      </LuxuryCheckoutPanel>
    </HostDashboardShell>
  );
}
