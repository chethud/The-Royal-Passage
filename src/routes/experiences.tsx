import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ExperienceCard } from "@/components/site/ExperienceCard";
import { getCatalogForUi } from "@/lib/marketplace-fns";

type Search = {
  category?: string;
};

export const Route = createFileRoute("/experiences")({
  loader: async () => await getCatalogForUi(),
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
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
  const { experiences, categories } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const filtered = useMemo(() => {
    return experiences.filter((e) => {
      if (search.category && e.category !== search.category) return false;
      return true;
    });
  }, [experiences, search.category]);

  const updateCategory = (category: string | undefined) =>
    navigate({ search: (prev) => ({ ...prev, category }) });

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page pt-10 pb-6 sm:pt-12 sm:pb-8">
        <div className="eyebrow mb-3">The library</div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl">All experiences</h1>
        <p className="mt-4 max-w-xl text-sm sm:text-base text-muted-foreground">
          {filtered.length} of {experiences.length} experiences
          {search.category ? ` in ${search.category}` : ""}.
        </p>
      </section>

      <section className="container-page grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-10 pb-16 md:pb-20">
        <aside className="glass self-start space-y-8 rounded-md border border-[oklch(0.72_0.09_78_/_0.22)] p-6 lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
          <FilterGroup label="Category">
            <FilterChip active={!search.category} onClick={() => updateCategory(undefined)}>
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c}
                active={search.category === c}
                onClick={() => updateCategory(search.category === c ? undefined : c)}
              >
                {c}
              </FilterChip>
            ))}
          </FilterGroup>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="glass rounded-md border border-[oklch(0.88_0.08_86_/_0.2)] p-16 text-center">
              <p className="font-display text-2xl">Nothing matches.</p>
              <p className="text-sm text-muted-foreground mt-2">Try another category.</p>
              <Link to="/experiences" className="mt-6 inline-block underline underline-offset-4">
                View all
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
