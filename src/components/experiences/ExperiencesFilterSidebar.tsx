import {
  CalendarDays,
  CalendarRange,
  Clock,
  Grid3X3,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
} from "lucide-react";
import type { ExperienceSearch } from "@/lib/experience-filters";
import { categoryIconForLabel, shortCategoryLabel } from "@/lib/experience-category-icons";

type ExperiencesFilterSidebarProps = {
  search: ExperienceSearch;
  categories: string[];
  onUpdate: (patch: Partial<ExperienceSearch>) => void;
  onReset: () => void;
};

const DURATION_OPTIONS = [
  { id: "short" as const, label: "1–2 hours", shortLabel: "1–2h", Icon: Clock },
  { id: "half" as const, label: "Half day", shortLabel: "Half day", Icon: Sun },
  { id: "full" as const, label: "Full day", shortLabel: "Full day", Icon: Sunrise },
  { id: "multi" as const, label: "Multi day", shortLabel: "Multi day", Icon: CalendarRange },
] as const;

const AVAILABILITY_OPTIONS = [
  { id: "today" as const, label: "Today", Icon: Sparkles },
  { id: "tomorrow" as const, label: "Tomorrow", Icon: Sun },
  { id: "week" as const, label: "This week", Icon: CalendarDays },
  { id: "weekend" as const, label: "Weekend", Icon: Moon },
] as const;

export function ExperiencesFilterSidebar({
  search,
  categories,
  onUpdate,
  onReset,
}: ExperiencesFilterSidebarProps) {
  return (
    <aside className="w-full shrink-0 lg:w-[240px] xl:w-[260px]">
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
          <FilterOption
            active={!search.category}
            label="All categories"
            Icon={Grid3X3}
            onClick={() => onUpdate({ category: undefined, page: 1 })}
          />
          {categories.map((category) => (
            <FilterOption
              key={category}
              active={search.category === category}
              label={category}
              Icon={categoryIconForLabel(category)}
              onClick={() =>
                onUpdate({ category: search.category === category ? undefined : category, page: 1 })
              }
            />
          ))}
        </FilterSection>

        <FilterSection title="Duration">
          {DURATION_OPTIONS.map(({ id, label, shortLabel, Icon }) => (
            <FilterOption
              key={id}
              active={search.duration === id}
              label={label}
              displayLabel={shortLabel}
              Icon={Icon}
              onClick={() =>
                onUpdate({
                  duration: search.duration === id ? undefined : id,
                  page: 1,
                })
              }
            />
          ))}
        </FilterSection>

        <FilterSection title="When">
          {AVAILABILITY_OPTIONS.map(({ id, label, Icon }) => (
            <FilterOption
              key={id}
              active={search.availability === id}
              label={label}
              Icon={Icon}
              onClick={() =>
                onUpdate({
                  availability: search.availability === id ? undefined : id,
                  page: 1,
                })
              }
            />
          ))}
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow mb-2.5 text-[0.62rem] tracking-[0.2em] text-[#D4AF6A]/90">{title}</h3>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function FilterOption({
  active,
  label,
  displayLabel,
  Icon,
  onClick,
}: {
  active?: boolean;
  label: string;
  displayLabel?: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick?: () => void;
}) {
  const text = displayLabel ?? shortCategoryLabel(label);

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a0000] ${
        active
          ? "bg-[#C8A25A]/12 text-[#F7F1E8]"
          : "text-[#F7F1E8]/72 hover:bg-[#C8A25A]/06 hover:text-[#F7F1E8]"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
          active
            ? "bg-[#C8A25A]/20 text-[#E8C872] shadow-[0_0_18px_oklch(0.72_0.12_86_/_0.22)]"
            : "bg-[#F7F1E8]/06 text-[#D4AF6A]/75 group-hover:bg-[#C8A25A]/10 group-hover:text-[#D4AF6A]"
        }`}
      >
        <Icon strokeWidth={1.5} className="h-[1.05rem] w-[1.05rem]" />
      </span>
      <span className="min-w-0 text-[0.72rem] font-medium leading-snug tracking-[0.04em]">{text}</span>
    </button>
  );
}
