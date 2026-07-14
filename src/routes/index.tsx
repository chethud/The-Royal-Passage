import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HomeHero } from "@/components/site/HomeHero";
import { HomeBrandSplash, HomeIntroProvider } from "@/components/site/home-intro";
import { ExperiencesShowcase } from "@/components/site/ExperiencesShowcase";
import { JourneysSplit } from "@/components/site/JourneysSplit";
import { PillarsRow } from "@/components/site/PillarsRow";
import { JournalPreview } from "@/components/site/JournalPreview";
import { getCatalogForUi, getCatalogFallback } from "@/lib/marketplace-fns";
import { getHomepageContent } from "@/lib/homepage-content-fns";
import { withHomepageCacheBust, normalizeHomepageContent } from "@/lib/homepage-content";
import { buildHomeJsonLd, SITE_URL } from "@/lib/seo";
import { ScrollParallaxSection } from "@/components/site/ScrollReveal";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [catalog, homepage] = await Promise.all([
      getCatalogForUi().catch(() => getCatalogFallback()),
      getHomepageContent().catch(() => normalizeHomepageContent({})),
    ]);
    return {
      ...catalog,
      experiences: catalog.experiences ?? [],
      homepage: normalizeHomepageContent(homepage ?? {}),
    };
  },
  staleTime: 0,
  head: ({ loaderData }) => {
    const heroSrc = loaderData?.homepage?.hero?.[0]?.imageUrl;
    const heroHref = heroSrc
      ? withHomepageCacheBust(heroSrc, loaderData?.homepage?.version ?? 0)
      : undefined;

    return {
      meta: [
        { title: "The Royal Passage — Experience Mysuru, Royally" },
        {
          name: "description",
          content:
            "Curated experiences in Mysuru — heritage walks, culinary journeys, pottery, nature trails and bespoke royal expeditions hosted by trusted local experts.",
        },
        { property: "og:title", content: "The Royal Passage" },
        {
          property: "og:description",
          content: "Experience Mysuru, Royally — curated, immersive, unforgettable.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: SITE_URL },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: SITE_URL },
        ...(heroHref
          ? [
              {
                rel: "preload" as const,
                href: heroHref,
                as: "image" as const,
                fetchPriority: "high" as const,
              },
            ]
          : []),
      ],
    };
  },
  component: Index,
});

function Index() {
  const { experiences: loaderExperiences, homepage: loaderHomepage } = Route.useLoaderData();
  const experiences = loaderExperiences ?? [];
  const publicContent = normalizeHomepageContent(loaderHomepage ?? {});
  const ldJson = buildHomeJsonLd(experiences);

  return (
    <HomeIntroProvider>
      <div className="overflow-x-hidden bg-background text-foreground">
        <HomeBrandSplash />
        <Header />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />

        <HomeHero
          slides={publicContent.hero}
          headings={publicContent.heroHeadings}
          imageVersion={publicContent.version}
        />
        <ScrollParallaxSection>
          <ExperiencesShowcase items={publicContent.showcase} imageVersion={publicContent.version} />
        </ScrollParallaxSection>
        <ScrollParallaxSection intensity="subtle">
          <JourneysSplit slides={publicContent.journeys} />
        </ScrollParallaxSection>
        <ScrollParallaxSection intensity="subtle">
          <PillarsRow />
        </ScrollParallaxSection>
        <ScrollParallaxSection>
          <JournalPreview items={publicContent.journal} imageVersion={publicContent.version} />
        </ScrollParallaxSection>
        <Footer />
      </div>
    </HomeIntroProvider>
  );
}
