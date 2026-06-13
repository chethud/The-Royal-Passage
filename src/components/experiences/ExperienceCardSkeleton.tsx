export function ExperienceCardSkeleton() {
  return (
    <div className="flex aspect-[19/26] w-full flex-col overflow-hidden rounded-lg border border-[#C8A25A]/12">
      <div className="luxury-shimmer min-h-0 flex-[7] w-full" />
      <div className="flex min-h-0 flex-[3] flex-col justify-between p-4">
        <div className="luxury-shimmer h-5 w-4/5 rounded" />
        <div className="luxury-shimmer mt-3 h-9 w-full rounded-full" />
      </div>
    </div>
  );
}
