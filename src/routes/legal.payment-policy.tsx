import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { PaymentPolicyDocument } from "@/components/legal/PaymentPolicyDocument";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/legal/payment-policy")({
  head: () => ({
    meta: [
      { title: "Payment, Refund & Cancellation Policy — The Royal Passage" },
      {
        name: "description",
        content:
          "Read the Payment, Refund & Cancellation Policy for bookings on The Royal Passage, including Experiences, Homestays, and VIP Packages.",
      },
      {
        property: "og:title",
        content: "Payment, Refund & Cancellation Policy — The Royal Passage",
      },
      {
        property: "og:description",
        content:
          "How payments, refunds, and cancellations are handled for The Royal Passage bookings.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/legal/payment-policy` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/legal/payment-policy` }],
  }),
  component: PaymentPolicyPage,
});

function PaymentPolicyPage() {
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
          <PaymentPolicyDocument />
        </div>
      </section>
      <Footer />
    </div>
  );
}
