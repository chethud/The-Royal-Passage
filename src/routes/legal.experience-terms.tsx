import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { ExperienceTermsDocument } from "@/components/legal/ExperienceTermsDocument";
import { SITE_URL } from "@/lib/seo";

type ExperienceTermsSearch = {
  from?: string;
};

export const Route = createFileRoute("/legal/experience-terms")({
  validateSearch: (s: Record<string, unknown>): ExperienceTermsSearch => ({
    from: typeof s.from === "string" ? s.from : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Customer Terms & Conditions — The Royal Passage" },
      {
        name: "description",
        content:
          "Read the Customer Terms & Conditions for booking curated experiences on The Royal Passage.",
      },
      { property: "og:title", content: "Customer Terms & Conditions — The Royal Passage" },
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
  const { from } = Route.useSearch();
  const fromSignIn = from === "sign-in";

  return (
    <div className="min-h-dvh pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page w-full py-8 sm:py-12">
        <div className="mb-5 flex justify-end sm:mb-6">
          <Link
            to={fromSignIn ? "/sign-in" : "/experiences"}
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-ember hover:underline"
          >
            {fromSignIn ? "← Back to sign in" : "← Back to experiences"}
          </Link>
        </div>
        <div className="glass-strong w-full rounded-lg border border-[oklch(0.88_0.08_86_/_0.15)] px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
          <ExperienceTermsDocument />
        </div>
      </section>
      <Footer />
    </div>
  );
}
