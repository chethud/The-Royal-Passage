import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/hosts")({
  head: () => ({
    meta: [
      { title: "Become a host — The Royal Passage" },
      {
        name: "description",
        content:
          "Apply to host curated experiences on The Royal Passage. Verified hosts only — every application is reviewed by hand.",
      },
      { property: "og:title", content: "Become a host — The Royal Passage" },
    ],
  }),
  component: HostsPage,
});

function HostsPage() {
  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-14 sm:py-20 md:py-28 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-7">
          <div className="eyebrow mb-5 sm:mb-6">For hosts</div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] sm:leading-[1] tracking-tight">
            For those who
            <br />
            <em className="italic text-ember">host with intention.</em>
          </h1>
          <p className="mt-6 sm:mt-8 max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground">
            We work with a small number of chefs, captains, artisans and guides who care about the
            room as much as the craft. If that sounds like you, we'd love to meet.
          </p>
        </div>
        <div className="md:col-span-5 md:pt-6 space-y-6 text-sm">
          <Step n="01" title="Apply">
            Submit your profile and three example experiences.
          </Step>
          <Step n="02" title="We meet">
            A short conversation with our curation team — usually within a week.
          </Step>
          <Step n="03" title="Publish">
            Once approved, your experiences are reviewed and published one by one.
          </Step>
          <Step n="04" title="Host">
            We handle bookings and payments. You focus on the experience.
          </Step>
        </div>
      </section>

      <section className="glass-strong border-y border-[oklch(0.88_0.08_86_/_0.1)]">
        <div className="container-page py-14 sm:py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">Ready to apply?</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Host applications open in the next phase. In the meantime, browse the library to see the
            standard.
          </p>
          <Link
            to="/experiences"
            className="mt-8 inline-flex items-center rounded-sm bg-ember px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110"
          >
            Explore the library →
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-4">
      <div className="font-display text-2xl text-ember w-10 shrink-0">{n}</div>
      <div>
        <div className="font-display text-xl">{title}</div>
        <p className="mt-1 text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
