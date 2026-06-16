import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BedDouble, MapPin, Navigation, Star, Users } from "lucide-react";
import { ExperienceDetailGallery } from "@/components/experiences/ExperienceDetailGallery";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { HomestayBookingPanel } from "@/components/homestays/HomestayBookingPanel";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MarketplaceModuleNav } from "@/components/site/MarketplaceModuleNav";
import type { Experience } from "@/data/experiences";
import { useAuthUser } from "@/lib/auth-user";
import { bookHomestayPath } from "@/lib/homestay-booking-url";
import { getHomestayForDetail } from "@/lib/homestay-fns";
import { SITE_URL } from "@/lib/seo";
import { canonicalLink } from "@/lib/seo-helpers";
import { isGuestAccount } from "@/lib/roles";
import { useHomestayCheckout } from "@/hooks/use-homestay-checkout";

export const Route = createFileRoute("/homestays/$slug/")({
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
  const { user, role } = useAuthUser();
  const checkout = useHomestayCheckout(stay, {});
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

  const bookPath = bookHomestayPath(stay.slug, {
    checkIn: checkout.checkIn,
    checkOut: checkout.checkOut,
    guests: checkout.guests,
  });

  return (
    <div className="experience-detail-page min-h-screen pt-[var(--header-height)] text-[#F7F1E8]">
      <Header />
      <div className="sticky top-[var(--header-height)] z-40 border-b border-[oklch(0.72_0.09_78_/_0.15)] bg-background/95 backdrop-blur-md">
        <div className="container-page py-3">
          <MarketplaceModuleNav />
        </div>
      </div>

      <section className="container-page pt-8 pb-6">
        <Link
          to="/homestays"
          className="inline-flex text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A] transition-colors hover:text-[#F7F1E8]"
        >
          ← Back to homestays
        </Link>
      </section>

      <section className="container-page grid gap-8 pb-14 md:grid-cols-2 md:items-start md:gap-8 lg:gap-10">
        <div className="w-full md:sticky md:top-[calc(var(--header-height)+1.5rem)]">
          <ExperienceDetailGallery exp={galleryExp} />
        </div>

        <div className="flex w-full min-w-0 flex-col md:pt-2">
          <div className="mb-5 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A]">
            {stay.propertyType}
          </div>

          {locationLine || stay.address || stay.mapLink ? (
            <div className="flex items-start gap-2 text-sm text-[#D6C8B5]/90">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF6A]" aria-hidden />
              <div>
                {locationLine ? <div>{locationLine}</div> : null}
                {stay.address ? <div className="mt-0.5 text-[#D6C8B5]/75">{stay.address}</div> : null}
                {stay.mapLink ? (
                  <a
                    href={stay.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#D4AF6A] transition-colors hover:text-[#F7F1E8]"
                  >
                    <Navigation className="h-3.5 w-3.5" aria-hidden />
                    Get directions
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          <h1 className="mt-5 font-display text-3xl uppercase leading-[1.08] tracking-[0.04em] text-[#F7F1E8] sm:text-4xl md:text-[2.65rem]">
            {stay.title}
          </h1>

          {stay.tagline ? (
            <p className="mt-4 font-display text-base italic leading-relaxed text-[#D6C8B5]/90 sm:text-lg">
              {stay.tagline}
            </p>
          ) : null}

          <div className="my-7 h-px bg-gradient-to-r from-transparent via-[rgb(200_162_90/0.35)] to-transparent" />

          <dl className="grid grid-cols-3 divide-x divide-[rgb(200_162_90/0.28)] text-center sm:text-left">
            <div className="px-2 first:pl-0 sm:px-5">
              <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A]/85">
                From
              </dt>
              <dd className="mt-1.5 font-display text-xl uppercase tracking-[0.02em] text-[#F7F1E8]">
                {sym}
                {stay.pricePerNight.toLocaleString("en-IN")}
              </dd>
            </div>
            <div className="px-2 sm:px-5">
              <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A]/85">
                Beds
              </dt>
              <dd className="mt-1.5 font-display text-xl uppercase tracking-[0.02em] text-[#F7F1E8]">
                <BedDouble className="mx-auto h-5 w-5 text-[#D4AF6A] sm:mx-0" aria-hidden />
                {stay.bedrooms}
              </dd>
            </div>
            <div className="px-2 last:pr-0 sm:px-5">
              <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A]/85">
                Rating
              </dt>
              <dd className="mt-1.5 font-display text-xl text-[#D4AF6A]">
                <Star className="mr-1 inline h-4 w-4 fill-current" aria-hidden />
                {stay.rating}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <div className="eyebrow mb-3 text-[#D4AF6A]">About this stay</div>
            <p className="text-sm leading-relaxed text-[#D6C8B5]/90">{stay.description}</p>
          </div>

          {stay.amenities.length > 0 ? (
            <div className="mt-8">
              <div className="eyebrow mb-3 text-[#D4AF6A]">Amenities</div>
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
            </div>
          ) : null}

          <div className="mt-8 flex items-center gap-2 text-sm text-[#D6C8B5]/85">
            <Users className="h-4 w-4 text-[#D4AF6A]" aria-hidden />
            Up to {stay.maxGuests} guests · {stay.bathrooms} bath
          </div>
        </div>
      </section>

      <section id="book" className="border-t border-[rgb(200_162_90/0.18)] pb-16 pt-4">
        <div className="container-page py-8 sm:py-10">
          <LuxuryCheckoutPanel>
            <div className="mx-auto max-w-2xl">
              <div className="mb-8">
                <div className="eyebrow luxury-panel-label mb-3">Reserve your stay</div>
                <h2 className="luxury-panel-heading font-display text-3xl uppercase leading-tight tracking-[0.03em] sm:text-4xl">
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
                notes={checkout.notes}
                nights={checkout.nights}
                totalMinor={checkout.totalMinor}
                onCheckInChange={checkout.setCheckIn}
                onCheckOutChange={checkout.setCheckOut}
                onGuestsChange={checkout.setGuests}
                onNotesChange={checkout.setNotes}
                hideActions
                bookable={bookable}
              />

              {bookable ? (
                !user ? (
                  <Link
                    to="/sign-in"
                    search={{ redirect: bookPath }}
                    className="luxury-btn-sm luxury-btn-primary mt-6 inline-flex w-full items-center justify-center"
                  >
                    Sign in to book
                  </Link>
                ) : isGuestAccount(role) ? (
                  <Link
                    to="/homestays/$slug/book"
                    params={{ slug: stay.slug }}
                    search={{
                      checkIn: checkout.checkIn,
                      checkOut: checkout.checkOut,
                      guests: checkout.guests,
                    }}
                    className="luxury-btn-sm luxury-btn-primary mt-6 inline-flex w-full items-center justify-center"
                  >
                    Continue to book
                  </Link>
                ) : (
                  <p className="luxury-panel-body mt-6 text-center text-sm">
                    Sign in with a guest account to book this homestay.
                  </p>
                )
              ) : null}
            </div>
          </LuxuryCheckoutPanel>
        </div>
      </section>

      <Footer />
    </div>
  );
}
