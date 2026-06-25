import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HomestaysHomeHero } from "@/components/homestays/HomestaysHomeHero";
import { HomestaysShowcase } from "@/components/site/HomestaysShowcase";
import { HomestayPillarsRow } from "@/components/homestays/HomestayPillarsRow";
import { HomestayHowItWorks } from "@/components/homestays/HomestayHowItWorks";
import { getHomestaysForUi } from "@/lib/homestay-fns";
import { canonicalLink } from "@/lib/seo-helpers";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/homestays/")({
  loader: async () => {
    const catalog = await getHomestaysForUi();
    return {
      homestays: catalog.homestays ?? [],
      mode: catalog.mode,
    };
  },
  head: () => ({
    meta: [
      { title: "Royal Homestays — Stay in Mysuru, Royally" },
      {
        name: "description",
        content:
          "Discover curated homestays, heritage havelis, and guest houses in Mysuru with Royal Passage hospitality.",
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
  const { homestays } = Route.useLoaderData();

  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <Header />

      <HomestaysHomeHero />
      <HomestaysShowcase homestays={homestays} />
      <HomestayPillarsRow />
      <HomestayHowItWorks />
      <Footer />
    </div>
  );
}
