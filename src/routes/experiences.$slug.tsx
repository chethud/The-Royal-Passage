import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import type { Slot } from "@/data/experiences";
import { formatDateLong, formatDateWeekdayShort } from "@/lib/date-format";
import { getExperienceForDetail } from "@/lib/marketplace-fns";

export const Route = createFileRoute("/experiences/$slug")({
  loader: async ({ params }) => {
    const row = await getExperienceForDetail({ data: { slug: params.slug } });
    if (!row) throw notFound();
    return row;
  },
  head: ({ loaderData }) => {
    const exp = loaderData?.exp;
    if (!exp) return { meta: [{ title: "Experience — The Royal Passage" }] };
    return {
      meta: [
        { title: `${exp.title} — The Royal Passage` },
        { name: "description", content: exp.tagline },
        { property: "og:title", content: exp.title },
        { property: "og:description", content: exp.tagline },
        { property: "og:image", content: exp.image },
        { property: "og:type", content: "product" },
      ],
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
  const { exp, source } = Route.useLoaderData();
  const sym = exp.currencySymbol ?? "€";
  const priceCurrency = sym === "₹" ? "INR" : "EUR";
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(
    exp.slots.find((s) => s.available > 0) ?? null,
  );
  const [guests, setGuests] = useState(2);
  const [stage, setStage] = useState<"select" | "locking" | "confirmed" | "failed">("select");

  const total = selectedSlot ? exp.pricePerPerson * guests : 0;

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: exp.title,
    description: exp.description,
    image: [exp.image],
    startDate: selectedSlot ? `${selectedSlot.date}T${selectedSlot.start}` : undefined,
    location: {
      "@type": "Place",
      name: exp.address,
      address: { "@type": "PostalAddress", addressLocality: exp.city },
    },
    organizer: { "@type": "Person", name: exp.hostName },
    offers: {
      "@type": "Offer",
      price: exp.pricePerPerson,
      priceCurrency,
      availability: exp.slots.some((s) => s.available > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: exp.rating,
      reviewCount: exp.reviewsCount,
    },
  };

  const handleBook = () => {
    if (!selectedSlot) return;
    setStage("locking");
    // simulate soft-lock + payment
    setTimeout(() => {
      // 90% success
      const ok = Math.random() > 0.1;
      setStage(ok ? "confirmed" : "failed");
    }, 1400);
  };

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
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight mt-2">
            {exp.title}
          </h1>
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
            {stage === "confirmed" ? (
              <ConfirmationCard
                exp={exp.title}
                slot={selectedSlot!}
                guests={guests}
                total={total}
                currencySymbol={sym}
              />
            ) : (
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
                      className="h-9 w-9 border border-[oklch(0.88_0.08_86_/_0.2)] transition-colors hover:border-ember/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember/60"
                    >
                      −
                    </button>
                    <span
                      className="font-display text-xl w-6 text-center"
                      aria-live="polite"
                      aria-label={`${guests} guest${guests > 1 ? "s" : ""}`}
                    >
                      {guests}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase guest count"
                      onClick={() =>
                        setGuests((g) => Math.min(selectedSlot?.available ?? 1, g + 1))
                      }
                      className="h-9 w-9 border border-[oklch(0.88_0.08_86_/_0.2)] transition-colors hover:border-ember/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember/60"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="hairline my-6" />

                <div className="flex items-baseline justify-between mb-5">
                  <div>
                    <div className="eyebrow text-muted-foreground">Total</div>
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

                {stage === "failed" && (
                  <div className="mb-4 p-3 border border-destructive/40 bg-destructive/5 text-sm text-destructive">
                    Payment failed. Your seats have been released. Please try again.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBook}
                  disabled={!selectedSlot || stage === "locking"}
                  className="w-full rounded-sm bg-ember py-4 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember/60"
                >
                  {stage === "locking"
                    ? "Holding your seats…"
                    : selectedSlot
                      ? "Reserve & pay"
                      : "Select a slot"}
                </button>
                <p className="text-[0.65rem] text-muted-foreground text-center mt-3">
                  {source === "live"
                    ? "Demo checkout UI — wire payment + confirm booking to finalize."
                    : "Demo checkout — no payment is processed."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ConfirmationCard({
  exp,
  slot,
  guests,
  total,
  currencySymbol = "€",
}: {
  exp: string;
  slot: Slot;
  guests: number;
  total: number;
  currencySymbol?: string;
}) {
  return (
    <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.25)] p-8 md:p-10">
      <div className="eyebrow text-ember mb-4">Confirmed</div>
      <h3 className="font-display text-3xl leading-tight">Your seats are held.</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        A confirmation has been sent. We look forward to hosting you.
      </p>
      <div className="hairline my-6" />
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="eyebrow text-muted-foreground">Experience</dt>
          <dd className="mt-1">{exp}</dd>
        </div>
        <div>
          <dt className="eyebrow text-muted-foreground">When</dt>
          <dd className="mt-1">
            {formatDateWeekdayShort(slot.date)}, {slot.start}
          </dd>
        </div>
        <div>
          <dt className="eyebrow text-muted-foreground">Guests</dt>
          <dd className="mt-1">{guests}</dd>
        </div>
        <div>
          <dt className="eyebrow text-muted-foreground">Paid</dt>
          <dd className="mt-1 font-display text-lg">
            {currencySymbol}
            {total}
          </dd>
        </div>
      </dl>
      <Link
        to="/experiences"
        className="mt-8 inline-flex items-center text-sm underline underline-offset-4 hover:text-ember"
      >
        Browse more experiences →
      </Link>
    </div>
  );
}
