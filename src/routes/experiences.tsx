import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ExperienceCard } from "@/components/site/ExperienceCard";
import { getCatalogForUi } from "@/lib/marketplace-fns";

type Search = {
  category?: string;
  city?: string;
  maxPrice?: number;
  minRating?: number;
};

export const Route = createFileRoute("/experiences")({
  loader: async () => await getCatalogForUi(),
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    city: typeof s.city === "string" ? s.city : undefined,
    maxPrice: typeof s.maxPrice === "number" ? s.maxPrice : undefined,
    minRating: typeof s.minRating === "number" ? s.minRating : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All experiences — The Royal Passage" },
      {
        name: "description",
        content:
          "Browse curated, time-bound experiences hosted by verified artisans across six cities.",
      },
      { property: "og:title", content: "All experiences — The Royal Passage" },
    ],
  }),
  component: ExperiencesPage,
});

function ExperiencesPage() {
  const { experiences, categories, cities } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const priceCeiling = useMemo(() => {
    const hi = experiences.length ? Math.max(...experiences.map((e) => e.pricePerPerson)) : 400;
    return Math.max(400, Math.ceil(hi / 50) * 50);
  }, [experiences]);
  const [maxPrice, setMaxPrice] = useState<number>(search.maxPrice ?? priceCeiling);

  const filtered = useMemo(() => {
    return experiences.filter((e) => {
      if (search.category && e.category !== search.category) return false;
      if (search.city && e.city !== search.city) return false;
      if (e.pricePerPerson > maxPrice) return false;
      if (search.minRating && e.rating < search.minRating) return false;
      return true;
    });
  }, [experiences, search, maxPrice]);

  const update = (patch: Partial<Search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page pt-10 pb-6 sm:pt-12 sm:pb-8">
        <div className="eyebrow mb-3">The library</div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">All experiences</h1>
        <p className="mt-4 max-w-xl text-sm sm:text-base text-muted-foreground">
          {filtered.length} of {experiences.length} experiences match your filters.
        </p>
      </section>

      <section className="container-page grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-10 pb-16 md:pb-20">
        {/* FILTERS */}
        <aside className="glass self-start space-y-8 rounded-md border border-[oklch(0.72_0.09_78_/_0.22)] p-6 lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
          <FilterGroup label="Category">
            <FilterChip active={!search.category} onClick={() => update({ category: undefined })}>
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c}
                active={search.category === c}
                onClick={() => update({ category: search.category === c ? undefined : c })}
              >
                {c}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="City">
            <FilterChip active={!search.city} onClick={() => update({ city: undefined })}>
              All
            </FilterChip>
            {cities.map((c) => (
              <FilterChip
                key={c}
                active={search.city === c}
                onClick={() => update({ city: search.city === c ? undefined : c })}
              >
                {c}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label={`Max price · ${maxPrice}`}>
            <input
              type="range"
              min={50}
              max={priceCeiling}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              onMouseUp={() => update({ maxPrice })}
              onTouchEnd={() => update({ maxPrice })}
              className="w-full accent-foreground"
            />
          </FilterGroup>

          <FilterGroup label="Minimum rating">
            {[4.5, 4.7, 4.9].map((r) => (
              <FilterChip
                key={r}
                active={search.minRating === r}
                onClick={() => update({ minRating: search.minRating === r ? undefined : r })}
              >
                {r}★ +
              </FilterChip>
            ))}
          </FilterGroup>
        </aside>

        {/* GRID */}
        <div>
          {filtered.length === 0 ? (
            <div className="glass rounded-md border border-[oklch(0.88_0.08_86_/_0.2)] p-16 text-center">
              <p className="font-display text-2xl">Nothing matches.</p>
              <p className="text-sm text-muted-foreground mt-2">Try widening your filters.</p>
              <Link to="/experiences" className="mt-6 inline-block underline underline-offset-4">
                Clear all
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 sm:gap-x-6 gap-y-10 sm:gap-y-12">
              {filtered.map((e) => (
                <ExperienceCard key={e.id} exp={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-3">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm px-3 py-1.5 text-xs transition-all ${
        active
          ? "border border-ember bg-ember/95 font-medium text-primary-foreground shadow-[var(--shadow-gold)]"
          : "border border-[oklch(0.72_0.09_78_/_0.25)] bg-background/15 text-foreground hover:border-ember/45"
      }`}
    >
      {children}
    </button>
  );
}
