import { Crown } from "lucide-react";
import { VIP_PACKAGE_TYPES } from "@/data/vips";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VipsPackageTypeFilterProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
};

const ALL_TYPES_VALUE = "all";

export function VipsPackageTypeFilter({
  value,
  onChange,
  className = "",
}: VipsPackageTypeFilterProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-full border border-[rgb(74_0_0/0.14)] bg-[var(--cream-white)] shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)] ${className}`}
    >
      <Crown
        className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#4A0000]"
        strokeWidth={1.75}
        aria-hidden
      />
      <Select
        value={value || ALL_TYPES_VALUE}
        onValueChange={(next) => onChange(next === ALL_TYPES_VALUE ? undefined : next)}
      >
        <SelectTrigger className="royal-search-select-trigger h-auto w-full border-0 bg-transparent py-3 pl-11 pr-4 text-sm text-[#3A0000] shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:text-[#4A0000]/70">
          <SelectValue placeholder="All packages" />
        </SelectTrigger>
        <SelectContent className="royal-search-select-content border-[rgb(74_0_0/0.14)] bg-[var(--cream-white)] text-[#3A0000]">
          <SelectItem value={ALL_TYPES_VALUE} className="royal-search-select-item">
            All packages
          </SelectItem>
          {VIP_PACKAGE_TYPES.map((type) => (
            <SelectItem key={type} value={type} className="royal-search-select-item">
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
