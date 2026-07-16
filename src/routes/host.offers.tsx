import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { OfferPrice } from "@/components/pricing/OfferPrice";
import { SetOfferDialog } from "@/components/pricing/SetOfferDialog";
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
import { Switch } from "@/components/ui/switch";
import {
  fetchHostExperiences,
  updateHostExperience,
  type HostExperienceSummary,
} from "@/lib/api/host-experiences";
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
  const [offerTarget, setOfferTarget] = useState<HostExperienceSummary | null>(null);
  const [offerSaving, setOfferSaving] = useState(false);
  const [togglingOfferId, setTogglingOfferId] = useState<string | null>(null);
  const [storedOffers, setStoredOffers] = useState<
    Record<string, { normalMinor: number; discountedMinor: number }>
  >({});

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

  const handleOfferToggle = async (exp: HostExperienceSummary, enabled: boolean) => {
    if (!accessToken || togglingOfferId) return;

    const hasOffer =
      exp.compareAtPricePerPersonMinor != null &&
      exp.compareAtPricePerPersonMinor > exp.pricePerPersonMinor;

    if (enabled) {
      if (hasOffer) return;

      const stored = storedOffers[exp.id];
      if (!stored) {
        setOfferTarget(exp);
        return;
      }

      setTogglingOfferId(exp.id);
      try {
        await updateHostExperience(accessToken, exp.id, {
          pricePerPersonMinor: stored.discountedMinor,
          compareAtPricePerPersonMinor: stored.normalMinor,
        });
        await loadPage();
      } catch (err) {
        setPageError(toErrorMessage(err, "Failed to turn offer on."));
      } finally {
        setTogglingOfferId(null);
      }
      return;
    }

    if (!hasOffer) return;

    const normalMinor = exp.compareAtPricePerPersonMinor!;
    const discountedMinor = exp.pricePerPersonMinor;

    setTogglingOfferId(exp.id);
    try {
      setStoredOffers((current) => ({
        ...current,
        [exp.id]: { normalMinor, discountedMinor },
      }));
      await updateHostExperience(accessToken, exp.id, {
        pricePerPersonMinor: normalMinor,
        compareAtPricePerPersonMinor: null,
      });
      await loadPage();
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to turn offer off."));
    } finally {
      setTogglingOfferId(null);
    }
  };

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
          Use Set offer to configure prices, then turn each experience&apos;s offer on or off with the
          toggle below.
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
                    <DashboardTableHeadCell>Offer on/off</DashboardTableHeadCell>
                  </DashboardTableHeadRow>
                </DashboardTableHead>
                <DashboardTableBody>
                  {experiences.map((exp) => {
                    const hasOffer =
                      exp.compareAtPricePerPersonMinor != null &&
                      exp.compareAtPricePerPersonMinor > exp.pricePerPersonMinor;
                    const isToggling = togglingOfferId === exp.id;
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
                          <button
                            type="button"
                            className="luxury-btn-sm luxury-btn-primary inline-flex h-7 items-center px-2.5 py-1 text-[0.58rem] leading-none"
                            onClick={() => setOfferTarget(exp)}
                          >
                            {hasOffer ? "Edit offer" : "Set offer"}
                          </button>
                        </DashboardTableCell>
                        <DashboardTableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={hasOffer}
                              disabled={isToggling || offerSaving}
                              onCheckedChange={(checked) => void handleOfferToggle(exp, checked)}
                              aria-label={`${hasOffer ? "Turn off" : "Turn on"} offer for ${exp.title}`}
                              className="data-[state=checked]:bg-[#8B1E1E] data-[state=unchecked]:bg-[rgb(74_0_0/0.18)]"
                            />
                            <span className="luxury-panel-body text-xs font-medium uppercase tracking-[0.08em]">
                              {isToggling ? "Saving…" : hasOffer ? "On" : "Off"}
                            </span>
                          </div>
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

      <SetOfferDialog
        open={offerTarget != null}
        busy={offerSaving}
        title={offerTarget ? `Set offer — ${offerTarget.title}` : "Set offer"}
        currencySymbol={offerTarget?.currencySymbol ?? "₹"}
        sellingPriceMinor={offerTarget?.pricePerPersonMinor ?? 0}
        compareAtMinor={offerTarget?.compareAtPricePerPersonMinor}
        onClose={() => {
          if (!offerSaving) setOfferTarget(null);
        }}
        onSave={async (payload) => {
          if (!accessToken || !offerTarget) return;
          setOfferSaving(true);
          try {
            await updateHostExperience(accessToken, offerTarget.id, {
              pricePerPersonMinor: payload.sellingPriceMinor,
              compareAtPricePerPersonMinor: payload.compareAtPriceMinor,
            });
            if (payload.compareAtPriceMinor != null) {
              setStoredOffers((current) => ({
                ...current,
                [offerTarget.id]: {
                  normalMinor: payload.compareAtPriceMinor,
                  discountedMinor: payload.sellingPriceMinor,
                },
              }));
            } else {
              setStoredOffers((current) => {
                const next = { ...current };
                delete next[offerTarget.id];
                return next;
              });
            }
            await loadPage();
          } finally {
            setOfferSaving(false);
          }
        }}
      />
    </HostDashboardShell>
  );
}
