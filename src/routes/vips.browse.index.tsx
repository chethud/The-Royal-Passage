import { createFileRoute } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { VipCard } from "@/components/vips/VipCard";
import { VipsBrowseHero } from "@/components/vips/VipsBrowseHero";
import { getVipsForUi } from "@/lib/vip-fns";
import { filterVips, parseVipBrowseSearch, type VipBrowseSearch } from "@/lib/vip-filters";
import { canonicalLink } from "@/lib/seo-helpers";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/vips/browse/")({
  loader: async () => getVipsForUi(),
  validateSearch: parseVipBrowseSearch,
  head: () => ({
    meta: [
      { title: "Browse VIP stays — The Royal Passage" },
      {
        name: "description",
        content: "Search curated VIP palace suites and private villas in Mysuru.",
      },
      { property: "og:url", content: `${SITE_URL}/vips/browse` },
    ],
    links: [canonicalLink("/vips/browse", SITE_URL)],
  }),
  component: VipsBrowsePage,
});

function VipsBrowsePage() {
  const { vips, mode } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const filtered = useMemo(() => filterVips(vips, search), [vips, search]);

  const updateSearch = (patch: Partial<VipBrowseSearch>) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <VipsBrowseHero search={search} onSearchChange={updateSearch} />

      <section className="container-page py-10 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              {filtered.length} VIP listing{filtered.length === 1 ? "" : "s"}
            </h2>
            {mode === "static" ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Preview listings — run `supabase/vip-module.sql` in Supabase for live catalog.
              </p>
            ) : null}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="luxury-empty">
            <Crown className="mb-4 h-8 w-8 text-[#D4AF6A]/80" strokeWidth={1.5} aria-hidden />
            <h2 className="font-display text-xl text-ink">No VIP stays match your search</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Try another property type or search term.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((stay) => (
              <VipCard key={stay.id} stay={stay} search={search} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
