import { Compass } from "lucide-react";

type ExperiencesEmptyStateProps = {
  onReset: () => void;
};

export function ExperiencesEmptyState({ onReset }: ExperiencesEmptyStateProps) {
  return (
    <div className="luxury-empty flex flex-col items-center justify-center rounded-[20px] border border-[#C8A25A]/20 bg-[#4A0000]/50 px-8 py-20 text-center backdrop-blur-sm">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#C8A25A]/30 bg-[#5B0000]/60 text-[#C8A25A]">
        <Compass className="h-9 w-9" />
      </div>
      <h2 className="font-display text-3xl text-[#F7F1E8]">No experiences found</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[#D6C8B5]">
        Nothing matches your preferences right now. Try adjusting your filters or search terms.
      </p>
      <button type="button" onClick={onReset} className="luxury-btn-primary mt-8">
        Reset filters
      </button>
    </div>
  );
}
