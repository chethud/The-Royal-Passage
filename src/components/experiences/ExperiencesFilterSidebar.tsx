import type { ExperienceSearch } from "@/lib/experience-filters";
import { PRICE_MAX, PRICE_MIN } from "@/lib/experience-filters";

type CityOption = { slug: string; name: string };

type ExperiencesFilterSidebarProps = {
  search: ExperienceSearch;
  categories: string[];
  cityOptions: CityOption[];
  onUpdate: (patch: Partial<ExperienceSearch>) => void;
  onReset: () => void;
};

const DURATION_OPTIONS = [
  { id: "short", label: "1–2h" },
  { id: "half", label: "Half day" },
  { id: "full", label: "Full day" },
  { id: "multi", label: "Multi day" },
] as const;

const AVAILABILITY_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "week", label: "This week" },
  { id: "weekend", label: "Weekend" },
] as const;

export function ExperiencesFilterSidebar({
  search,
  categories,
  cityOptions,
  onUpdate,
  onReset,
}: ExperiencesFilterSidebarProps) {
  const minPrice = search.minPrice ?? PRICE_MIN;
  const maxPrice = search.maxPrice ?? PRICE_MAX;

  return (
    <aside className="w-full shrink-0 lg:w-[220px] xl:w-[240px]">
      <div className="sticky top-[calc(var(--header-height)+1rem)] space-y-5 rounded-lg border border-[#C8A25A]/18 bg-[#4A0000]/55 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base text-[#F7F1E8]">Refine</h2>
          <button
            type="button"
            onClick={onReset}
            className="text-[0.65rem] uppercase tracking-[0.12em] text-[#D4AF6A] transition-colors hover:text-[#F7F1E8]"
          >
            Reset
          </button>
        </div>

        <FilterSection title="City">
          <FilterPill active={!search.city} onClick={() => onUpdate({ city: undefined, page: 1 })}>
            All
          </FilterPill>
          {cityOptions.map((c) => (
            <FilterPill
              key={c.slug}
              active={search.city === c.slug}
              onClick={() =>
                onUpdate({ city: search.city === c.slug ? undefined : c.slug, page: 1 })
              }
            >
              {c.name}
            </FilterPill>
          ))}
        </FilterSection>

        <FilterSection title="Category">
          <FilterPill
            active={!search.category}
            onClick={() => onUpdate({ category: undefined, page: 1 })}
          >
            All
          </FilterPill>
          {categories.map((c) => (
            <FilterPill
              key={c}
              active={search.category === c}
              onClick={() =>
                onUpdate({ category: search.category === c ? undefined : c, page: 1 })
              }
            >
              {c}
            </FilterPill>
          ))}
        </FilterSection>

        <FilterSection title="Price">
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={100}
            value={maxPrice}
            onChange={(e) => onUpdate({ maxPrice: Number(e.target.value), page: 1 })}
            className="luxury-range w-full"
          />
          <div className="mt-1.5 flex justify-between text-[0.65rem] text-[#D6C8B5]">
            <span>₹{minPrice}</span>
            <span className="text-[#C8A25A]">≤ ₹{maxPrice}</span>
          </div>
        </FilterSection>

        <FilterSection title="Duration">
          {DURATION_OPTIONS.map((opt) => (
            <FilterPill
              key={opt.id}
              active={search.duration === opt.id}
              onClick={() =>
                onUpdate({
                  duration: search.duration === opt.id ? undefined : opt.id,
                  page: 1,
                })
              }
            >
              {opt.label}
            </FilterPill>
          ))}
        </FilterSection>

        <FilterSection title="When">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <FilterPill
              key={opt.id}
              active={search.availability === opt.id}
              onClick={() =>
                onUpdate({
                  availability: search.availability === opt.id ? undefined : opt.id,
                  page: 1,
                })
              }
            >
              {opt.label}
            </FilterPill>
          ))}
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow mb-2 text-[0.65rem] text-[#D4AF6A]">{title}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterPill({
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
      className={`rounded-sm border px-2.5 py-1 text-[0.65rem] transition-colors ${
        active
          ? "border-[#C8A25A] bg-[#C8A25A] font-medium text-[#4A0000]"
          : "border-[#C8A25A]/22 bg-[#5B0000]/35 text-[#F7F1E8] hover:border-[#C8A25A]/45"
      }`}
    >
      {children}
    </button>
  );
}
