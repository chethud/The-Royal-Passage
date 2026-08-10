import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MysoreTrailExperience } from "@/components/mysore-trail/MysoreTrailExperience";
import { useAuthUser } from "@/lib/auth-user";
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
  component: MysoreTrailPage,
});

function MysoreTrailPage() {
  const { place } = Route.useSearch();
  const { role, roles } = useAuthUser();
  const canEdit = canEditMysoreTrail(role, roles);

  return (
    <div className="trail-page-shell">
      <Header />
      <MysoreTrailExperience canEdit={canEdit} initialPlaceId={place} />
      <Footer />
    </div>
  );
}
