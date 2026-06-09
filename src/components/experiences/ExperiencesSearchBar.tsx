import { Search, X } from "lucide-react";

type ExperiencesSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ExperiencesSearchBar({ value, onChange }: ExperiencesSearchBarProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C8A25A]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search experiences, cities, categories…"
        className="w-full rounded-lg border border-[#C8A25A]/22 bg-[#4A0000]/50 py-2.5 pl-10 pr-10 text-sm text-[#F7F1E8] placeholder:text-[#D6C8B5]/60 backdrop-blur-sm transition-colors focus:border-[#C8A25A]/45 focus:outline-none focus:ring-1 focus:ring-[#C8A25A]/25"
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
