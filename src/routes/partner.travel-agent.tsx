import { createFileRoute } from "@tanstack/react-router";
import { PartnerTravelAgentApplicationForm } from "@/components/partner/PartnerTravelAgentApplicationForm";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/partner/travel-agent")({
  head: () => ({
    meta: [
      { title: "Travel agent partner — The Royal Passage" },
      {
        name: "description",
        content:
          "Apply to become a Royal Passage travel agent. Submit company GST details and book experiences and homestays for your clients.",
      },
      { property: "og:title", content: "Travel agent partner — The Royal Passage" },
      {
        property: "og:description",
        content: "Apply to book Royal Passage experiences and homestays for your clients.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/partner/travel-agent` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/partner/travel-agent` }],
  }),
  component: PartnerTravelAgentPage,
});

function PartnerTravelAgentPage() {
  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <PartnerTravelAgentApplicationForm />
        </div>
      </section>
      <Footer />
    </div>
  );
}
