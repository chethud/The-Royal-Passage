import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BedDouble, Crown, Star, Users } from "lucide-react";
import { ExperienceDetailGallery } from "@/components/experiences/ExperienceDetailGallery";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import {
  DetailCategoryBadge,
  DetailDarkSection,
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
import type { Experience } from "@/data/experiences";
import { getVipForDetail } from "@/lib/vip-fns";
import { SITE_URL } from "@/lib/seo";
import { canonicalLink } from "@/lib/seo-helpers";
import { parseVipBrowseSearch } from "@/lib/vip-filters";

export const Route = createFileRoute("/vips/$slug/")({
  validateSearch: parseVipBrowseSearch,
  loader: async ({ params }) => {
    const row = await getVipForDetail({ data: { slug: params.slug } });
    if (!row) throw notFound();
    return row;
  },
  head: ({ loaderData, params }) => {
    const stay = loaderData?.vip;
    if (!stay) return { meta: [{ title: "VIP stay — The Royal Passage" }] };
    const pageUrl = `${SITE_URL}/vips/${params.slug}`;
    return {
      meta: [
        { title: `${stay.title} — Royal VIP` },
        { name: "description", content: stay.tagline || stay.description.slice(0, 160) },
        { property: "og:title", content: stay.title },
        { property: "og:image", content: stay.image },
        { property: "og:url", content: pageUrl },
      ],
      links: [canonicalLink(`/vips/${params.slug}`, SITE_URL)],
    };
  },
  component: VipDetailPage,
});

function VipDetailPage() {
  const { vip: stay } = Route.useLoaderData();
  const sym = stay.currencySymbol ?? "₹";
  const locationLine = [stay.region, stay.city].filter(Boolean).join(" · ");
  const galleryExp = {
    slug: stay.slug,
    title: stay.title,
    category: stay.propertyType,
    image: stay.image,
    galleryUrls: stay.galleryUrls,
  } as Pick<Experience, "slug" | "title" | "category" | "image" | "galleryUrls"> as Experience;

  return (
    <DetailPageShell>
      <DetailBackLink to="/vips/browse">Back to VIP stays</DetailBackLink>

      <DetailHeroGrid>
        <ExperienceDetailGallery experience={galleryExp} />
        <DetailMainSection>
          <DetailTitleRow>
            <DetailCategoryBadge>
              <Crown className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              {stay.propertyType}
            </DetailCategoryBadge>
            <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl md:text-5xl">
              {stay.title}
            </h1>
          </DetailTitleRow>
          <DetailTagline>{stay.tagline}</DetailTagline>
          <DetailStatGrid>
            <DetailStatItem icon={Star} label="Rating" value={String(stay.rating)} />
            <DetailStatItem icon={BedDouble} label="Bedrooms" value={String(stay.bedrooms)} />
            <DetailStatItem icon={Users} label="Max guests" value={String(stay.maxGuests)} />
          </DetailStatGrid>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{stay.description}</p>
          {stay.conciergeNote ? (
            <p className="mt-4 rounded-sm border border-ember/25 bg-ember/8 px-4 py-3 text-sm text-ink/90">
              {stay.conciergeNote}
            </p>
          ) : null}
        </DetailMainSection>
      </DetailHeroGrid>

      <DetailDarkSection>
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <DetailLocationBlock
            address={stay.address}
            locationLine={locationLine}
            mapLink={stay.mapLink}
          />
          <LuxuryCheckoutPanel>
            <p className="luxury-panel-heading font-display text-2xl">Reserve this VIP stay</p>
            <p className="luxury-panel-body mt-2 text-sm">
              From {sym}
              {stay.pricePerNight.toLocaleString("en-IN")} per night · check-in {stay.checkInTime} ·
              check-out {stay.checkOutTime}
            </p>
            <p className="luxury-panel-body mt-4 text-sm">
              Full VIP booking checkout connects after the VIP module is enabled in Supabase. Contact
              Royal Passage concierge to reserve this stay today.
            </p>
            <Link
              to="/contact"
              className="luxury-btn-sm luxury-btn-primary mt-6 inline-flex w-full justify-center no-underline"
            >
              Contact concierge
            </Link>
          </LuxuryCheckoutPanel>
        </div>
      </DetailDarkSection>
    </DetailPageShell>
  );
}
