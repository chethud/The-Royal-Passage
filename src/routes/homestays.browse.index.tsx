import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HomestayCard } from "@/components/homestays/HomestayCard";
import { HomestaysBrowseHero } from "@/components/homestays/HomestaysBrowseHero";
import { HOMESTAY_PROPERTY_TYPES } from "@/data/homestays";
import { getHomestaysForUi } from "@/lib/homestay-fns";
import {
  filterHomestays,
  parseHomestayBrowseSearch,
  type HomestayBrowseSearch,
} from "@/lib/homestay-filters";
import { canonicalLink } from "@/lib/seo-helpers";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/homestays/browse/")({
  loader: async () => getHomestaysForUi(),
  validateSearch: parseHomestayBrowseSearch,
  head: ({ search }) => {
    const city = search?.q?.trim();
    const title = city
      ? `${city} homestays — The Royal Passage`
      : "Browse homestays — The Royal Passage";
    return {
      meta: [
        { title },
        {
          name: "description",
          content:
            "Search curated Mysuru homestays by dates and guests — heritage stays with Royal Passage hospitality.",
        },
        { property: "og:title", content: title },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE_URL}/homestays/browse` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [canonicalLink("/homestays/browse", SITE_URL)],
    };
  },
  component: HomestaysBrowsePage,
});

function HomestaysBrowsePage() {
  const { homestays, mode } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const filtered = useMemo(() => filterHomestays(homestays, search), [homestays, search]);

  const updateSearch = (patch: Partial<HomestayBrowseSearch>) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (next.checkIn && next.checkOut && next.checkOut <= next.checkIn) {
          const checkout = new Date(`${next.checkIn}T12:00:00`);
          checkout.setDate(checkout.getDate() + 1);
          next.checkOut = checkout.toISOString().slice(0, 10);
        }
        return next;
      },
    });
  };

  const applySearch = () => {
    void navigate({ search });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <HomestaysBrowseHero
        search={search}
        onSearchChange={(patch) => updateSearch(patch)}
        onSubmit={applySearch}
      />

      <section className="container-page py-10 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-ember/90">Available stays</p>
            <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
              {filtered.length} propert{filtered.length === 1 ? "y" : "ies"}
            </h2>
            {search.checkIn && search.checkOut ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {search.checkIn} → {search.checkOut}
                {search.guests ? ` · ${search.guests} guest${search.guests === 1 ? "" : "s"}` : ""}
              </p>
            ) : null}
            {mode === "static" ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Preview listings — run `supabase/homestay-module.sql` in Supabase for live catalog.
              </p>
            ) : null}
          </div>
          <label className="w-full sm:min-w-[200px] sm:w-auto">
            <span className="eyebrow mb-2 block text-[0.58rem]">Property type</span>
            <select
              value={search.propertyType ?? ""}
              onChange={(event) =>
                updateSearch({ propertyType: event.target.value || undefined })
              }
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
              Try different dates, fewer guests, or another city — new stays are added weekly.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((stay) => (
              <HomestayCard key={stay.id} stay={stay} search={search} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
