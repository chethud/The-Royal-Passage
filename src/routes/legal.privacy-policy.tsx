import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { PrivacyPolicyDocument } from "@/components/legal/PrivacyPolicyDocument";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/legal/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — The Royal Passage" },
      {
        name: "description",
        content:
          "Read the Privacy Policy for The Royal Passage. Learn how we collect, use, store, and protect your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — The Royal Passage" },
      {
        property: "og:description",
        content: "How The Royal Passage collects, uses, and protects your personal information.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/legal/privacy-policy` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/legal/privacy-policy` }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-dvh pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page w-full py-8 sm:py-12">
        <div className="mb-5 flex justify-end sm:mb-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-ember hover:underline"
          >
            ← Back to home
          </Link>
        </div>
        <div className="glass-strong w-full rounded-lg border border-[oklch(0.88_0.08_86_/_0.15)] px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
          <PrivacyPolicyDocument />
        </div>
      </section>
      <Footer />
    </div>
  );
}
