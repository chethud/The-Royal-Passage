export function ExperienceCardSkeleton() {
  return (
    <div className="luxury-card overflow-hidden rounded-[20px] border border-[#C8A25A]/15">
      <div className="luxury-shimmer h-[320px] w-full" />
      <div className="space-y-4 p-6">
        <div className="luxury-shimmer h-3 w-20 rounded" />
        <div className="luxury-shimmer h-7 w-4/5 rounded" />
        <div className="luxury-shimmer h-4 w-full rounded" />
        <div className="flex gap-4">
          <div className="luxury-shimmer h-4 w-16 rounded" />
          <div className="luxury-shimmer h-4 w-20 rounded" />
          <div className="luxury-shimmer h-4 w-14 rounded" />
        </div>
        <div className="luxury-shimmer h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
