import { Search, X } from "lucide-react";

type ExperiencesSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ExperiencesSearchBar({ value, onChange }: ExperiencesSearchBarProps) {
  return (
    <div className="luxury-search relative">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C8A25A]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search experiences, cities, categories…"
        className="w-full rounded-2xl border border-[#C8A25A]/25 bg-[#4A0000]/55 py-4 pl-14 pr-12 text-[#F7F1E8] placeholder:text-[#D6C8B5]/70 backdrop-blur-md transition-all focus:border-[#C8A25A]/55 focus:outline-none focus:ring-2 focus:ring-[#C8A25A]/20"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#D6C8B5] transition-colors hover:text-[#F7F1E8]"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
