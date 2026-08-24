import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, MapPin, Pencil, Settings2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { OfferPrice } from "@/components/pricing/OfferPrice";
import { CornerFiligree, OrnamentalDivider } from "@/components/site/RoyalHeritageDecor";
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

function PropertyMedallion({ title, image }: { title: string; image: string | null }) {
  if (image) {
    return (
      <span className="host-offers-medallion host-offers-medallion--photo" aria-hidden>
        <img src={image} alt="" />
      </span>
    );
  }
  return (
    <span className="host-offers-medallion" aria-hidden>
      {title.trim().charAt(0).toUpperCase() || "H"}
    </span>
  );
}

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
      variant="offers"
    >
      <section className="host-offers-ledger">
        <PanelCorners />

        <p className="host-offers-info">
          <Info className="host-offers-info__icon" aria-hidden />
          <span>
            Edit any property to add or clear an offer. Leave original prices blank for no
            strike-through.
          </span>
        </p>

        {pageLoading ? (
          <p className="host-offers-state">Loading offers…</p>
        ) : pageError ? (
          <p className="host-offers-error">{pageError}</p>
        ) : homestays.length === 0 ? (
          <div className="host-offers-empty">
            <p className="host-offers-state">No properties yet.</p>
            <Link to="/homestay/properties/new" className="host-offers-empty__cta">
              Add property
            </Link>
          </div>
        ) : (
          <>
            <div className="host-offers-table-wrap" role="region" aria-label="Offers">
              <table className="host-offers-table host-offers-table--homestay">
                <thead>
                  <tr>
                    <th scope="col">Property</th>
                    <th scope="col">Weekday</th>
                    <th scope="col">Weekend</th>
                    <th scope="col">Offer</th>
                    <th scope="col">Status</th>
                    <th scope="col">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {homestays.map((stay) => {
                    const weekend = stay.weekendPricePerNightMinor ?? stay.pricePerNightMinor;
                    const weekdayOffer =
                      stay.compareAtPricePerNightMinor != null &&
                      stay.compareAtPricePerNightMinor > stay.pricePerNightMinor;
                    const weekendOffer =
                      stay.compareAtWeekendPricePerNightMinor != null &&
                      stay.compareAtWeekendPricePerNightMinor > weekend;
                    const hasOffer = weekdayOffer || weekendOffer;
                    return (
                      <tr key={stay.id}>
                        <td>
                          <div className="host-offers-experience">
                            <PropertyMedallion title={stay.title} image={stay.image} />
                            <div className="host-offers-experience__copy">
                              <span className="host-offers-experience__title">{stay.title}</span>
                              {stay.city ? (
                                <span className="host-offers-experience__city">
                                  <MapPin className="host-offers-experience__pin" aria-hidden />
                                  {stay.city}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td>
                          <OfferPrice
                            price={stay.pricePerNightMinor}
                            compareAt={stay.compareAtPricePerNightMinor}
                            currencySymbol={stay.currencySymbol}
                            asMinor
                            tone="light"
                            showPercent={false}
                            className="host-offers-price"
                            priceClassName="host-offers-price__sell"
                            compareClassName="host-offers-price__was"
                          />
                        </td>
                        <td>
                          <OfferPrice
                            price={weekend}
                            compareAt={stay.compareAtWeekendPricePerNightMinor}
                            currencySymbol={stay.currencySymbol}
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
                          <ExperienceStatusBadge status={stay.status} surface="light" />
                        </td>
                        <td>
                          <Link
                            to="/homestay/properties/$homestayId"
                            params={{ homestayId: stay.id }}
                            className="host-offers-btn"
                          >
                            {hasOffer ? (
                              <Pencil className="host-offers-btn__icon" aria-hidden />
                            ) : (
                              <Settings2 className="host-offers-btn__icon" aria-hidden />
                            )}
                            {hasOffer ? "Edit offer" : "Set offer"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="host-offers-cards">
              {homestays.map((stay) => {
                const weekend = stay.weekendPricePerNightMinor ?? stay.pricePerNightMinor;
                const weekdayOffer =
                  stay.compareAtPricePerNightMinor != null &&
                  stay.compareAtPricePerNightMinor > stay.pricePerNightMinor;
                const weekendOffer =
                  stay.compareAtWeekendPricePerNightMinor != null &&
                  stay.compareAtWeekendPricePerNightMinor > weekend;
                const hasOffer = weekdayOffer || weekendOffer;
                return (
                  <li key={stay.id} className="host-offers-card">
                    <div className="host-offers-experience">
                      <PropertyMedallion title={stay.title} image={stay.image} />
                      <div className="host-offers-experience__copy">
                        <span className="host-offers-experience__title">{stay.title}</span>
                        {stay.city ? (
                          <span className="host-offers-experience__city">
                            <MapPin className="host-offers-experience__pin" aria-hidden />
                            {stay.city}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="host-offers-card__row">
                      <span className="host-offers-card__label">Weekday</span>
                      <OfferPrice
                        price={stay.pricePerNightMinor}
                        compareAt={stay.compareAtPricePerNightMinor}
                        currencySymbol={stay.currencySymbol}
                        asMinor
                        tone="light"
                        showPercent={false}
                        className="host-offers-price"
                        priceClassName="host-offers-price__sell"
                        compareClassName="host-offers-price__was"
                      />
                    </div>

                    <div className="host-offers-card__row">
                      <span className="host-offers-card__label">Weekend</span>
                      <OfferPrice
                        price={weekend}
                        compareAt={stay.compareAtWeekendPricePerNightMinor}
                        currencySymbol={stay.currencySymbol}
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
                      <ExperienceStatusBadge status={stay.status} surface="light" />
                    </div>

                    <div className="host-offers-card__actions">
                      <Link
                        to="/homestay/properties/$homestayId"
                        params={{ homestayId: stay.id }}
                        className="host-offers-btn"
                      >
                        {hasOffer ? (
                          <Pencil className="host-offers-btn__icon" aria-hidden />
                        ) : (
                          <Settings2 className="host-offers-btn__icon" aria-hidden />
                        )}
                        {hasOffer ? "Edit offer" : "Set offer"}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            <OrnamentalDivider className="host-offers-ledger__footer" />
          </>
        )}
      </section>
    </HomestayOwnerDashboardShell>
  );
}
