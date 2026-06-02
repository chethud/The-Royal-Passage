import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — The Royal Passage" },
      { name: "description", content: "Notes from our hosts and curators." },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-14 sm:py-20">
        <div className="eyebrow mb-3">The journal</div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">Coming soon.</h1>
        <p className="mt-5 sm:mt-6 max-w-xl text-sm sm:text-base text-muted-foreground">
          A slow-paced publication on craft, hospitality, and the people behind the experiences.
          Launching alongside our second cohort of hosts.
        </p>
      </section>
      <Footer />
    </div>
  );
}
