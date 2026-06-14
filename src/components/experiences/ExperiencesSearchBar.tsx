import { Search, X } from "lucide-react";

type ExperiencesSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ExperiencesSearchBar({ value, onChange, className = "" }: ExperiencesSearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C8A25A]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search experiences, cities, categories…"
        className="w-full border-0 border-b border-[#C8A25A]/25 bg-transparent py-2.5 pl-10 pr-10 text-sm text-[#F7F1E8] placeholder:text-[#D6C8B5]/55 transition-colors focus:border-[#C8A25A]/55 focus:outline-none focus:ring-0"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D6C8B5] hover:text-[#F7F1E8]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
