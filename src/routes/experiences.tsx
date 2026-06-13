import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ExperienceCard } from "@/components/site/ExperienceCard";
import { ExperiencesHero } from "@/components/experiences/ExperiencesHero";
import { ExperiencesFilterSidebar } from "@/components/experiences/ExperiencesFilterSidebar";
import { ExperiencesEmptyState } from "@/components/experiences/ExperiencesEmptyState";
import { ExperienceCardSkeleton } from "@/components/experiences/ExperienceCardSkeleton";
import { useAuthUser } from "@/lib/auth-user";
import { isGuestAccount } from "@/lib/roles";
import { listCities } from "@/lib/city-fns";
import {
  filterExperiences,
  paginateExperiences,
  totalPages,
  type ExperienceSearch,
  PAGE_SIZE,
} from "@/lib/experience-filters";
import { getCatalogForUi } from "@/lib/marketplace-fns";
import { canonicalLink } from "@/lib/seo-helpers";
import { SITE_URL } from "@/lib/seo";

function parseSearch(s: Record<string, unknown>): ExperienceSearch {
  const num = (v: unknown) => (typeof v === "string" && v ? Number(v) : undefined);
  return {
    category: typeof s.category === "string" ? s.category : undefined,
    city: typeof s.city === "string" ? s.city : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    duration:
      s.duration === "short" ||
      s.duration === "half" ||
      s.duration === "full" ||
      s.duration === "multi"
        ? s.duration
        : undefined,
    availability:
      s.availability === "today" ||
      s.availability === "tomorrow" ||
      s.availability === "week" ||
      s.availability === "weekend"
        ? s.availability
        : undefined,
    page: num(s.page) ?? 1,
  };
}

export const Route = createFileRoute("/experiences")({
  loader: async () => {
    const [catalog, cities] = await Promise.all([getCatalogForUi(), listCities()]);
    return { ...catalog, cityOptions: cities };
  },
  validateSearch: parseSearch,
  head: ({ search }) => {
    const cityLabel = search.city
      ? search.city.charAt(0).toUpperCase() + search.city.slice(1)
      : null;
    const title = cityLabel
      ? `${cityLabel} experiences — The Royal Passage`
      : "Luxury experiences — The Royal Passage";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: cityLabel
            ? `Browse curated luxury experiences in ${cityLabel} hosted by verified local experts.`
            : "Discover extraordinary curated experiences — cultural, wellness, culinary and rural journeys across South India.",
        },
        { property: "og:title", content: title },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE_URL}/experiences` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [canonicalLink("/experiences", SITE_URL)],
    };
  },
  component: ExperiencesPage,
});

function ExperiencesPage() {
  const { experiences, categories, cityOptions } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { user, role } = useAuthUser();
  const showWishlistHeart = !user || isGuestAccount(role);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () => filterExperiences(experiences, search, cityOptions),
    [cityOptions, experiences, search],
  );

  const page = search.page ?? 1;
  const pages = totalPages(filtered.length);
  const paged = useMemo(() => paginateExperiences(filtered, page), [filtered, page]);

  const updateSearch = (patch: Partial<ExperienceSearch>) => {
    startTransition(() => {
      void navigate({ search: (prev) => ({ ...prev, ...patch }) });
    });
  };

  const resetFilters = () => {
    void navigate({
      search: {
        category: undefined,
        city: undefined,
        q: undefined,
        duration: undefined,
        availability: undefined,
        page: 1,
      },
    });
  };

  return (
    <div className="text-foreground">
      <Header />

      <ExperiencesHero
        signedIn={Boolean(user)}
        showWishlistHeart={showWishlistHeart}
        searchValue={search.q ?? ""}
        onSearchChange={(q) => updateSearch({ q: q || undefined, page: 1 })}
      />

      <section id="experiences-grid" className="container-page pb-16 pt-8">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-[#C8A25A]/12 pb-4">
          <div>
            <p className="eyebrow text-[0.65rem] text-[#D4AF6A]">Curated collection</p>
            <h2 className="mt-1 font-display text-2xl text-[#F7F1E8]">
              {filtered.length} experience{filtered.length === 1 ? "" : "s"}
            </h2>
            <p className="mt-1 text-xs text-[#D6C8B5]">
              Handpicked journeys from verified hosts
            </p>
          </div>
          <p className="text-xs text-[#D6C8B5]">
            Page {Math.min(page, pages)} of {pages}
          </p>
        </div>

        <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
          <ExperiencesFilterSidebar
            search={search}
            categories={categories}
            onUpdate={updateSearch}
            onReset={resetFilters}
          />

          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              {pending ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ExperienceCardSkeleton key={i} />
                  ))}
                </motion.div>
              ) : filtered.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ExperiencesEmptyState onReset={resetFilters} />
                </motion.div>
              ) : (
                <motion.div
                  key={`grid-${page}-${search.q}-${search.city}-${search.category}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {paged.map((e) => (
                    <ExperienceCard key={e.id} exp={e} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {filtered.length > PAGE_SIZE ? (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => updateSearch({ page: Math.max(1, page - 1) })}
                  className="luxury-btn-sm luxury-btn-secondary disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-3 text-xs text-[#D6C8B5]">
                  {page} / {pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => updateSearch({ page: Math.min(pages, page + 1) })}
                  className="luxury-btn-sm luxury-btn-secondary disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
