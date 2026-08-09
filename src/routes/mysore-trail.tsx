import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MysoreTrailExperience } from "@/components/mysore-trail/MysoreTrailExperience";
import { useAuthUser } from "@/lib/auth-user";
import { canEditMysoreTrail } from "@/lib/roles";
import { SITE_URL } from "@/lib/seo";
import { canonicalLink } from "@/lib/seo-helpers";

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
          "An immersive royal journey through Mysuru — palaces, markets, temples, lakes and living heritage.",
      },
      { property: "og:title", content: "Mysore Trail — The Royal Passage" },
      {
        property: "og:description",
        content: "A cinematic itinerary experience through the City of Palaces.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/mysore-trail` },
    ],
    links: [canonicalLink("/mysore-trail", SITE_URL)],
  }),
  component: MysoreTrailPage,
});

function MysoreTrailPage() {
  const { place } = Route.useSearch();
  const { role, roles } = useAuthUser();
  const canEdit = canEditMysoreTrail(role, roles);

  return (
    <div className="trail-page-shell bg-[#2A080A] text-[#F4EBDD]">
      <Header />
      <div className="pt-[var(--header-height)]">
        <MysoreTrailExperience canEdit={canEdit} initialPlaceId={place} />
      </div>
      <Footer />
    </div>
  );
}
