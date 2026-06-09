export function ExperienceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#C8A25A]/12">
      <div className="luxury-shimmer aspect-[4/3] w-full" />
      <div className="space-y-2.5 p-4">
        <div className="luxury-shimmer h-2.5 w-16 rounded" />
        <div className="luxury-shimmer h-5 w-4/5 rounded" />
        <div className="luxury-shimmer h-3 w-full rounded" />
        <div className="luxury-shimmer mt-3 h-8 w-full rounded" />
      </div>
    </div>
  );
}
