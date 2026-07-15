import { createFileRoute } from "@tanstack/react-router";
import { PartnerHomestayApplicationForm } from "@/components/partner/PartnerHomestayApplicationForm";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/partner/homestay-host")({
  head: () => ({
    meta: [
      { title: "List your property — The Royal Passage" },
      {
        name: "description",
        content:
          "Apply to list a homestay with The Royal Passage. Share your details and property outline for our team to review.",
      },
      { property: "og:title", content: "List your property — The Royal Passage" },
      {
        property: "og:description",
        content: "Apply to host a homestay with The Royal Passage.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/partner/homestay-host` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/partner/homestay-host` }],
  }),
  component: PartnerHomestayHostPage,
});

function PartnerHomestayHostPage() {
  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <PartnerHomestayApplicationForm />
        </div>
      </section>
      <Footer />
    </div>
  );
}
