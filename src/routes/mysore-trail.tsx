import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MysoreTrailExperience } from "@/components/mysore-trail/MysoreTrailExperience";
import {
  applyCatalogToHeroes,
  applyCatalogToPlaces,
  defaultMysoreTrailCatalog,
} from "@/data/mysore-trail-cms";
import { setTrailPlaceCatalog } from "@/data/mysore-trail-journey";
import { useAuthUser } from "@/lib/auth-user";
import { getMysoreTrailCatalog } from "@/lib/mysore-trail-fns";
import { canEditMysoreTrail } from "@/lib/roles";
import { SITE_URL } from "@/lib/seo";
import { canonicalLink } from "@/lib/seo-helpers";

const TRAIL_FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";

export const Route = createFileRoute("/mysore-trail")({
  validateSearch: (search: Record<string, unknown>) => ({
    place: typeof search.place === "string" ? search.place : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mysore Trail — The Royal Passage" },
      {
        name: "description",
        content:
          "A thoughtfully curated journey through Mysuru — palaces, markets, temples, food and hidden corners.",
      },
      { property: "og:title", content: "Mysore Trail — The Royal Passage" },
      {
        property: "og:description",
        content: "Plan an elegant itinerary through the City of Palaces.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/mysore-trail` },
    ],
    links: [
      canonicalLink("/mysore-trail", SITE_URL),
      { rel: "stylesheet", href: TRAIL_FONTS },
    ],
  }),
  loader: async () => {
    const catalog = await getMysoreTrailCatalog().catch(() => defaultMysoreTrailCatalog());
    const places = applyCatalogToPlaces(catalog);
    setTrailPlaceCatalog(places);
    return {
      catalog,
      heroes: applyCatalogToHeroes(catalog),
    };
  },
  component: MysoreTrailPage,
});

function MysoreTrailPage() {
  const { place } = Route.useSearch();
  const { catalog, heroes } = Route.useLoaderData();
  const { role, roles } = useAuthUser();
  const canEdit = canEditMysoreTrail(role, roles);

  useEffect(() => {
    setTrailPlaceCatalog(applyCatalogToPlaces(catalog));
    return () => setTrailPlaceCatalog(null);
  }, [catalog]);

  return (
    <div className="trail-page-shell">
      <Header />
      <MysoreTrailExperience
        canEdit={canEdit}
        initialPlaceId={place}
        heroDestinations={heroes}
      />
      <Footer />
    </div>
  );
}
