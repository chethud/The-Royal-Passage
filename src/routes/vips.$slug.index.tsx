import { createFileRoute, notFound } from "@tanstack/react-router";
import { Crown, Star, Users } from "lucide-react";
import { ExperienceDetailGallery } from "@/components/experiences/ExperienceDetailGallery";
import { VipPackageDetailSections } from "@/components/vips/VipPackageDetailSections";
import { VipPackageEnquiryPanel } from "@/components/vips/VipPackageEnquiryPanel";
import {
  DetailCategoryBadge,
  DetailHeroGrid,
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
    const pkg = loaderData?.vip;
    if (!pkg) return { meta: [{ title: "VIP package — The Royal Passage" }] };
    const pageUrl = `${SITE_URL}/vips/${params.slug}`;
    return {
      meta: [
        { title: `${pkg.title} — Royal VIP` },
        { name: "description", content: pkg.tagline || pkg.description.slice(0, 160) },
        { property: "og:title", content: pkg.title },
        { property: "og:image", content: pkg.image },
        { property: "og:url", content: pageUrl },
      ],
      links: [canonicalLink(`/vips/${params.slug}`, SITE_URL)],
    };
  },
  component: VipDetailPage,
});

function VipDetailPage() {
  const { vip: pkg } = Route.useLoaderData();
  const sym = pkg.currencySymbol ?? "₹";
  const galleryExp = {
    slug: pkg.slug,
    title: pkg.title,
    category: pkg.packageType,
    image: pkg.image,
    galleryUrls: pkg.galleryUrls,
  } as Pick<Experience, "slug" | "title" | "category" | "image" | "galleryUrls"> as Experience;

  return (
    <DetailPageShell>
      <DetailBackLink to="/vips/browse">Back to packages</DetailBackLink>

      <DetailHeroGrid>
        <ExperienceDetailGallery exp={galleryExp} />
        <DetailMainSection>
          <DetailTitleRow>
            <DetailCategoryBadge>
              <Crown className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              {pkg.packageType}
            </DetailCategoryBadge>
            <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl md:text-5xl">
              {pkg.title}
            </h1>
          </DetailTitleRow>
          <DetailTagline>{pkg.tagline}</DetailTagline>
          <DetailStatGrid>
            <DetailStatItem label="Rating">
              <span className="text-[#D4AF37]">
                <Star className="mr-1 inline h-4 w-4 fill-current" aria-hidden />
                {pkg.rating}
              </span>
            </DetailStatItem>
            <DetailStatItem label="Duration">
              {pkg.durationDays} day{pkg.durationDays === 1 ? "" : "s"}
            </DetailStatItem>
            <DetailStatItem label="Max guests">
              <Users className="mx-auto h-5 w-5 text-[#D4AF37] sm:mx-0" aria-hidden />
              {pkg.maxGuests}
            </DetailStatItem>
          </DetailStatGrid>
          <p className="mt-4 text-sm text-muted-foreground">
            From {sym}
            {pkg.priceFrom.toLocaleString("en-IN")} · {pkg.reviewsCount} guest review
            {pkg.reviewsCount === 1 ? "" : "s"}
          </p>
        </DetailMainSection>
      </DetailHeroGrid>

      <section className="border-t border-[rgb(200_162_90/0.18)] bg-[oklch(0.14_0.06_22)] py-10 sm:py-12 md:py-14">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12">
          <VipPackageDetailSections pkg={pkg} />
          <VipPackageEnquiryPanel pkg={pkg} />
        </div>
      </section>
    </DetailPageShell>
  );
}
