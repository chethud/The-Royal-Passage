import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { ExperienceBookingPanel } from "@/components/booking/ExperienceBookingPanel";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { ExperienceDetailGallery } from "@/components/experiences/ExperienceDetailGallery";
import { ExperienceReviewsSection } from "@/components/reviews/ExperienceReviewsSection";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import type { Slot } from "@/data/experiences";
import { useAuthUser } from "@/lib/auth-user";
import { guestBookingLimits } from "@/lib/booking-url";
import { filterSlotsWithinBookingWindow } from "@/lib/booking-window";
import { useBookingClock } from "@/hooks/use-today-iso-date";
import { getExperienceForDetail } from "@/lib/marketplace-fns";
import { getExperienceReviews } from "@/lib/review-fns";
import { categoryIconForLabel } from "@/lib/experience-category-icons";
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
      <p className="text-sm text-ink/90">{error.message}</p>
    </div>
  ),
  component: ExperienceDetail,
});

function ExperienceDetailList({
  label,
  items,
  emptyMessage = "Your host will confirm full details when you book.",
}: {
  label: string;
  items: string[];
  emptyMessage?: string;
}) {
  return (
    <div>
      <div className="eyebrow luxury-panel-label mb-4">{label}</div>
      {items.length === 0 ? (
        <p className="luxury-panel-body text-sm">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item} className="luxury-panel-body flex gap-3 text-sm leading-relaxed">
              <span className="text-[#8B6914]">—</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
  const CategoryIcon = categoryIconForLabel(exp.category);

  return (
    <div className="experience-detail-page min-h-screen pt-[var(--header-height)] text-ink">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <section className="container-page pt-8 pb-14">
        <Link
          to="/experiences"
          search={{}}
          className="inline-flex text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:text-ink"
        >
          ← Back to library
        </Link>

        <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-start md:gap-8 lg:gap-10">
          <div className="w-full md:sticky md:top-[calc(var(--header-height)+1.5rem)] md:self-start">
            <ExperienceDetailGallery exp={exp} />
          </div>

          <div className="flex w-full min-w-0 flex-col space-y-6 md:pt-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold">
                <CategoryIcon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                {exp.category}
              </div>

              {locationLine || exp.address || exp.mapLink ? (
                <div className="flex items-start gap-2 text-sm text-brand-cotton/90">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                  <div>
                    {locationLine ? <div>{locationLine}</div> : null}
                    {exp.address ? (
                      <div className="mt-0.5 text-brand-cotton/75">{exp.address}</div>
                    ) : null}
                    {exp.mapLink ? (
                      <a
                        href={exp.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold transition-colors hover:text-ink"
                      >
                        <Navigation className="h-3.5 w-3.5" aria-hidden />
                        Get directions
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex items-start justify-between gap-4">
                <h1 className="font-display text-3xl uppercase leading-[1.08] tracking-[0.04em] text-ink sm:text-4xl md:text-[2.65rem]">
                  {exp.title}
                </h1>
                <div className="flex shrink-0 items-center gap-2 pt-1">
                  <AddToCartButton
                    exp={exp}
                    showLabel
                    className="border-[rgb(201_162_39/0.45)] bg-[rgb(0_0_0/0.25)] text-ink hover:border-gold"
                  />
                  <WishlistButton
                    experienceId={exp.id}
                    className="border-[rgb(201_162_39/0.45)] bg-[rgb(0_0_0/0.25)] text-ink hover:border-gold"
                  />
                </div>
              </div>

              {exp.tagline ? (
                <p className="mt-4 font-display text-base italic leading-relaxed text-brand-cotton/90 sm:text-lg">
                  {exp.tagline}
                </p>
              ) : null}

              <div className="my-7 h-px bg-gradient-to-r from-transparent via-[rgb(201_162_39/0.35)] to-transparent" />

              <dl className="grid grid-cols-3 divide-x divide-[rgb(201_162_39/0.28)] text-center sm:text-left">
                <div className="px-2 first:pl-0 sm:px-5">
                  <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold/85">
                    Duration
                  </dt>
                  <dd className="mt-1.5 font-display text-xl uppercase tracking-[0.02em] text-ink">
                    {exp.durationHours}h
                  </dd>
                </div>
                <div className="px-2 sm:px-5">
                  <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold/85">
                    From
                  </dt>
                  <dd className="mt-1.5 font-display text-xl uppercase tracking-[0.02em] text-ink">
                    {sym}
                    {exp.pricePerPerson}
                  </dd>
                </div>
                <div className="px-2 last:pr-0 sm:px-5">
                  <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold/85">
                    Rating
                  </dt>
                  <dd className="mt-1.5 font-display text-xl text-gold">
                    ★ {exp.rating}
                    <span className="ml-1 text-xs text-brand-cotton/75">({exp.reviewsCount})</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-8 space-y-6">
                <div>
                  <div className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold/85">
                    About this experience
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-brand-cotton/92 whitespace-pre-line sm:text-[0.9375rem]">
                    {exp.description}
                  </p>
                </div>

                <div>
                  <div className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold/85">
                    Hosted by
                  </div>
                  <div className="mt-2 font-display text-lg uppercase tracking-[0.04em] text-ink">
                    {exp.hostName}
                  </div>
                  {exp.hostBio ? (
                    <p className="mt-2 text-sm leading-relaxed text-brand-cotton/85">{exp.hostBio}</p>
                  ) : null}
                </div>

                {canBook ? (
                  <a
                    href="#book"
                    className="luxury-btn-sm luxury-btn-primary inline-flex w-fit items-center no-underline"
                  >
                    Check availability
                  </a>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-1">
              <LuxuryCheckoutPanel>
                <ExperienceDetailList label="What's included" items={exp.inclusions} />
              </LuxuryCheckoutPanel>
              <LuxuryCheckoutPanel>
                <ExperienceDetailList
                  label="Not included"
                  items={exp.exclusions ?? []}
                  emptyMessage="All essentials are covered in this experience."
                />
              </LuxuryCheckoutPanel>
            </div>

            {(exp.requirements?.length ?? 0) > 0 ? (
              <LuxuryCheckoutPanel>
                <ExperienceDetailList
                  label="What to bring & know"
                  items={exp.requirements ?? []}
                />
              </LuxuryCheckoutPanel>
            ) : null}

            <LuxuryCheckoutPanel>
              <div className="eyebrow luxury-panel-label mb-3">Cancellation policy</div>
              <p className="luxury-panel-body max-w-3xl text-sm leading-relaxed sm:text-base">
                {exp.cancellation?.trim() ||
                  "Standard cancellation terms apply. Your host will confirm the full policy in your booking confirmation."}
              </p>
            </LuxuryCheckoutPanel>

            <LuxuryCheckoutPanel>
              <div className="eyebrow luxury-panel-label mb-3">Guest voices</div>
              <h2 className="luxury-panel-heading font-display text-2xl uppercase tracking-[0.03em] sm:text-3xl">
                What travellers <em className="italic normal-case text-[#8B6914]">remember</em>
              </h2>
              <div className="mt-8">
                <ExperienceReviewsSection reviews={reviews} surface="light" />
              </div>
            </LuxuryCheckoutPanel>

            {canBook ? (
              <section id="book" className="border-t border-[rgb(201_162_39/0.18)] pt-8">
                <LuxuryCheckoutPanel>
                  <div className="mb-8">
                    <div className="eyebrow luxury-panel-label mb-3">Reserve your seats</div>
                    <h2 className="luxury-panel-heading font-display text-3xl uppercase leading-tight tracking-[0.03em] sm:text-4xl">
                      Choose a date.
                      <br />
                      <em className="italic normal-case text-[#8B6914]">Hold your moment.</em>
                    </h2>
                    <p className="luxury-panel-body mt-4 max-w-xl text-sm leading-relaxed">
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
              </section>
            ) : (
              <LuxuryCheckoutPanel className="text-center sm:text-left">
                <p className="luxury-panel-heading font-display text-2xl uppercase tracking-[0.03em]">
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
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
