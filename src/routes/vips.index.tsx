import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { VipsHomeHero } from "@/components/vips/VipsHomeHero";
import { VipsShowcase } from "@/components/site/VipsShowcase";
import { getVipsForUi } from "@/lib/vip-fns";
import { canonicalLink } from "@/lib/seo-helpers";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/vips/")({
  loader: async () => getVipsForUi(),
  head: () => ({
    meta: [
      { title: "Royal VIP Packages — The Royal Passage" },
      {
        name: "description",
        content:
          "Curated Royal VIP packages in Mysuru — palace experiences, heritage circuits, and wellness retreats. Custom packages designed by our concierge.",
      },
      { property: "og:title", content: "Royal VIP Packages — The Royal Passage" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/vips` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonicalLink("/vips", SITE_URL)],
  }),
  component: VipsHomePage,
});

function VipsHomePage() {
  const { vips } = Route.useLoaderData();

  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <Header />
      <VipsHomeHero />
      <VipsShowcase vips={vips} />
      <Footer />
    </div>
  );
}
