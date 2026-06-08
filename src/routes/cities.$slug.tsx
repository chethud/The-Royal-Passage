import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExperienceCard } from "@/components/site/ExperienceCard";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getCityBySlug } from "@/lib/city-fns";
import { getCatalogForUi } from "@/lib/marketplace-fns";
import { buildCityJsonLd, SITE_URL } from "@/lib/seo";
import { canonicalLink } from "@/lib/seo-helpers";

export const Route = createFileRoute("/cities/$slug")({
  loader: async ({ params }) => {
    const [city, catalog] = await Promise.all([
      getCityBySlug({ data: { slug: params.slug } }),
      getCatalogForUi(),
    ]);
    if (!city) throw notFound();
    const experiences = catalog.experiences.filter(
      (exp) =>
        exp.citySlug === city.slug ||
        exp.city.toLowerCase() === city.name.toLowerCase() ||
        exp.city.toLowerCase() === city.slug,
    );
    return { city, experiences };
  },
  head: ({ loaderData }) => {
    const city = loaderData?.city;
    if (!city) return { meta: [{ title: "City — The Royal Passage" }] };
    const title = `${city.name} experiences — The Royal Passage`;
    const description =
      city.description ??
      city.tagline ??
      `Curated experiences in ${city.name} hosted by trusted local experts.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE_URL}/cities/${city.slug}` },
        { name: "twitter:card", content: "summary" },
      ],
      links: [canonicalLink(`/cities/${city.slug}`, SITE_URL)],
    };
  },
  component: CityDetailPage,
});

function CityDetailPage() {
  const { city, experiences } = Route.useLoaderData();
  const ldJson = buildCityJsonLd(city);

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />

      <section className="container-page py-12 sm:py-16">
        <Link to="/cities" className="text-xs eyebrow text-muted-foreground hover:text-foreground">
          ← All destinations
        </Link>
        <div className="eyebrow mt-6 text-muted-foreground">{city.state}</div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">{city.name}</h1>
        {city.tagline ? (
          <p className="mt-4 max-w-2xl text-lg italic text-muted-foreground">{city.tagline}</p>
        ) : null}
        {city.description ? (
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground">
            {city.description}
          </p>
        ) : null}
      </section>

      <section className="container-page pb-16 md:pb-20">
        {experiences.length === 0 ? (
          <div className="glass rounded-md border border-[oklch(0.88_0.08_86_/_0.2)] p-16 text-center">
            <p className="font-display text-2xl">Experiences coming soon.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We are onboarding hosts in {city.name}. Browse Mysuru while we expand.
            </p>
            <Link to="/experiences" className="mt-6 inline-block text-ember hover:underline">
              View all experiences
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-8 text-sm text-muted-foreground">
              {experiences.length} experience{experiences.length === 1 ? "" : "s"} in {city.name}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 sm:gap-x-6 gap-y-10 sm:gap-y-12">
              {experiences.map((exp) => (
                <ExperienceCard key={exp.id} exp={exp} />
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
