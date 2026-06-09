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
  { id: "short", label: "1–2 Hours" },
  { id: "half", label: "Half Day" },
  { id: "full", label: "Full Day" },
  { id: "multi", label: "Multi Day" },
] as const;

const AVAILABILITY_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "week", label: "This Week" },
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
    <aside className="luxury-filter-sidebar w-full shrink-0 lg:w-[280px]">
      <div className="sticky top-[calc(var(--header-height)+1.5rem)] space-y-8 rounded-[20px] border border-[#C8A25A]/20 bg-[#4A0000]/65 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-[#F7F1E8]">Refine</h2>
          <button
            type="button"
            onClick={onReset}
            className="text-xs uppercase tracking-[0.14em] text-[#D4AF6A] transition-colors hover:text-[#F7F1E8]"
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

        <FilterSection title="Price range">
          <div className="space-y-3">
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={100}
              value={maxPrice}
              onChange={(e) => onUpdate({ maxPrice: Number(e.target.value), page: 1 })}
              className="luxury-range w-full"
            />
            <div className="flex justify-between text-xs text-[#D6C8B5]">
              <span>₹{minPrice}</span>
              <span className="text-[#C8A25A]">Up to ₹{maxPrice}</span>
            </div>
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

        <FilterSection title="Availability">
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
      <h3 className="eyebrow mb-3 text-[#D4AF6A]">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
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
      className={`rounded-full border px-3.5 py-1.5 text-xs transition-all duration-300 ${
        active
          ? "border-[#C8A25A] bg-gradient-to-r from-[#C8A25A] to-[#D4AF6A] font-medium text-[#4A0000] shadow-[0_0_24px_-6px_#C8A25A]"
          : "border-[#C8A25A]/25 bg-[#5B0000]/40 text-[#F7F1E8] hover:border-[#C8A25A]/50 hover:shadow-[0_0_20px_-8px_#C8A25A]"
      }`}
    >
      {children}
    </button>
  );
}
