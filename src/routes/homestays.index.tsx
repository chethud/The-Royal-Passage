import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MarketplaceModuleNav } from "@/components/site/MarketplaceModuleNav";
import { HomestayCard } from "@/components/homestays/HomestayCard";
import { HomestaysHero } from "@/components/homestays/HomestaysHero";
import { HOMESTAY_PROPERTY_TYPES } from "@/data/homestays";
import { getHomestaysForUi } from "@/lib/homestay-fns";
import { canonicalLink } from "@/lib/seo-helpers";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/homestays/")({
  loader: async () => getHomestaysForUi(),
  head: () => ({
    meta: [
      { title: "Homestays & stays — The Royal Passage" },
      {
        name: "description",
        content:
          "Browse curated homestays, cottages, and guest houses across Mysuru and Karnataka — heritage stays with Royal Passage hospitality.",
      },
      { property: "og:title", content: "Homestays — The Royal Passage" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/homestays` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonicalLink("/homestays", SITE_URL)],
  }),
  component: HomestaysPage,
});

function HomestaysPage() {
  const { homestays, mode } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return homestays.filter((stay) => {
      if (propertyType && stay.propertyType !== propertyType) return false;
      if (!q) return true;
      return (
        stay.title.toLowerCase().includes(q) ||
        stay.city.toLowerCase().includes(q) ||
        stay.propertyType.toLowerCase().includes(q)
      );
    });
  }, [homestays, propertyType, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="sticky top-[var(--header-height)] z-40 border-b border-[oklch(0.72_0.09_78_/_0.15)] bg-background/95 backdrop-blur-md">
        <div className="container-page py-3">
          <MarketplaceModuleNav />
        </div>
      </div>

      <HomestaysHero searchValue={query} onSearchChange={setQuery} />

      <section className="container-page py-10 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-ember/90">Filters</p>
            <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
              {filtered.length} propert{filtered.length === 1 ? "y" : "ies"}
            </h2>
            {mode === "static" ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Preview listings — run `supabase/homestay-module.sql` in Supabase for live catalog.
              </p>
            ) : null}
          </div>
          <label className="min-w-[200px]">
            <span className="eyebrow mb-2 block text-[0.58rem]">Property type</span>
            <select
              value={propertyType}
              onChange={(event) => setPropertyType(event.target.value)}
              className="w-full border border-[oklch(0.72_0.09_78_/_0.25)] bg-card px-3 py-2.5 text-sm text-foreground focus:border-ember/55 focus:outline-none"
            >
              <option value="">All types</option>
              {HOMESTAY_PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-md border border-[oklch(0.72_0.09_78_/_0.2)] bg-card/40 px-6 py-16 text-center">
            <p className="font-display text-xl text-ink">No homestays match your search</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another city or property type — new stays are added weekly.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((stay) => (
              <HomestayCard key={stay.id} stay={stay} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
