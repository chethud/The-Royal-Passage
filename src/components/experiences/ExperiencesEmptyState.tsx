import { Compass } from "lucide-react";

type ExperiencesEmptyStateProps = {
  onReset: () => void;
};

export function ExperiencesEmptyState({ onReset }: ExperiencesEmptyStateProps) {
  return (
    <div className="luxury-empty">
      <Compass className="mb-4 h-8 w-8 text-[#D4AF37]/80" strokeWidth={1.5} aria-hidden />
      <h2 className="font-display text-xl text-[#F7F1E8]">No experiences found</h2>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-[#D6C8B5]/90">
        Nothing matches your preferences right now. Try adjusting your filters or search terms.
      </p>
      <button type="button" onClick={onReset} className="luxury-btn-sm luxury-btn-primary mt-6">
        Reset filters
      </button>
    </div>
  );
}
