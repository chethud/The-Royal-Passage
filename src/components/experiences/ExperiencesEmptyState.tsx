import { Compass } from "lucide-react";

type ExperiencesEmptyStateProps = {
  onReset: () => void;
};

export function ExperiencesEmptyState({ onReset }: ExperiencesEmptyStateProps) {
  return (
    <div className="luxury-empty flex flex-col items-center justify-center rounded-lg border border-[#C8A25A]/20 bg-[#4A0000]/50 px-6 py-12 text-center backdrop-blur-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#C8A25A]/30 bg-[#5B0000]/60 text-[#C8A25A]">
        <Compass className="h-6 w-6" />
      </div>
      <h2 className="font-display text-xl text-[#F7F1E8]">No experiences found</h2>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-[#D6C8B5]">
        Nothing matches your preferences right now. Try adjusting your filters or search terms.
      </p>
      <button type="button" onClick={onReset} className="luxury-btn-sm luxury-btn-primary mt-5">
        Reset filters
      </button>
    </div>
  );
}
