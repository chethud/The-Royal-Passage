import { Search, X } from "lucide-react";

type ExperiencesSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ExperiencesSearchBar({ value, onChange, className = "" }: ExperiencesSearchBarProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-full border border-[rgb(88_16_0/0.14)] bg-[var(--cream-white)] shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)] ${className}`}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-maroon-deep" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search experiences, cities, categories…"
        className="w-full border-0 bg-transparent py-3 pl-11 pr-10 text-sm text-brand-noir placeholder:text-[rgb(27_23_22/0.45)] focus:outline-none focus:ring-0"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(27_23_22/0.55)] transition-colors hover:text-brand-maroon-deep"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
