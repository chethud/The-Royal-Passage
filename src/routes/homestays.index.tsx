import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HomestaysHomeHero } from "@/components/homestays/HomestaysHomeHero";
import { HomestaysShowcase } from "@/components/site/HomestaysShowcase";
import { JourneysSplit } from "@/components/site/JourneysSplit";
import { PillarsRow } from "@/components/site/PillarsRow";
import { JournalPreview } from "@/components/site/JournalPreview";
import { getHomestaysForUi } from "@/lib/homestay-fns";
import { getHomepageContent } from "@/lib/homepage-content-fns";
import { normalizeHomepageContent } from "@/lib/homepage-content";
import { canonicalLink } from "@/lib/seo-helpers";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/homestays/")({
  loader: async () => {
    const [catalog, homepage] = await Promise.all([
      getHomestaysForUi(),
      getHomepageContent().catch(() => normalizeHomepageContent({})),
    ]);
    return {
      homestays: catalog.homestays ?? [],
      mode: catalog.mode,
      homepage: normalizeHomepageContent(homepage ?? {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Royal Homestays — Stay in Mysuru, Royally" },
      {
        name: "description",
        content:
          "Discover curated homestays, heritage havelis, and guest houses across Mysuru and Karnataka with Royal Passage hospitality.",
      },
      { property: "og:title", content: "Royal Homestays — The Royal Passage" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/homestays` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonicalLink("/homestays", SITE_URL)],
  }),
  component: HomestaysHomePage,
});

function HomestaysHomePage() {
  const { homestays, homepage } = Route.useLoaderData();

  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <Header />

      <HomestaysHomeHero />
      <HomestaysShowcase homestays={homestays.slice(0, 3)} />
      <JourneysSplit slides={homepage.journeys} />
      <PillarsRow />
      <JournalPreview items={homepage.journal} imageVersion={homepage.version} />
      <Footer />
    </div>
  );
}
