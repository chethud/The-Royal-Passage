import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CalendarRange,
  Clock,
  Grid3X3,
  Landmark,
  Leaf,
  Moon,
  Mountain,
  Palette,
  Sparkles,
  Sun,
  Sunrise,
  Trees,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import type { ExperienceSearch } from "@/lib/experience-filters";

type ExperiencesFilterSidebarProps = {
  search: ExperienceSearch;
  categories: string[];
  onUpdate: (patch: Partial<ExperienceSearch>) => void;
  onReset: () => void;
};

const DURATION_OPTIONS = [
  { id: "short" as const, label: "1–2 hours", Icon: Clock },
  { id: "half" as const, label: "Half day", Icon: Sun },
  { id: "full" as const, label: "Full day", Icon: Sunrise },
  { id: "multi" as const, label: "Multi day", Icon: CalendarRange },
];

const AVAILABILITY_OPTIONS = [
  { id: "today" as const, label: "Today", Icon: Sparkles },
  { id: "tomorrow" as const, label: "Tomorrow", Icon: Sun },
  { id: "week" as const, label: "This week", Icon: CalendarDays },
  { id: "weekend" as const, label: "Weekend", Icon: Moon },
];

function categoryIcon(label: string): LucideIcon {
  const key = label.toLowerCase();
  if (key.includes("art") || key.includes("craft")) return Palette;
  if (key.includes("culinary") || key.includes("food") || key.includes("dining") || key.includes("tasting")) {
    return UtensilsCrossed;
  }
  if (key.includes("wellness") || key.includes("healing")) return Leaf;
  if (key.includes("outdoor") || key.includes("nature") || key.includes("voyage")) return Trees;
  if (key.includes("heritage") || key.includes("cultural")) return Landmark;
  if (key.includes("rural") || key.includes("farm")) return Wheat;
  if (key.includes("luxury") || key.includes("premium") || key.includes("drive")) return Sparkles;
  if (key.includes("detox") || key.includes("slow")) return Moon;
  if (key.includes("mountain")) return Mountain;
  return Landmark;
}

export function ExperiencesFilterSidebar({
  search,
  categories,
  onUpdate,
  onReset,
}: ExperiencesFilterSidebarProps) {
  return (
    <aside className="w-full shrink-0 lg:w-[220px] xl:w-[240px]">
      <div className="sticky top-[calc(var(--header-height)+1rem)] space-y-6 rounded-lg border border-[#C8A25A]/14 bg-[linear-gradient(165deg,#4A0000_0%,#3a0000_55%,#2d0000_100%)] p-5 shadow-[0_24px_48px_-32px_rgba(0,0,0,0.65)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 border-b border-[#C8A25A]/12 pb-3">
          <h2 className="font-display text-base tracking-wide text-[#F7F1E8]">Refine</h2>
          <button
            type="button"
            onClick={onReset}
            className="text-[0.65rem] uppercase tracking-[0.14em] text-[#D4AF6A]/85 transition-colors hover:text-[#F7F1E8]"
          >
            Reset
          </button>
        </div>

        <FilterSection title="Category">
          <FilterIcon
            active={!search.category}
            label="All categories"
            onClick={() => onUpdate({ category: undefined, page: 1 })}
          >
            <Grid3X3 strokeWidth={1.5} className="h-[1.15rem] w-[1.15rem]" />
          </FilterIcon>
          {categories.map((category) => {
            const Icon = categoryIcon(category);
            return (
              <FilterIcon
                key={category}
                active={search.category === category}
                label={category}
                onClick={() =>
                  onUpdate({ category: search.category === category ? undefined : category, page: 1 })
                }
              >
                <Icon strokeWidth={1.5} className="h-[1.15rem] w-[1.15rem]" />
              </FilterIcon>
            );
          })}
        </FilterSection>

        <FilterSection title="Duration">
          {DURATION_OPTIONS.map(({ id, label, Icon }) => (
            <FilterIcon
              key={id}
              active={search.duration === id}
              label={label}
              onClick={() =>
                onUpdate({
                  duration: search.duration === id ? undefined : id,
                  page: 1,
                })
              }
            >
              <Icon strokeWidth={1.5} className="h-[1.15rem] w-[1.15rem]" />
            </FilterIcon>
          ))}
        </FilterSection>

        <FilterSection title="When">
          {AVAILABILITY_OPTIONS.map(({ id, label, Icon }) => (
            <FilterIcon
              key={id}
              active={search.availability === id}
              label={label}
              onClick={() =>
                onUpdate({
                  availability: search.availability === id ? undefined : id,
                  page: 1,
                })
              }
            >
              <Icon strokeWidth={1.5} className="h-[1.15rem] w-[1.15rem]" />
            </FilterIcon>
          ))}
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow mb-3 text-[0.62rem] tracking-[0.2em] text-[#D4AF6A]/90">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterIcon({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a0000] ${
        active
          ? "bg-[#C8A25A]/18 text-[#E8C872] shadow-[0_0_0_1px_oklch(0.78_0.12_86_/_0.55),0_0_22px_oklch(0.72_0.12_86_/_0.28)]"
          : "text-[#F7F1E8]/55 hover:bg-[#C8A25A]/08 hover:text-[#D4AF6A] hover:shadow-[0_0_18px_oklch(0.72_0.12_86_/_0.12)]"
      }`}
    >
      {children}
    </button>
  );
}
