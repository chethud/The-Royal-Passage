import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PayAtVenueBadge } from "@/components/booking/PayAtVenueBadge";
import { ExperienceReviewsSection } from "@/components/reviews/ExperienceReviewsSection";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import type { Slot } from "@/data/experiences";
import { formatDateLong } from "@/lib/date-format";
import { getExperienceForDetail } from "@/lib/marketplace-fns";
import { getExperienceReviews } from "@/lib/review-fns";
import { buildExperienceJsonLd, SITE_URL } from "@/lib/seo";
import { canonicalLink } from "@/lib/seo-helpers";

export const Route = createFileRoute("/experiences/$slug")({
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
  const sym = exp.currencySymbol ?? "€";
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(
    exp.slots.find((s) => s.available > 0) ?? null,
  );
  const [guests, setGuests] = useState(2);

  const total = selectedSlot ? exp.pricePerPerson * guests : 0;
  const ldJson = buildExperienceJsonLd(exp, reviews);

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      {/* HERO */}
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

      {/* INCLUSIONS + POLICY */}
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

      {/* REVIEWS */}
      <section className="container-page py-12 sm:py-16">
        <div className="eyebrow mb-3">Guest voices</div>
        <h2 className="font-display text-3xl sm:text-4xl">
          What travellers <em className="italic text-ember">remember</em>
        </h2>
        <div className="mt-8">
          <ExperienceReviewsSection reviews={reviews} />
        </div>
      </section>

      {/* BOOKING */}
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
            <div className="glass rounded-md border border-[oklch(0.88_0.08_86_/_0.2)] p-6 md:p-8">
              <div className="eyebrow mb-3">Available slots</div>
              <div className="space-y-2">
                {exp.slots.map((s) => {
                  const sold = s.available === 0;
                  const active = selectedSlot?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={sold}
                      aria-pressed={active}
                      onClick={() => setSelectedSlot(s)}
                      className={`flex w-full items-center justify-between border p-4 text-left transition-all ${
                        active
                          ? "border-ember bg-ember/15 text-foreground shadow-[var(--shadow-gold)]"
                          : sold
                            ? "cursor-not-allowed border-[oklch(0.72_0.09_78_/_0.12)] opacity-40"
                            : "border-[oklch(0.72_0.09_78_/_0.22)] hover:border-ember/45"
                      }`}
                    >
                      <div>
                        <div className="font-display text-lg">{formatDateLong(s.date)}</div>
                        <div className="text-xs opacity-70 mt-0.5">
                          {s.start}–{s.end}
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        {sold ? (
                          <span className="eyebrow">Sold out</span>
                        ) : (
                          <>
                            <div className="eyebrow opacity-70">Seats</div>
                            <div className="font-display text-lg">
                              {s.available}/{s.capacity}
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="hairline my-6" />

              <div className="flex items-center justify-between">
                <div className="eyebrow">Guests</div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Decrease guest count"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="h-9 w-9 border border-[oklch(0.88_0.08_86_/_0.2)] transition-colors hover:border-ember/50"
                  >
                    −
                  </button>
                  <span className="font-display text-xl w-6 text-center">{guests}</span>
                  <button
                    type="button"
                    aria-label="Increase guest count"
                    onClick={() =>
                      setGuests((g) => Math.min(selectedSlot?.available ?? 1, g + 1))
                    }
                    className="h-9 w-9 border border-[oklch(0.88_0.08_86_/_0.2)] transition-colors hover:border-ember/50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="hairline my-6" />

              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <div className="eyebrow text-muted-foreground">Estimated total</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {sym}
                    {exp.pricePerPerson} × {guests} guest{guests > 1 ? "s" : ""}
                  </div>
                </div>
                <div className="font-display text-3xl">
                  {sym}
                  {total}
                </div>
              </div>

              <div className="mb-5">
                <PayAtVenueBadge />
              </div>

              {selectedSlot ? (
                <Link
                  to="/experiences/$slug/book"
                  params={{ slug: exp.slug }}
                  search={{
                    slotId: selectedSlot.id,
                    guests,
                  }}
                  className="flex w-full items-center justify-center rounded-sm bg-ember py-4 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110"
                >
                  Continue to book
                </Link>
              ) : (
                <span className="flex w-full cursor-not-allowed items-center justify-center rounded-sm bg-ember/50 py-4 text-sm font-medium text-primary-foreground opacity-60">
                  Select a slot
                </span>
              )}
              <p className="text-[0.65rem] text-muted-foreground text-center mt-3">
                Sign in required · Pay at venue on arrival · Host confirms your booking
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

