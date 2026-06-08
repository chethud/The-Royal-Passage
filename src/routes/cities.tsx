import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { listCities } from "@/lib/city-fns";
import { canonicalLink } from "@/lib/seo-helpers";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/cities")({
  loader: async () => {
    const cities = await listCities();
    return { cities };
  },
  head: () => ({
    meta: [
      { title: "Destinations — The Royal Passage" },
      {
        name: "description",
        content:
          "Explore curated experiences across Mysuru, Bengaluru, Coorg, Chikmagalur, Hampi, Ooty and beyond.",
      },
      { property: "og:title", content: "Destinations — The Royal Passage" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/cities` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [canonicalLink("/cities", SITE_URL)],
  }),
  component: CitiesIndexPage,
});

function CitiesIndexPage() {
  const { cities } = Route.useLoaderData();

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page py-12 sm:py-16">
        <div className="eyebrow mb-3">Beyond Mysuru</div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">
          Cities we <em className="italic text-ember">curate</em>
        </h1>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground">
          Starting in Mysuru and expanding across Karnataka and South India — each destination
          is hand-picked for authentic, host-led experiences.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city.slug}
              to="/cities/$slug"
              params={{ slug: city.slug }}
              className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 transition-colors hover:border-ember/40"
            >
              <div className="eyebrow text-muted-foreground">{city.state}</div>
              <h2 className="mt-2 font-display text-2xl">{city.name}</h2>
              {city.tagline ? (
                <p className="mt-2 text-sm text-muted-foreground">{city.tagline}</p>
              ) : null}
              <span className="mt-4 inline-block text-sm text-ember">Explore experiences →</span>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
