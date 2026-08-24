import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { HomestayCard } from "@/components/homestays/HomestayCard";
import { HOMESTAY_FEATURED_SLOT_COUNT } from "@/lib/homestay-featured-keys";
import type { Homestay } from "@/data/homestays";

type HomestaysShowcaseProps = {
  featured?: Homestay[];
  homestays?: Homestay[];
};

/** Featured top 3 first, then every other stay. */
function orderHomestaysWithFeaturedFirst(
  featured: Homestay[] | undefined,
  catalog: Homestay[],
): Homestay[] {
  if (catalog.length === 0) return (featured ?? []).slice(0, HOMESTAY_FEATURED_SLOT_COUNT);

  const top = (featured ?? []).slice(0, HOMESTAY_FEATURED_SLOT_COUNT);
  const topIds = new Set(top.map((stay) => stay.id));
  const rest = catalog.filter((stay) => !topIds.has(stay.id));
  return [...top, ...rest];
}

function matchesSearch(stay: Homestay, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    stay.title.toLowerCase().includes(q) ||
    stay.city.toLowerCase().includes(q) ||
    stay.propertyType.toLowerCase().includes(q) ||
    stay.address.toLowerCase().includes(q) ||
    stay.tagline.toLowerCase().includes(q)
  );
}

export function HomestaysShowcase({ featured, homestays = [] }: HomestaysShowcaseProps) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  const orderedStays = useMemo(
    () => orderHomestaysWithFeaturedFirst(featured, homestays),
    [featured, homestays],
  );

  const propertyTypes = useMemo(
    () =>
      Array.from(
        new Set(orderedStays.map((stay) => stay.propertyType).filter(Boolean)),
      ) as string[],
    [orderedStays],
  );

  const filteredStays = useMemo(() => {
    return orderedStays.filter((stay) => {
      if (selectedType && stay.propertyType?.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
      return matchesSearch(stay, query);
    });
  }, [orderedStays, query, selectedType]);

  if (orderedStays.length === 0) return null;

  return (
    <section
      id="homestays"
      className="relative border-y border-[oklch(0.88_0.08_86_/_0.1)] bg-[oklch(0.16_0.07_22)] py-16 sm:py-20 md:py-24 scroll-mt-20"
    >
      <div className="container-page">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="eyebrow mb-3 text-ember/90">Homestays & Stays</p>
            <h2 className="font-display text-3xl tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
              Rest Where Stories Live
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Heritage havelis, villas, and guest houses in Mysuru — each vetted for warmth,
              location, and Royal Passage hospitality.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-ember">
            <span>
              {filteredStays.length} {filteredStays.length === 1 ? "Property" : "Properties"}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[oklch(0.88_0.08_86_/_0.1)] pt-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          {propertyTypes.length > 1 ? (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="mr-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setSelectedType(undefined)}
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  selectedType === undefined
                    ? "bg-ember text-background shadow-sm font-semibold"
                    : "border border-ember/30 bg-ember/10 text-ink/80 hover:border-ember/60 hover:text-ink"
                }`}
              >
                All ({orderedStays.length})
              </button>
              {propertyTypes.map((type) => {
                const count = orderedStays.filter(
                  (stay) => stay.propertyType?.toLowerCase() === type.toLowerCase(),
                ).length;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      selectedType?.toLowerCase() === type.toLowerCase()
                        ? "bg-ember text-background shadow-sm font-semibold"
                        : "border border-ember/30 bg-ember/10 text-ink/80 hover:border-ember/60 hover:text-ink"
                    }`}
                  >
                    {type} ({count})
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <label className="relative block w-full shrink-0 lg:max-w-sm lg:w-[22rem]">
            <span className="sr-only">Search homestays</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ember/80"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city, or type…"
              className="w-full rounded-full border border-ember/30 bg-ember/10 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted-foreground focus:border-ember/60 focus:outline-none focus:ring-2 focus:ring-ember/40"
            />
          </label>
        </div>

        {filteredStays.length === 0 ? (
          <div className="mt-10 rounded-md border border-ember/20 bg-ember/5 px-6 py-10 text-center">
            <p className="font-display text-xl text-ink">No stays match your search</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different name, city, or clear the property type filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedType(undefined);
              }}
              className="luxury-btn-sm luxury-btn-primary mt-5"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 md:gap-7">
            {filteredStays.map((stay) => (
              <HomestayCard key={stay.id} stay={stay} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
