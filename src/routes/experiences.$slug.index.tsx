import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExperienceBookingPanel } from "@/components/booking/ExperienceBookingPanel";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { DetailListPanel } from "@/components/detail/DetailListPanel";
import {
  DetailBookingSection,
  DetailDarkSection,
  DetailDivider,
  DetailHeroGrid,
  DetailLocationBlock,
  DetailMainSection,
  DetailPageShell,
  DetailBackLink,
  DetailStatGrid,
  DetailStatItem,
  DetailTagline,
  DetailTitleRow,
} from "@/components/detail/DetailPageLayout";
import { ExperienceDetailGallery } from "@/components/experiences/ExperienceDetailGallery";
import { ExperienceReviewsSection } from "@/components/reviews/ExperienceReviewsSection";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { Slot } from "@/data/experiences";
import { useAuthUser } from "@/lib/auth-user";
import { guestBookingLimits } from "@/lib/booking-url";
import { filterSlotsWithinBookingWindow } from "@/lib/booking-window";
import { useBookingClock } from "@/hooks/use-today-iso-date";
import { getExperienceForDetail } from "@/lib/marketplace-fns";
import { getExperienceReviews } from "@/lib/review-fns";
import { buildExperienceJsonLd, SITE_URL } from "@/lib/seo";
import { canonicalLink } from "@/lib/seo-helpers";

export const Route = createFileRoute("/experiences/$slug/")({
  loader: async ({ params }) => {
    const [row, reviews] = await Promise.all([
      getExperienceForDetail({ data: { slug: params.slug } }),
      getExperienceReviews({ data: { slug: params.slug } }),
    ]);
    if (!row) throw notFound();
    return { ...row, reviews };
  },
  head: ({ loaderData, params }) => {
    const exp = loaderData?.exp;
    if (!exp) return { meta: [{ title: "Experience — The Royal Passage" }] };
    const pageUrl = `${SITE_URL}/experiences/${params.slug}`;
    return {
      meta: [
        { title: `${exp.title} — The Royal Passage` },
        { name: "description", content: exp.tagline || exp.description.slice(0, 160) },
        { property: "og:title", content: exp.title },
        { property: "og:description", content: exp.tagline || exp.description.slice(0, 160) },
        { property: "og:image", content: exp.image },
        { property: "og:type", content: "product" },
        { property: "og:url", content: pageUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: exp.title },
        { name: "twitter:description", content: exp.tagline || exp.description.slice(0, 160) },
        { name: "twitter:image", content: exp.image },
      ],
      links: [canonicalLink(`/experiences/${params.slug}`, SITE_URL)],
    };
  },
  notFoundComponent: () => (
    <div className="experience-detail-page flex min-h-screen items-center justify-center px-4 py-16">
      <LuxuryCheckoutPanel className="max-w-md text-center">
        <p className="eyebrow luxury-panel-label mb-4">The library</p>
        <h1 className="luxury-panel-heading font-display text-3xl tracking-tight md:text-4xl">
          This experience has retired.
        </h1>
        <Link
          to="/experiences"
          className="luxury-panel-link mt-8 inline-flex text-sm underline-offset-4 hover:underline"
        >
          Browse the library →
        </Link>
      </LuxuryCheckoutPanel>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="experience-detail-page flex min-h-screen items-center justify-center p-6">
      <p className="text-sm text-[#F7F1E8]/90">{error.message}</p>
    </div>
  ),
  component: ExperienceDetail,
});

function ExperienceDetail() {
  const { exp, reviews } = Route.useLoaderData();
  const { user, role } = useAuthUser();
  const { today, now } = useBookingClock();
  const bookableSlots = useMemo(
    () => filterSlotsWithinBookingWindow(exp.slots, today, now),
    [exp.slots, today, now],
  );
  const sym = exp.currencySymbol ?? "€";
  const firstAvailable = bookableSlots.find((s) => s.available > 0) ?? null;
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(firstAvailable);
  const [guests, setGuests] = useState(() => {
    if (!firstAvailable) return 1;
    const { min } = guestBookingLimits(exp, firstAvailable.available);
    return Math.max(min, Math.min(2, firstAvailable.available));
  });

  useEffect(() => {
    if (!selectedSlot) return;
    const { min, max } = guestBookingLimits(exp, selectedSlot.available);
    setGuests((g) => Math.min(Math.max(min, g), max));
  }, [exp, selectedSlot]);

  const ldJson = buildExperienceJsonLd(exp, reviews);
  const locationLine = [exp.region, exp.city].filter(Boolean).join(" · ");
  const canBook = bookableSlots.some((slot) => slot.available > 0);

  return (
    <DetailPageShell jsonLd={ldJson}>
      <DetailMainSection>
        <DetailBackLink to="/experiences" search={{}}>
          ← Back to library
        </DetailBackLink>

        <DetailHeroGrid
          galleryWide
          gallery={<ExperienceDetailGallery exp={exp} showTitleOnHover />}
          content={
            <>
              <div>
                <DetailTitleRow
                  title={exp.title}
                  actions={
                    <>
                      <AddToCartButton
                        exp={exp}
                        className="border-[rgb(200_162_90/0.45)] bg-[rgb(0_0_0/0.25)] text-[#F7F1E8] hover:border-[#D4AF6A]"
                      />
                      <WishlistButton
                        experienceId={exp.id}
                        className="border-[rgb(200_162_90/0.45)] bg-[rgb(0_0_0/0.25)] text-[#F7F1E8] hover:border-[#D4AF6A]"
                      />
                    </>
                  }
                />

                {exp.tagline ? <DetailTagline>{exp.tagline}</DetailTagline> : null}

                <DetailDivider />

                <DetailStatGrid>
                  <DetailStatItem label="Duration">{exp.durationHours}h</DetailStatItem>
                  <DetailStatItem label="From">
                    {sym}
                    {exp.pricePerPerson}
                  </DetailStatItem>
                  <DetailStatItem label="Rating">
                    <span className="text-[#D4AF6A]">
                      ★ {exp.rating}
                      <span className="ml-1 text-xs text-[#D6C8B5]/75">({exp.reviewsCount})</span>
                    </span>
                  </DetailStatItem>
                </DetailStatGrid>

                {canBook ? (
                  <a
                    href="#book"
                    className="luxury-btn-sm luxury-btn-primary mt-5 inline-flex w-fit items-center no-underline sm:mt-6"
                  >
                    Buy now
                  </a>
                ) : null}

                <div className="mt-5 space-y-5 sm:mt-8 sm:space-y-6">
                  <DetailDarkSection label="About this experience" className="">
                    <p className="text-sm leading-relaxed text-[#D6C8B5]/92 whitespace-pre-line sm:text-[0.9375rem]">
                      {exp.description}
                    </p>
                  </DetailDarkSection>

                  <DetailDarkSection label="Hosted by" className="">
                    <div className="font-display text-base uppercase tracking-[0.04em] text-[#F7F1E8] sm:text-lg">
                      {exp.hostName}
                    </div>
                    {exp.hostBio ? (
                      <p className="mt-2 text-sm leading-relaxed text-[#D6C8B5]/85">{exp.hostBio}</p>
                    ) : null}
                  </DetailDarkSection>

                  <DetailLocationBlock
                    locationLine={locationLine}
                    address={exp.address}
                    mapLink={exp.mapLink}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-1">
                <DetailListPanel label="What's included" items={exp.inclusions} />
                <DetailListPanel
                  label="Not included"
                  items={exp.exclusions ?? []}
                  emptyMessage="All essentials are covered in this experience."
                />
              </div>

              {(exp.requirements?.length ?? 0) > 0 ? (
                <DetailListPanel label="What to bring & know" items={exp.requirements ?? []} />
              ) : null}

              <LuxuryCheckoutPanel>
                <h2 className="eyebrow luxury-panel-label mb-2 sm:mb-3">Guest voices</h2>
                <h2 className="luxury-panel-heading font-display text-xl uppercase tracking-[0.03em] sm:text-2xl md:text-3xl">
                  What travellers <em className="italic normal-case text-[#8B6914]">remember</em>
                </h2>
                <div className="mt-5 sm:mt-8">
                  <ExperienceReviewsSection reviews={reviews} surface="light" />
                </div>
              </LuxuryCheckoutPanel>

              {canBook ? (
                <DetailBookingSection>
                  <LuxuryCheckoutPanel>
                    <div className="mb-5 sm:mb-8">
                      <div className="eyebrow luxury-panel-label mb-2 sm:mb-3">Reserve your seats</div>
                      <h2 className="luxury-panel-heading font-display text-2xl uppercase leading-tight tracking-[0.03em] sm:text-3xl md:text-4xl">
                        Choose a date.
                        <br />
                        <em className="italic normal-case text-[#8B6914]">Hold your moment.</em>
                      </h2>
                      <p className="luxury-panel-body mt-3 max-w-xl text-sm leading-relaxed sm:mt-4">
                        Seats are released on a first-come basis and held for 10 minutes during
                        checkout to ensure no one is double-booked.
                      </p>
                    </div>

                    <ExperienceBookingPanel
                      exp={exp}
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
                      guests={guests}
                      onGuestsChange={setGuests}
                      variant="select"
                      signedIn={Boolean(user)}
                      userRole={user ? (role ?? "guest") : null}
                      surface="light"
                    />
                  </LuxuryCheckoutPanel>
                </DetailBookingSection>
              ) : (
                <LuxuryCheckoutPanel className="text-center sm:text-left">
                  <p className="luxury-panel-heading font-display text-xl uppercase tracking-[0.03em] sm:text-2xl">
                    Booking opens soon
                  </p>
                  <p className="luxury-panel-body mt-2 max-w-md text-sm">
                    There are no available sessions in the next 7 days. Check back later or browse other
                    experiences.
                  </p>
                  <Link
                    to="/experiences"
                    search={{}}
                    className="luxury-btn-sm luxury-btn-panel-outline mt-6 inline-flex items-center no-underline"
                  >
                    Browse the library →
                  </Link>
                </LuxuryCheckoutPanel>
              )}
            </>
          }
        />
      </DetailMainSection>
    </DetailPageShell>
  );
}
