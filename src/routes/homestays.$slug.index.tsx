import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { BedDouble, Star, Users } from "lucide-react";
import { ExperienceDetailGallery } from "@/components/experiences/ExperienceDetailGallery";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { HomestayBookingPanel } from "@/components/homestays/HomestayBookingPanel";
import {
  DetailGalleryAboutRow,
  DetailExpandableCopy,
} from "@/components/detail/DetailExpandableCopy";
import {
  DetailCategoryBadge,
  DetailDarkSection,
  DetailDivider,
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

        <div className="mt-6 space-y-6 sm:mt-8">
          <div>
            <DetailCategoryBadge>{stay.propertyType}</DetailCategoryBadge>

            <div className="mt-3">
              <DetailLocationBlock
                locationLine={locationLine}
                address={stay.address}
                mapLink={stay.mapLink}
              />
            </div>

            <div className="mt-4">
              <DetailTitleRow title={stay.title} />
            </div>

            {stay.tagline ? <DetailTagline>{stay.tagline}</DetailTagline> : null}

            <DetailDivider />

            <DetailStatGrid>
              <DetailStatItem
                label="From"
                valueClassName="mt-1 space-y-1 text-[#F7F1E8] normal-case tracking-normal"
              >
                <HomestayRateStat
                  symbol={sym}
                  weekday={weekdayPriceMajor(stay)}
                  weekend={weekendPriceMajor(stay)}
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
          </div>

          <DetailGalleryAboutRow
            gallery={<ExperienceDetailGallery exp={galleryExp} maxThumbnails={6} />}
            about={
              <DetailExpandableCopy label="About this stay">{stay.description}</DetailExpandableCopy>
            }
          />

          {stay.amenities.length > 0 ? (
            <DetailDarkSection label="Amenities" className="">
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
        </div>
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

function HomestayRateStat({
  symbol,
  weekday,
  weekend,
}: {
  symbol: string;
  weekday: number;
  weekend: number;
}) {
  const weekdayLabel = `${symbol}${weekday.toLocaleString("en-IN")}`;
  const weekendLabel = `${symbol}${weekend.toLocaleString("en-IN")}`;

  if (weekday === weekend) {
    return (
      <p className="font-display text-[0.95rem] uppercase leading-none tracking-[0.02em] sm:text-lg md:text-xl">
        {weekdayLabel}
        <span className="ml-1.5 text-[0.58rem] font-sans font-semibold normal-case tracking-[0.14em] text-[#D6C8B5]/75 sm:text-[0.62rem]">
          / night
        </span>
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="whitespace-nowrap font-display text-[0.95rem] uppercase leading-none tracking-[0.02em] sm:text-lg md:text-xl">
        {weekdayLabel}
        <span className="ml-1.5 text-[0.58rem] font-sans font-semibold normal-case tracking-[0.14em] text-[#D6C8B5]/75 sm:text-[0.62rem]">
          weekdays
        </span>
      </p>
      <p className="whitespace-nowrap font-display text-[0.95rem] uppercase leading-none tracking-[0.02em] sm:text-lg md:text-xl">
        {weekendLabel}
        <span className="ml-1.5 text-[0.58rem] font-sans font-semibold normal-case tracking-[0.14em] text-[#D6C8B5]/75 sm:text-[0.62rem]">
          weekends
        </span>
      </p>
    </div>
  );
}
