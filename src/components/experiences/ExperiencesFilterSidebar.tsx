import { useEffect, useMemo, useRef, useState, type ComponentType, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
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

type RangeOption = {
  key: string;
  label: string;
  shortLabel: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const DURATION_RANGE_OPTIONS: RangeOption[] = [
  { key: "__all__", label: "Any duration", shortLabel: "Any", Icon: Clock },
  { key: "short", label: "1–2 hours", shortLabel: "1–2h", Icon: Clock },
  { key: "half", label: "Half day", shortLabel: "Half", Icon: Sun },
  { key: "full", label: "Full day", shortLabel: "Full", Icon: Sunrise },
  { key: "multi", label: "Multi day", shortLabel: "Multi", Icon: CalendarRange },
];

const AVAILABILITY_RANGE_OPTIONS: RangeOption[] = [
  { key: "__all__", label: "Any time", shortLabel: "Any", Icon: CalendarDays },
  { key: "today", label: "Today", shortLabel: "Today", Icon: Sparkles },
  { key: "tomorrow", label: "Tomorrow", shortLabel: "Tmrw", Icon: Sun },
  { key: "week", label: "This week", shortLabel: "Week", Icon: CalendarDays },
  { key: "weekend", label: "Weekend", shortLabel: "Wknd", Icon: Moon },
];

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
      <FilterSection title="Category" activeKey={search.category ?? "__all__"}>
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

      <HorizontalRangeFilter
        title="Duration"
        options={DURATION_RANGE_OPTIONS}
        activeKey={search.duration ?? "__all__"}
        onSelect={(key) =>
          onUpdate({
            duration: key === "__all__" ? undefined : (key as ExperienceSearch["duration"]),
            page: 1,
          })
        }
      />

      <HorizontalRangeFilter
        title="When"
        options={AVAILABILITY_RANGE_OPTIONS}
        activeKey={search.availability ?? "__all__"}
        onSelect={(key) =>
          onUpdate({
            availability: key === "__all__" ? undefined : (key as ExperienceSearch["availability"]),
            page: 1,
          })
        }
      />
    </>
  );
}

function HorizontalRangeFilter({
  title,
  options,
  activeKey,
  onSelect,
}: {
  title: string;
  options: RangeOption[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const lastKeyRef = useRef<string | null>(null);
  const activeIndexRef = useRef(0);
  const optionsRef = useRef(options);
  const onSelectRef = useRef(onSelect);
  const [dragging, setDragging] = useState(false);

  optionsRef.current = options;
  onSelectRef.current = onSelect;

  const activeIndex = Math.max(
    options.findIndex((option) => option.key === activeKey),
    0,
  );
  activeIndexRef.current = activeIndex;
  const progress = options.length <= 1 ? 0 : activeIndex / (options.length - 1);

  const selectNearestFromClientX = (clientX: number) => {
    const rail = railRef.current;
    const currentOptions = optionsRef.current;
    if (!rail || currentOptions.length === 0) return;
    const rect = rail.getBoundingClientRect();
    const inset = 6; // matches 0.35rem track inset
    const left = rect.left + inset;
    const width = Math.max(rect.width - inset * 2, 1);
    const ratio = Math.min(1, Math.max(0, (clientX - left) / width));
    const index = Math.round(ratio * (currentOptions.length - 1));
    const next = currentOptions[index];
    if (!next || lastKeyRef.current === next.key) return;
    lastKeyRef.current = next.key;
    onSelectRef.current(next.key);
  };

  const stepBy = (delta: number) => {
    const currentOptions = optionsRef.current;
    const index = activeIndexRef.current;
    const next = currentOptions[Math.min(currentOptions.length - 1, Math.max(0, index + delta))];
    if (next && next.key !== currentOptions[index]?.key) onSelectRef.current(next.key);
  };

  useEffect(() => {
    const scrub = scrubRef.current;
    if (!scrub) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta === 0) return;
      stepBy(delta > 0 ? 1 : -1);
    };

    scrub.addEventListener("wheel", onWheel, { passive: false });
    return () => scrub.removeEventListener("wheel", onWheel);
  }, []);

  const endScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    lastKeyRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
  };

  const startScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    draggingRef.current = true;
    setDragging(true);
    lastKeyRef.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
    selectNearestFromClientX(event.clientX);
  };

  const moveScrub = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    selectNearestFromClientX(event.clientX);
  };

  return (
    <div>
      <h3 className="eyebrow mb-3 text-[0.62rem] tracking-[0.2em] text-[#D4AF6A]/90">{title}</h3>

      <div
        ref={railRef}
        className={`experiences-filter-range-h${dragging ? " is-dragging" : ""}`}
        style={{ ["--range-progress" as string]: String(progress) }}
      >
        <div
          ref={scrubRef}
          className="experiences-filter-range-h__scrub"
          role="slider"
          aria-label={`${title} range`}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={Math.max(options.length - 1, 0)}
          aria-valuenow={activeIndex}
          aria-valuetext={options[activeIndex]?.label ?? "Any"}
          tabIndex={0}
          onPointerDown={startScrub}
          onPointerMove={moveScrub}
          onPointerUp={endScrub}
          onPointerCancel={endScrub}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              event.preventDefault();
              stepBy(1);
            } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              event.preventDefault();
              stepBy(-1);
            } else if (event.key === "Home") {
              event.preventDefault();
              onSelect(options[0].key);
            } else if (event.key === "End") {
              event.preventDefault();
              onSelect(options[options.length - 1].key);
            }
          }}
        />
        <div className="experiences-filter-range-h__track" aria-hidden />
        <div className="experiences-filter-range-h__fill" aria-hidden />
        <div className="experiences-filter-range-h__knob" aria-hidden />
      </div>

      <div className="experiences-filter-range-h__labels">
        {options.map((option, index) => {
          const active = option.key === activeKey;
          const Icon = option.Icon;
          const stop = options.length <= 1 ? 0 : index / (options.length - 1);
          return (
            <button
              key={option.key}
              type="button"
              aria-label={option.label}
              aria-pressed={active}
              onClick={() => onSelect(option.key)}
              style={{ ["--range-stop" as string]: String(stop) }}
              className={`experiences-filter-range-h__label ${
                active ? "is-active text-[#F7F1E8]" : "text-[#F7F1E8]/55 hover:text-[#F7F1E8]"
              }`}
            >
              <Icon
                strokeWidth={1.5}
                className={`h-3.5 w-3.5 shrink-0 ${
                  active ? "text-[#D4AF6A]" : "text-[#D4AF6A]/65"
                }`}
              />
              <span className="experiences-filter-range-h__label-text">{option.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterSection({
  title,
  children,
  activeKey,
}: {
  title: string;
  children: ReactNode;
  activeKey?: string;
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

  return (
    <div>
      <h3 className="eyebrow mb-3 text-[0.62rem] tracking-[0.2em] text-[#D4AF6A]/90">{title}</h3>
      <div className="experiences-filter-rail relative pl-3">
        <div className="experiences-filter-rail__track" aria-hidden />
        {indicator ? (
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
