import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
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
import { fetchOwnerHomestays, type OwnerHomestaySummary } from "@/lib/api/owner-homestays";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHomestayOwnerAccess } from "@/lib/use-homestay-owner-access";

export const Route = createFileRoute("/homestay/offers")({
  head: () => ({
    meta: [
      { title: "Offers — The Royal Passage" },
      {
        name: "description",
        content: "Set original (was) rates so guests see strike-through discounts on your properties.",
      },
    ],
  }),
  component: HomestayOwnerOffersPage,
});

function HomestayOwnerOffersPage() {
  const { accessToken, ready, loading } = useHomestayOwnerAccess();
  const [homestays, setHomestays] = useState<OwnerHomestaySummary[]>([]);
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
      setHomestays(await fetchOwnerHomestays(accessToken));
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
    <HomestayOwnerDashboardShell
      title="Offers"
      subtitle="Set weekday or weekend original (was) rates higher than selling rates. Guests see the discount; they still pay the selling rate."
      showRoleDescription={false}
    >
      <LuxuryCheckoutPanel>
        <p className="luxury-panel-body text-sm">
          Edit any property to add or clear an offer. Leave original prices blank for no strike-through.
        </p>

        <div className="mt-6">
          {pageLoading ? (
            <p className="luxury-panel-body py-8 text-sm">Loading offers…</p>
          ) : pageError ? (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {pageError}
            </p>
          ) : homestays.length === 0 ? (
            <div className="py-4 text-center">
              <p className="luxury-panel-body text-sm">No properties yet.</p>
              <Link
                to="/homestay/properties/new"
                className="luxury-btn-sm luxury-btn-primary mt-4 inline-flex no-underline"
              >
                Add property
              </Link>
            </div>
          ) : (
            <DashboardTableScroll>
              <DashboardTable minWidth="lg">
                <DashboardTableHead>
                  <DashboardTableHeadRow>
                    <DashboardTableHeadCell>Property</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Weekday</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Weekend</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Offer</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Status</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Edit</DashboardTableHeadCell>
                  </DashboardTableHeadRow>
                </DashboardTableHead>
                <DashboardTableBody>
                  {homestays.map((stay) => {
                    const weekend =
                      stay.weekendPricePerNightMinor ?? stay.pricePerNightMinor;
                    const weekdayOffer =
                      stay.compareAtPricePerNightMinor != null &&
                      stay.compareAtPricePerNightMinor > stay.pricePerNightMinor;
                    const weekendOffer =
                      stay.compareAtWeekendPricePerNightMinor != null &&
                      stay.compareAtWeekendPricePerNightMinor > weekend;
                    const hasOffer = weekdayOffer || weekendOffer;
                    return (
                      <DashboardTableRow key={stay.id}>
                        <DashboardTableCell variant="heading">
                          <div className="font-display text-lg">{stay.title}</div>
                          <div className="luxury-panel-body text-xs">{stay.city}</div>
                        </DashboardTableCell>
                        <DashboardTableCell>
                          <OfferPrice
                            price={stay.pricePerNightMinor}
                            compareAt={stay.compareAtPricePerNightMinor}
                            currencySymbol={stay.currencySymbol}
                            asMinor
                            tone="light"
                            showPercent={false}
                          />
                        </DashboardTableCell>
                        <DashboardTableCell>
                          <OfferPrice
                            price={weekend}
                            compareAt={stay.compareAtWeekendPricePerNightMinor}
                            currencySymbol={stay.currencySymbol}
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
                          <ExperienceStatusBadge status={stay.status} surface="light" />
                        </DashboardTableCell>
                        <DashboardTableCell>
                          <Link
                            to="/homestay/properties/$homestayId"
                            params={{ homestayId: stay.id }}
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
    </HomestayOwnerDashboardShell>
  );
}
