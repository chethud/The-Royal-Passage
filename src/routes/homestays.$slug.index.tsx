import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { BedDouble, Star, Users } from "lucide-react";
import { ExperienceDetailGallery } from "@/components/experiences/ExperienceDetailGallery";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { HomestayBookingPanel } from "@/components/homestays/HomestayBookingPanel";
import { DetailExpandableCopy } from "@/components/detail/DetailExpandableCopy";
import {
  DetailCategoryBadge,
  DetailDarkSection,
  DetailDivider,
  DetailHeroGrid,
  DetailHomestayBookingSection,
  DetailLocationBlock,
  DetailMainSection,
  DetailPageShell,
  DetailBackLink,
  DetailStatGrid,
  DetailStatItem,
  DetailTagline,
  DetailTitleRow,
} from "@/components/detail/DetailPageLayout";
import type { Experience } from "@/data/experiences";
import { useAuthUser } from "@/lib/auth-user";
import {
  bookHomestayPath,
  buildHomestayBookSearch,
  parseHomestayBookSearch,
} from "@/lib/homestay-booking-url";
import {
  weekdayPriceMajor,
  weekendPriceMajor,
} from "@/lib/homestay-day-pricing";
import { HomestayOfferRates } from "@/components/pricing/OfferPrice";
import { getHomestayForDetail } from "@/lib/homestay-fns";
import { SITE_URL } from "@/lib/seo";
import { canonicalLink } from "@/lib/seo-helpers";
import { isGuestAccount } from "@/lib/roles";
import { useHomestayCheckout } from "@/hooks/use-homestay-checkout";

export const Route = createFileRoute("/homestays/$slug/")({
  validateSearch: parseHomestayBookSearch,
  loader: async ({ params }) => {
    const row = await getHomestayForDetail({ data: { slug: params.slug } });
    if (!row) throw notFound();
    return row;
  },
  head: ({ loaderData, params }) => {
    const stay = loaderData?.homestay;
    if (!stay) return { meta: [{ title: "Homestay — The Royal Passage" }] };
    const pageUrl = `${SITE_URL}/homestays/${params.slug}`;
    return {
      meta: [
        { title: `${stay.title} — The Royal Passage` },
        { name: "description", content: stay.tagline || stay.description.slice(0, 160) },
        { property: "og:title", content: stay.title },
        { property: "og:description", content: stay.tagline || stay.description.slice(0, 160) },
        { property: "og:image", content: stay.image },
        { property: "og:type", content: "website" },
        { property: "og:url", content: pageUrl },
      ],
      links: [canonicalLink(`/homestays/${params.slug}`, SITE_URL)],
    };
  },
  component: HomestayDetailPage,
});

function HomestayDetailPage() {
  const { homestay: stay, source } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, role } = useAuthUser();
  const checkout = useHomestayCheckout(stay, {
    initialCheckIn: search.checkIn,
    initialCheckOut: search.checkOut,
    initialGuests: search.guests,
    initialRoomId: search.roomId,
    initialRoomCount: search.roomCount,
    initialExtraBeds: search.extraBeds,
  });
  const sym = stay.currencySymbol ?? "₹";
  const locationLine = [stay.region, stay.city].filter(Boolean).join(" · ");
  const bookable = source === "live" && !stay.id.startsWith("stay-");
  const galleryExp = {
    slug: stay.slug,
    title: stay.title,
    category: stay.propertyType,
    image: stay.image,
    galleryUrls: stay.galleryUrls,
  } as Pick<Experience, "slug" | "title" | "category" | "image" | "galleryUrls"> as Experience;

  const bookSearch = buildHomestayBookSearch({
    checkIn: checkout.checkIn,
    checkOut: checkout.checkOut,
    guests: checkout.guests,
    roomId: checkout.roomId,
    roomCount: checkout.roomCount,
    extraBeds: checkout.extraBedCount,
  });
  const bookPath = bookHomestayPath(stay.slug, bookSearch);
  const canContinue = bookable && checkout.nights >= 1;

  const continueToBook = () => {
    void navigate({
      to: "/homestays/$slug/book",
      params: { slug: stay.slug },
      search: bookSearch,
    });
  };

  return (
    <DetailPageShell>
      <DetailMainSection>
        <DetailBackLink
          to="/homestays/browse"
          search={{
            checkIn: checkout.checkIn,
            checkOut: checkout.checkOut,
            guests: checkout.guests,
          }}
        >
          ← Back to all stays
        </DetailBackLink>

        <DetailHeroGrid
          gallery={<ExperienceDetailGallery exp={galleryExp} maxThumbnails={6} />}
          contentClassName="flex w-full min-w-0 flex-col gap-2 md:pt-0"
          content={
            <>
              <DetailCategoryBadge>{stay.propertyType}</DetailCategoryBadge>

              <div className="space-y-1">
                <DetailTitleRow title={stay.title} />
                {stay.tagline ? <DetailTagline className="!mt-0">{stay.tagline}</DetailTagline> : null}
              </div>

              <div className="space-y-2.5">
                <DetailDivider className="!my-0" />
                <DetailStatGrid>
                  <DetailStatItem
                    label="From"
                    valueClassName="mt-1 space-y-0.5 text-[#F7F1E8] normal-case tracking-normal"
                  >
                    <HomestayOfferRates
                      symbol={sym}
                      weekday={weekdayPriceMajor(stay)}
                      weekend={weekendPriceMajor(stay)}
                      compareAtWeekday={stay.compareAtPricePerNight}
                      compareAtWeekend={stay.compareAtWeekendPricePerNight}
                      tone="dark"
                      priceClassName="font-display text-[0.95rem] uppercase tracking-[0.02em] sm:text-lg md:text-xl text-[#F7F1E8] font-normal"
                    />
                  </DetailStatItem>
                  <DetailStatItem label="Beds">
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="h-5 w-5 shrink-0 text-[#D4AF6A]" aria-hidden />
                      {stay.bedrooms}
                    </span>
                  </DetailStatItem>
                  <DetailStatItem label="Rating">
                    <span className="inline-flex items-center gap-1 text-[#D4AF6A]">
                      <Star className="h-4 w-4 shrink-0 fill-current" aria-hidden />
                      {stay.rating}
                    </span>
                  </DetailStatItem>
                </DetailStatGrid>
                <DetailDivider className="!my-0" />
              </div>

              <div className="space-y-2">
                <DetailExpandableCopy label="About this stay">{stay.description}</DetailExpandableCopy>
                <DetailLocationBlock
                  locationLine={locationLine}
                  address={stay.address}
                  mapLink={stay.mapLink}
                />
              </div>

              {stay.amenities.length > 0 ? (
                <DetailDarkSection label="Amenities" className="!mt-0">
                  <div className="flex flex-wrap gap-2">
                    {stay.amenities.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[rgb(200_162_90/0.35)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.12em] text-[#E8DCC8]/90"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </DetailDarkSection>
              ) : null}

              <div className="flex items-center gap-2 text-sm text-[#D6C8B5]/85">
                <Users className="h-4 w-4 text-[#D4AF6A]" aria-hidden />
                Up to {stay.maxGuests} guests · {stay.bathrooms} bath
              </div>
            </>
          }
        />
      </DetailMainSection>

      <DetailHomestayBookingSection>
        <LuxuryCheckoutPanel>
          <div className="mx-auto max-w-2xl">
            <div className="mb-5 sm:mb-8">
              <div className="eyebrow luxury-panel-label mb-2 sm:mb-3">Reserve your stay</div>
              <h2 className="luxury-panel-heading font-display text-2xl uppercase leading-tight tracking-[0.03em] sm:text-3xl md:text-4xl">
                Choose your dates.
                <br />
                <em className="italic normal-case text-[#8B6914]">Rest in character.</em>
              </h2>
            </div>

            <HomestayBookingPanel
              stay={stay}
              checkIn={checkout.checkIn}
              checkOut={checkout.checkOut}
              guests={checkout.guests}
              roomId={checkout.roomId}
              roomCount={checkout.roomCount}
              extraBedCount={checkout.extraBedCount}
              maxGuests={checkout.maxGuests}
              maxRooms={checkout.maxRooms}
              maxExtraBeds={checkout.maxExtra}
              notes={checkout.notes}
              nights={checkout.nights}
              totalMinor={checkout.totalMinor}
              onCheckInChange={checkout.setCheckIn}
              onCheckOutChange={checkout.setCheckOut}
              onGuestsChange={checkout.setGuests}
              onRoomIdChange={checkout.setRoomId}
              onRoomCountChange={checkout.setRoomCount}
              onExtraBedCountChange={checkout.setExtraBedCount}
              onNotesChange={checkout.setNotes}
              hideActions
              bookable={bookable}
            />

            {bookable ? (
              !user ? (
                <Link
                  to="/sign-in"
                  search={{ redirect: bookPath }}
                  className={`luxury-btn-sm luxury-btn-primary mt-6 inline-flex w-full items-center justify-center ${
                    canContinue ? "" : "pointer-events-none opacity-50"
                  }`}
                  aria-disabled={!canContinue}
                  onClick={(event) => {
                    if (!canContinue) event.preventDefault();
                  }}
                >
                  Sign in to book
                </Link>
              ) : isGuestAccount(role) ? (
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={continueToBook}
                  className="luxury-btn-sm luxury-btn-primary mt-6 inline-flex w-full items-center justify-center disabled:opacity-50"
                >
                  Continue to book
                </button>
              ) : (
                <p className="luxury-panel-body mt-6 text-center text-sm">
                  Sign in with a guest account to book this homestay.
                </p>
              )
            ) : null}
            {bookable && !canContinue ? (
              <p className="luxury-panel-body mt-3 text-center text-xs">
                Select check-in and check-out dates to continue.
              </p>
            ) : null}
          </div>
        </LuxuryCheckoutPanel>
      </DetailHomestayBookingSection>
    </DetailPageShell>
  );
}

