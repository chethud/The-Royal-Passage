import { createFileRoute } from "@tanstack/react-router";
import { PartnerExperienceApplicationForm } from "@/components/partner/PartnerExperienceApplicationForm";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/partner/experience-host")({
  head: () => ({
    meta: [
      { title: "Partner as an experience host — The Royal Passage" },
      {
        name: "description",
        content:
          "Apply to host a curated experience with The Royal Passage. Share your details and experience outline for our team to review.",
      },
      { property: "og:title", content: "Partner as an experience host — The Royal Passage" },
      {
        property: "og:description",
        content: "Apply to host with The Royal Passage — we’ll review your experience proposal.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/partner/experience-host` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/partner/experience-host` }],
  }),
  component: PartnerExperienceHostPage,
});

function PartnerExperienceHostPage() {
  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <PartnerExperienceApplicationForm />
        </div>
      </section>
      <Footer />
    </div>
  );
}
