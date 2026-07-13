import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  CalendarDays,
  CalendarRange,
  Clock,
  Grid3X3,
  Moon,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Sunrise,
  X,
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

function countActiveFilters(search: ExperienceSearch): number {
  let n = 0;
  if (search.category) n += 1;
  if (search.duration) n += 1;
  if (search.availability) n += 1;
  if (search.city) n += 1;
  return n;
}

export function ExperiencesFilterSidebar({
  search,
  categories,
  onUpdate,
  onReset,
}: ExperiencesFilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = useMemo(() => countActiveFilters(search), [search]);

  return (
    <aside className="order-1 w-full shrink-0 md:w-[220px] lg:w-[220px] xl:w-[240px]">
      {/* Mobile: collapsible filters */}
      <div className="md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-[rgb(200_162_90/0.35)] bg-[rgb(0_0_0/0.2)] px-3 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#F7F1E8] transition-colors hover:border-[#D4AF6A]"
          >
            {mobileOpen ? (
              <X className="h-3.5 w-3.5 text-[#D4AF6A]" aria-hidden />
            ) : (
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#D4AF6A]" aria-hidden />
            )}
            {mobileOpen ? "Hide filters" : "Refine"}
            {activeCount > 0 ? (
              <span className="rounded-full bg-[#D4AF6A]/20 px-1.5 py-0.5 text-[0.6rem] text-[#D4AF6A]">
                {activeCount}
              </span>
            ) : null}
          </button>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={onReset}
              className="shrink-0 px-2 py-2.5 text-[0.65rem] uppercase tracking-[0.14em] text-[#D4AF6A]/85 transition-colors hover:text-[#F7F1E8]"
            >
              Reset
            </button>
          ) : null}
        </div>

        {mobileOpen ? (
          <div className="mt-4 space-y-4 rounded-sm border border-[rgb(200_162_90/0.22)] bg-[rgb(0_0_0/0.18)] px-3 py-3">
            <FilterPanels search={search} categories={categories} onUpdate={onUpdate} />
          </div>
        ) : null}
      </div>

      {/* Desktop: always-visible sticky sidebar */}
      <div className="sticky top-[calc(var(--header-height)+1rem)] hidden space-y-8 py-2 md:block">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base tracking-wide text-[#F7F1E8]">Refine</h2>
          <button
            type="button"
            onClick={onReset}
            className="text-[0.65rem] uppercase tracking-[0.14em] text-[#D4AF6A]/85 transition-colors hover:text-[#F7F1E8]"
          >
            Reset
          </button>
        </div>
        <FilterPanels search={search} categories={categories} onUpdate={onUpdate} />
      </div>
    </aside>
  );
}

function FilterPanels({
  search,
  categories,
  onUpdate,
}: {
  search: ExperienceSearch;
  categories: string[];
  onUpdate: (patch: Partial<ExperienceSearch>) => void;
}) {
  return (
    <>
      <FilterSection
        title="Category"
        activeKey={search.category ?? "__all__"}
      >
        <FilterOption
          optionKey="__all__"
          active={!search.category}
          label="All categories"
          Icon={Grid3X3}
          onClick={() => onUpdate({ category: undefined, page: 1 })}
        />
        {categories.map((category) => (
          <FilterOption
            key={category}
            optionKey={category}
            active={search.category === category}
            label={category}
            Icon={categoryIconForLabel(category)}
            onClick={() =>
              onUpdate({ category: search.category === category ? undefined : category, page: 1 })
            }
          />
        ))}
      </FilterSection>

      <FilterSection
        title="Duration"
        activeKey={search.duration ?? "__all__"}
        variant="range"
      >
        <FilterOption
          optionKey="__all__"
          active={!search.duration}
          label="Any duration"
          displayLabel="Any"
          Icon={Clock}
          onClick={() => onUpdate({ duration: undefined, page: 1 })}
        />
        {DURATION_OPTIONS.map(({ id, label, shortLabel, Icon }) => (
          <FilterOption
            key={id}
            optionKey={id}
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

      <FilterSection
        title="When"
        activeKey={search.availability ?? "__all__"}
        variant="range"
      >
        <FilterOption
          optionKey="__all__"
          active={!search.availability}
          label="Any time"
          displayLabel="Any"
          Icon={CalendarDays}
          onClick={() => onUpdate({ availability: undefined, page: 1 })}
        />
        {AVAILABILITY_OPTIONS.map(({ id, label, Icon }) => (
          <FilterOption
            key={id}
            optionKey={id}
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
    </>
  );
}

function FilterSection({
  title,
  children,
  activeKey,
  variant = "segment",
}: {
  title: string;
  children: ReactNode;
  activeKey?: string;
  /** segment = highlight active row; range = fill from top to selection + knob */
  variant?: "segment" | "range";
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!activeKey) {
          setIndicator(null);
          return;
        }
        const active = list.querySelector<HTMLElement>(
          `[data-filter-key="${activeKey.replace(/"/g, '\\"')}"]`,
        );
        if (!active) {
          setIndicator(null);
          return;
        }
        // Read geometry in one frame, then write — avoids forced sync reflow.
        const top = active.offsetTop;
        const height = active.offsetHeight;
        setIndicator({ top, height });
      });
    };

    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(list);
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(list, { childList: true, subtree: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [activeKey]);

  const knobCenter = indicator ? indicator.top + indicator.height / 2 : 0;
  const isRange = variant === "range";

  return (
    <div>
      <h3 className="eyebrow mb-3 text-[0.62rem] tracking-[0.2em] text-[#D4AF6A]/90">{title}</h3>
      <div
        className={`experiences-filter-rail relative ${isRange ? "experiences-filter-rail--range pl-4" : "pl-3"}`}
      >
        <div className="experiences-filter-rail__track" aria-hidden />
        {indicator && isRange ? (
          <>
            <div
              className="experiences-filter-rail__fill"
              aria-hidden
              style={{ height: `${Math.max(knobCenter, 2)}px` }}
            />
            <div
              className="experiences-filter-rail__knob"
              aria-hidden
              style={{ transform: `translateY(${knobCenter}px) translate(-50%, -50%)` }}
            />
          </>
        ) : null}
        {indicator && !isRange ? (
          <div
            className="experiences-filter-rail__thumb"
            aria-hidden
            style={{
              transform: `translateY(${indicator.top}px)`,
              height: `${indicator.height}px`,
            }}
          />
        ) : null}
        <div ref={listRef} className="relative flex flex-col gap-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}

function FilterOption({
  optionKey,
  active,
  label,
  displayLabel,
  Icon,
  onClick,
}: {
  optionKey: string;
  active?: boolean;
  label: string;
  displayLabel?: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick?: () => void;
}) {
  const text = displayLabel ?? shortCategoryLabel(label);

  return (
    <button
      type="button"
      data-filter-key={optionKey}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`group flex w-full items-center gap-2.5 py-2 pl-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A25A]/50 ${
        active ? "text-[#F7F1E8]" : "text-[#F7F1E8]/65 hover:text-[#F7F1E8]"
      }`}
    >
      <Icon
        strokeWidth={1.5}
        className={`h-4 w-4 shrink-0 transition-colors ${
          active ? "text-[#D4AF6A]" : "text-[#D4AF6A]/70 group-hover:text-[#D4AF6A]"
        }`}
      />
      <span className="min-w-0 text-[0.72rem] font-medium leading-snug tracking-[0.04em]">{text}</span>
    </button>
  );
}
