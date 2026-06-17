import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HomeHero } from "@/components/site/HomeHero";
import { ExperiencesShowcase } from "@/components/site/ExperiencesShowcase";
import { JourneysSplit } from "@/components/site/JourneysSplit";
import { PillarsRow } from "@/components/site/PillarsRow";
import { JournalPreview } from "@/components/site/JournalPreview";
import { getCatalogForUi } from "@/lib/marketplace-fns";
import { getHomepageContent } from "@/lib/homepage-content-fns";
import { normalizeHomepageContent } from "@/lib/homepage-content";
import { buildHomeJsonLd, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [catalog, homepage] = await Promise.all([
      getCatalogForUi(),
      getHomepageContent().catch(() => normalizeHomepageContent({})),
    ]);
    return {
      ...catalog,
      experiences: catalog.experiences ?? [],
      homepage: normalizeHomepageContent(homepage ?? {}),
    };
  },
  staleTime: 0,
  head: () => ({
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
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

function Index() {
  const { experiences: loaderExperiences, homepage: loaderHomepage } = Route.useLoaderData();
  const experiences = loaderExperiences ?? [];
  const publicContent = normalizeHomepageContent(loaderHomepage ?? {});
  const ldJson = buildHomeJsonLd(experiences);

  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <HomeHero slides={publicContent.hero} imageVersion={publicContent.version} />
      <ExperiencesShowcase items={publicContent.showcase} imageVersion={publicContent.version} />
      <JourneysSplit slides={publicContent.journeys} />
      <PillarsRow />
      <JournalPreview items={publicContent.journal} imageVersion={publicContent.version} />
      <Footer />
    </div>
  );
}
