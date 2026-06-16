import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
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
import { hasBookableSlot } from "@/lib/experience-filters";
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

function ExperienceDetailList({
  label,
  items,
  emptyMessage,
}: {
  label: string;
  items: string[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div>
        <div className="eyebrow luxury-panel-label mb-4">{label}</div>
        <p className="luxury-panel-body text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="eyebrow luxury-panel-label mb-4">{label}</div>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="luxury-panel-body flex gap-3 text-sm leading-relaxed">
            <span className="text-[#8B6914]">—</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExperienceDetail() {
  const { exp, reviews } = Route.useLoaderData();
  const { user, role } = useAuthUser();
  const sym = exp.currencySymbol ?? "€";
  const firstAvailable = exp.slots.find((s) => s.available > 0) ?? null;
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
  const canBook = hasBookableSlot(exp);

  return (
    <div className="experience-detail-page min-h-screen pt-[var(--header-height)] text-[#F7F1E8]">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <section className="container-page pt-8 pb-6">
        <Link
          to="/experiences"
          search={{}}
          className="inline-flex text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A] transition-colors hover:text-[#F7F1E8]"
        >
          ← Back to library
        </Link>
      </section>

      <section className="container-page grid gap-10 pb-14 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <ExperienceDetailGallery exp={exp} />
        </div>

        <div className="md:col-span-5 md:pt-2">
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="border border-[rgb(200_162_90/0.45)] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#F7F1E8]">
              {exp.category}
            </span>
            {exp.verifiedHost ? (
              <span className="bg-[#F7F1E8] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#4A0000]">
                Verified host
              </span>
            ) : null}
          </div>

          {locationLine || exp.address ? (
            <div className="flex items-start gap-2 text-sm text-[#D6C8B5]/90">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF6A]" aria-hidden />
              <div>
                {locationLine ? <div>{locationLine}</div> : null}
                {exp.address ? (
                  <div className="mt-0.5 text-[#D6C8B5]/75">{exp.address}</div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl uppercase leading-[1.08] tracking-[0.04em] text-[#F7F1E8] sm:text-4xl md:text-[2.65rem]">
              {exp.title}
            </h1>
            <div className="flex shrink-0 items-center gap-2 pt-1">
              <AddToCartButton
                exp={exp}
                showLabel
                className="border-[rgb(200_162_90/0.45)] bg-[rgb(0_0_0/0.25)] text-[#F7F1E8] hover:border-[#D4AF6A]"
              />
              <WishlistButton
                experienceId={exp.id}
                className="border-[rgb(200_162_90/0.45)] bg-[rgb(0_0_0/0.25)] text-[#F7F1E8] hover:border-[#D4AF6A]"
              />
            </div>
          </div>

          {exp.tagline ? (
            <p className="mt-4 font-display text-base italic leading-relaxed text-[#D6C8B5]/90 sm:text-lg">
              {exp.tagline}
            </p>
          ) : null}

          <div className="my-7 h-px bg-gradient-to-r from-transparent via-[rgb(200_162_90/0.35)] to-transparent" />

          <dl className="grid grid-cols-3 divide-x divide-[rgb(200_162_90/0.28)] text-center sm:text-left">
            <div className="px-2 first:pl-0 sm:px-5">
              <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A]/85">
                Duration
              </dt>
              <dd className="mt-1.5 font-display text-xl uppercase tracking-[0.02em] text-[#F7F1E8]">
                {exp.durationHours}h
              </dd>
            </div>
            <div className="px-2 sm:px-5">
              <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A]/85">
                From
              </dt>
              <dd className="mt-1.5 font-display text-xl uppercase tracking-[0.02em] text-[#F7F1E8]">
                {sym}
                {exp.pricePerPerson}
              </dd>
            </div>
            <div className="px-2 last:pr-0 sm:px-5">
              <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A]/85">
                Rating
              </dt>
              <dd className="mt-1.5 font-display text-xl text-[#D4AF6A]">
                ★ {exp.rating}
                <span className="ml-1 text-xs text-[#D6C8B5]/75">({exp.reviewsCount})</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="container-page space-y-6 pb-10">
        <LuxuryCheckoutPanel>
          <div className="eyebrow luxury-panel-label mb-3">About this experience</div>
          <p className="luxury-panel-body text-sm leading-relaxed whitespace-pre-line sm:text-base">
            {exp.description}
          </p>

          <div className="my-7 h-px luxury-panel-divider-bg" />

          <div className="eyebrow luxury-panel-label mb-2">Hosted by</div>
          <div className="luxury-panel-heading font-display text-xl uppercase tracking-[0.04em]">
            {exp.hostName}
          </div>
          {exp.hostBio ? (
            <p className="luxury-panel-body mt-2 text-sm leading-relaxed">{exp.hostBio}</p>
          ) : null}
        </LuxuryCheckoutPanel>

        <div className="grid gap-6 md:grid-cols-2">
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
            {exp.cancellation}
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
      </section>

      {canBook ? (
        <section id="book" className="border-t border-[rgb(200_162_90/0.18)] pb-16 pt-4">
          <div className="container-page py-8 sm:py-10">
            <LuxuryCheckoutPanel>
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-5">
                  <div className="eyebrow luxury-panel-label mb-3">Reserve your seats</div>
                  <h2 className="luxury-panel-heading font-display text-3xl uppercase leading-tight tracking-[0.03em] sm:text-4xl">
                    Choose a date.
                    <br />
                    <em className="italic normal-case text-[#8B6914]">Hold your moment.</em>
                  </h2>
                  <p className="luxury-panel-body mt-5 max-w-sm text-sm leading-relaxed">
                    Seats are released on a first-come basis and held for 10 minutes during
                    checkout to ensure no one is double-booked.
                  </p>
                </div>

                <div className="lg:col-span-7">
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
                </div>
              </div>
            </LuxuryCheckoutPanel>
          </div>
        </section>
      ) : (
        <section className="container-page pb-16 pt-2">
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
        </section>
      )}

      <Footer />
    </div>
  );
}
