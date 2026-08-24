import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, MapPin, Pencil, Settings2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { OfferPrice } from "@/components/pricing/OfferPrice";
import { SetOfferDialog } from "@/components/pricing/SetOfferDialog";
import { CornerFiligree, OrnamentalDivider } from "@/components/site/RoyalHeritageDecor";
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

function PanelCorners() {
  return (
    <>
      <CornerFiligree className="host-offers-ledger__corner host-offers-ledger__corner--tl" />
      <CornerFiligree className="host-offers-ledger__corner host-offers-ledger__corner--tr" />
      <CornerFiligree className="host-offers-ledger__corner host-offers-ledger__corner--bl" />
      <CornerFiligree className="host-offers-ledger__corner host-offers-ledger__corner--br" />
    </>
  );
}

function ExperienceMedallion({ title, image }: { title: string; image: string | null }) {
  if (image) {
    return (
      <span className="host-offers-medallion host-offers-medallion--photo" aria-hidden>
        <img src={image} alt="" />
      </span>
    );
  }
  return (
    <span className="host-offers-medallion" aria-hidden>
      {title.trim().charAt(0).toUpperCase() || "E"}
    </span>
  );
}

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
      variant="offers"
    >
      <section className="host-offers-ledger">
        <PanelCorners />

        <p className="host-offers-info">
          <Info className="host-offers-info__icon" aria-hidden />
          <span>
            Use Set offer to configure prices, then turn each experience&apos;s offer on or off with the
            toggle below.
          </span>
        </p>

        {pageLoading ? (
          <p className="host-offers-state">Loading offers…</p>
        ) : pageError ? (
          <p className="host-offers-error">{pageError}</p>
        ) : experiences.length === 0 ? (
          <div className="host-offers-empty">
            <p className="host-offers-state">No experiences yet.</p>
            <Link to="/host/experiences/new" className="host-offers-empty__cta">
              Add experience
            </Link>
          </div>
        ) : (
          <>
            <div className="host-offers-table-wrap" role="region" aria-label="Offers">
              <table className="host-offers-table">
                <thead>
                  <tr>
                    <th scope="col">Experience</th>
                    <th scope="col">Guest price</th>
                    <th scope="col">Offer</th>
                    <th scope="col">Status</th>
                    <th scope="col">Edit</th>
                    <th scope="col">Offer on/off</th>
                  </tr>
                </thead>
                <tbody>
                  {experiences.map((exp) => {
                    const hasOffer =
                      exp.compareAtPricePerPersonMinor != null &&
                      exp.compareAtPricePerPersonMinor > exp.pricePerPersonMinor;
                    const isToggling = togglingOfferId === exp.id;
                    return (
                      <tr key={exp.id}>
                        <td>
                          <div className="host-offers-experience">
                            <ExperienceMedallion title={exp.title} image={exp.image} />
                            <div className="host-offers-experience__copy">
                              <span className="host-offers-experience__title">{exp.title}</span>
                              {exp.city ? (
                                <span className="host-offers-experience__city">
                                  <MapPin className="host-offers-experience__pin" aria-hidden />
                                  {exp.city}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td>
                          <OfferPrice
                            price={exp.pricePerPersonMinor}
                            compareAt={exp.compareAtPricePerPersonMinor}
                            currencySymbol={exp.currencySymbol}
                            asMinor
                            tone="light"
                            showPercent={false}
                            className="host-offers-price"
                            priceClassName="host-offers-price__sell"
                            compareClassName="host-offers-price__was"
                          />
                        </td>
                        <td>
                          {hasOffer ? (
                            <span className="host-offers-flag host-offers-flag--active">Active</span>
                          ) : (
                            <span className="host-offers-flag">None</span>
                          )}
                        </td>
                        <td>
                          <ExperienceStatusBadge status={exp.status} surface="light" />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="host-offers-btn"
                            onClick={() => setOfferTarget(exp)}
                          >
                            {hasOffer ? (
                              <Pencil className="host-offers-btn__icon" aria-hidden />
                            ) : (
                              <Settings2 className="host-offers-btn__icon" aria-hidden />
                            )}
                            {hasOffer ? "Edit offer" : "Set offer"}
                          </button>
                        </td>
                        <td>
                          <div className="host-offers-toggle">
                            <Switch
                              checked={hasOffer}
                              disabled={isToggling || offerSaving}
                              onCheckedChange={(checked) => void handleOfferToggle(exp, checked)}
                              aria-label={`${hasOffer ? "Turn off" : "Turn on"} offer for ${exp.title}`}
                              className="host-offers-switch"
                            />
                            <span className="host-offers-toggle__label">
                              {isToggling ? "Saving…" : hasOffer ? "On" : "Off"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="host-offers-cards">
              {experiences.map((exp) => {
                const hasOffer =
                  exp.compareAtPricePerPersonMinor != null &&
                  exp.compareAtPricePerPersonMinor > exp.pricePerPersonMinor;
                const isToggling = togglingOfferId === exp.id;
                return (
                  <li key={exp.id} className="host-offers-card">
                    <div className="host-offers-experience">
                      <ExperienceMedallion title={exp.title} image={exp.image} />
                      <div className="host-offers-experience__copy">
                        <span className="host-offers-experience__title">{exp.title}</span>
                        {exp.city ? (
                          <span className="host-offers-experience__city">
                            <MapPin className="host-offers-experience__pin" aria-hidden />
                            {exp.city}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="host-offers-card__row">
                      <span className="host-offers-card__label">Guest price</span>
                      <OfferPrice
                        price={exp.pricePerPersonMinor}
                        compareAt={exp.compareAtPricePerPersonMinor}
                        currencySymbol={exp.currencySymbol}
                        asMinor
                        tone="light"
                        showPercent={false}
                        className="host-offers-price"
                        priceClassName="host-offers-price__sell"
                        compareClassName="host-offers-price__was"
                      />
                    </div>

                    <div className="host-offers-card__row">
                      <span className="host-offers-card__label">Offer</span>
                      {hasOffer ? (
                        <span className="host-offers-flag host-offers-flag--active">Active</span>
                      ) : (
                        <span className="host-offers-flag">None</span>
                      )}
                    </div>

                    <div className="host-offers-card__row">
                      <span className="host-offers-card__label">Status</span>
                      <ExperienceStatusBadge status={exp.status} surface="light" />
                    </div>

                    <div className="host-offers-card__actions">
                      <button
                        type="button"
                        className="host-offers-btn"
                        onClick={() => setOfferTarget(exp)}
                      >
                        {hasOffer ? (
                          <Pencil className="host-offers-btn__icon" aria-hidden />
                        ) : (
                          <Settings2 className="host-offers-btn__icon" aria-hidden />
                        )}
                        {hasOffer ? "Edit offer" : "Set offer"}
                      </button>
                      <div className="host-offers-toggle">
                        <Switch
                          checked={hasOffer}
                          disabled={isToggling || offerSaving}
                          onCheckedChange={(checked) => void handleOfferToggle(exp, checked)}
                          aria-label={`${hasOffer ? "Turn off" : "Turn on"} offer for ${exp.title}`}
                          className="host-offers-switch"
                        />
                        <span className="host-offers-toggle__label">
                          {isToggling ? "Saving…" : hasOffer ? "On" : "Off"}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <OrnamentalDivider className="host-offers-ledger__footer" />
          </>
        )}
      </section>

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
