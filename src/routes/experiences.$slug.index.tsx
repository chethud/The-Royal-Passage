import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExperienceBookingPanel } from "@/components/booking/ExperienceBookingPanel";
import { ExperienceReviewsSection } from "@/components/reviews/ExperienceReviewsSection";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import type { Slot } from "@/data/experiences";
import { useAuthUser } from "@/lib/auth-user";
import { guestBookingLimits } from "@/lib/booking-url";
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="glass-strong max-w-md rounded-md px-10 py-12 text-center">
        <p className="eyebrow mb-4 text-ember/90">The library</p>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          This experience has retired.
        </h1>
        <Link
          to="/experiences"
          className="mt-8 inline-flex text-sm text-ember underline-offset-4 transition-colors hover:text-foreground"
        >
          Browse the library →
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <p className="text-sm text-destructive">{error.message}</p>
    </div>
  ),
  component: ExperienceDetail,
});

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

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <section className="container-page pt-8 pb-6">
        <Link
          to="/experiences"
          className="text-xs eyebrow text-muted-foreground hover:text-foreground"
        >
          ← Back to library
        </Link>
      </section>

      <section className="container-page grid md:grid-cols-12 gap-8 md:gap-10">
        <div className="md:col-span-7">
          <div className="aspect-[4/5] overflow-hidden rounded-md bg-muted ring-1 ring-[oklch(0.78_0.1_78_/_0.35)] ring-offset-2 ring-offset-background">
            <img
              src={exp.image}
              alt={exp.title}
              className="h-full w-full object-cover"
              width={1200}
              height={1500}
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
        <div className="md:col-span-5 md:pt-4">
          <div className="flex gap-2 mb-5">
            <span className="text-[0.65rem] eyebrow border border-[oklch(0.88_0.08_86_/_0.25)] bg-background/30 px-2.5 py-1 backdrop-blur-sm">
              {exp.category}
            </span>
            {exp.verifiedHost && (
              <span className="text-[0.65rem] eyebrow bg-foreground text-background px-2.5 py-1">
                Verified host
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {exp.city} · {exp.address}
          </div>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight">
              {exp.title}
            </h1>
            <WishlistButton experienceId={exp.id} className="shrink-0" />
          </div>
          <p className="mt-4 text-base sm:text-lg italic text-muted-foreground">{exp.tagline}</p>

          <div className="hairline my-6" />

          <dl className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="eyebrow text-muted-foreground">Duration</dt>
              <dd className="mt-1 font-display text-lg">{exp.durationHours}h</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">From</dt>
              <dd className="mt-1 font-display text-lg">
                {sym}
                {exp.pricePerPerson}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Rating</dt>
              <dd className="mt-1 font-display text-lg text-ember">
                ★ {exp.rating}
                <span className="text-xs text-muted-foreground ml-1">({exp.reviewsCount})</span>
              </dd>
            </div>
          </dl>

          <div className="hairline my-6" />

          <p className="text-sm leading-relaxed text-muted-foreground">{exp.description}</p>

          <div className="mt-6">
            <div className="eyebrow mb-2">Hosted by</div>
            <div className="font-display text-xl">{exp.hostName}</div>
            <p className="mt-1 text-sm text-muted-foreground">{exp.hostBio}</p>
          </div>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16 grid md:grid-cols-2 gap-8 md:gap-10">
        <div>
          <div className="eyebrow mb-4">What's included</div>
          <ul className="space-y-2">
            {exp.inclusions.map((i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-ember">—</span>
                {i}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">Cancellation policy</div>
          <p className="text-sm leading-relaxed text-muted-foreground">{exp.cancellation}</p>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16">
        <div className="eyebrow mb-3">Guest voices</div>
        <h2 className="font-display text-3xl sm:text-4xl">
          What travellers <em className="italic text-ember">remember</em>
        </h2>
        <div className="mt-8">
          <ExperienceReviewsSection reviews={reviews} />
        </div>
      </section>

      <section id="book" className="glass-strong border-y border-[oklch(0.88_0.08_86_/_0.1)]">
        <div className="container-page py-14 sm:py-20 grid md:grid-cols-12 gap-8 md:gap-10">
          <div className="md:col-span-5">
            <div className="eyebrow mb-3">Reserve your seats</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight">
              Choose a date.
              <br />
              <em className="italic text-ember">Hold your moment.</em>
            </h2>
            <p className="mt-5 max-w-sm text-sm text-muted-foreground">
              Seats are released on a first-come basis and held for 10 minutes during checkout to
              ensure no one is double-booked.
            </p>
          </div>

          <div className="md:col-span-7">
            <ExperienceBookingPanel
              exp={exp}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              guests={guests}
              onGuestsChange={setGuests}
              variant="select"
              signedIn={Boolean(user)}
              userRole={user ? (role ?? "guest") : null}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
