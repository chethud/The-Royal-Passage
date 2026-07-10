import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { ExperienceTermsDocument } from "@/components/legal/ExperienceTermsDocument";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/legal/experience-terms")({
  head: () => ({
    meta: [
      { title: "Customer Terms of Service — The Royal Passage" },
      {
        name: "description",
        content:
          "Read the Customer Terms of Service for booking curated experiences on The Royal Passage.",
      },
      { property: "og:title", content: "Customer Terms of Service — The Royal Passage" },
      {
        property: "og:description",
        content: "Terms governing your use of The Royal Passage platform and experience bookings.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/legal/experience-terms` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/legal/experience-terms` }],
  }),
  component: ExperienceTermsPage,
});

function ExperienceTermsPage() {
  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="eyebrow mb-2 text-ember/90">Legal</div>
              <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
                Customer Terms of Service
              </h1>
            </div>
            <Link
              to="/experiences"
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-ember hover:underline"
            >
              ← Back to experiences
            </Link>
          </div>
          <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] px-5 py-8 sm:px-8 sm:py-10">
            <ExperienceTermsDocument />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
